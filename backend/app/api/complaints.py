import uuid, shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Complaint, Attachment, User, AuditLog
from app.schemas import ComplaintIn, ComplaintOut, ComplaintUpdate, DashboardOut, AuditOut
from app.api.deps import current_user, require_roles
from app.services.ai import analyze
from app.services.ocr import extract_text
from app.core.config import settings
router=APIRouter(prefix="/complaints",tags=["Complaints"])
def audit(db, complaint_id, user_id, action, detail=""):
    db.add(AuditLog(complaint_id=complaint_id,user_id=user_id,action=action,detail=detail))
def find_duplicates(db, description, exclude=None):
    words=[x for x in description.lower().split() if len(x)>4][:5]
    if not words:return None
    q=db.query(Complaint).filter(or_(*[Complaint.description.ilike(f"%{w}%") for w in words]))
    if exclude:q=q.filter(Complaint.id!=exclude)
    candidate=q.order_by(Complaint.created_at.desc()).first()
    return candidate.id if candidate else None
def run_analysis(c,db):
    result=analyze(f"Title: {c.title}\nDescription: {c.description}")
    c.ai_summary=result["summary"]; c.risk_level=result["risk"] if result["risk"] in {"Low","Medium","High","Critical"} else "Medium"; c.root_cause=result["cause"]; c.capa_recommendation=result["capa"]; c.duplicate_of_id=find_duplicates(db,c.description,c.id)
@router.get("",response_model=list[ComplaintOut])
def list_complaints(status:str|None=None, search:str|None=None, db:Session=Depends(get_db), _:User=Depends(current_user)):
    q=db.query(Complaint).order_by(Complaint.created_at.desc())
    if status:q=q.filter(Complaint.status==status)
    if search:q=q.filter(or_(Complaint.title.ilike(f"%{search}%"),Complaint.reference.ilike(f"%{search}%"),Complaint.customer_name.ilike(f"%{search}%")))
    return q.all()
@router.post("",response_model=ComplaintOut,status_code=201)
def create(data:ComplaintIn,db:Session=Depends(get_db),user:User=Depends(current_user)):
    c=Complaint(reference=f"CMP-{uuid.uuid4().hex[:8].upper()}",created_by_id=user.id,**data.model_dump()); db.add(c); db.flush(); run_analysis(c,db); audit(db,c.id,user.id,"created",c.title); db.commit(); db.refresh(c); return c
@router.get("/dashboard/metrics",response_model=DashboardOut)
def dashboard(db:Session=Depends(get_db),_:User=Depends(current_user)):
    q=db.query(Complaint); return {"total":q.count(),"open":q.filter_by(status="Open").count(),"in_progress":q.filter_by(status="In Progress").count(),"resolved":q.filter_by(status="Resolved").count(),"critical":q.filter_by(risk_level="Critical").count(),"recent":q.order_by(Complaint.created_at.desc()).limit(5).all()}
@router.get("/audit/logs",response_model=list[AuditOut])
def audit_logs(db:Session=Depends(get_db),_:User=Depends(require_roles("admin","manager"))):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
@router.get("/{complaint_id}",response_model=ComplaintOut)
def get_one(complaint_id:int,db:Session=Depends(get_db),_:User=Depends(current_user)):
    c=db.get(Complaint,complaint_id)
    if not c:raise HTTPException(404,"Complaint not found")
    return c
@router.patch("/{complaint_id}",response_model=ComplaintOut)
def update(complaint_id:int,data:ComplaintUpdate,db:Session=Depends(get_db),_:User=Depends(current_user)):
    c=db.get(Complaint,complaint_id)
    if not c:raise HTTPException(404,"Complaint not found")
    changes=data.model_dump(exclude_unset=True)
    for k,v in changes.items(): setattr(c,k,v)
    run_analysis(c,db); audit(db,c.id,_.id,"updated",", ".join(changes)); db.commit(); db.refresh(c); return c
@router.delete("/{complaint_id}",status_code=204)
def delete(complaint_id:int,db:Session=Depends(get_db),_:User=Depends(require_roles("admin","manager"))):
    c=db.get(Complaint,complaint_id)
    if not c:raise HTTPException(404,"Complaint not found")
    audit(db,c.id,_.id,"deleted",c.reference); db.delete(c);db.commit()
@router.post("/{complaint_id}/attachments",response_model=ComplaintOut)
def upload(complaint_id:int,file:UploadFile=File(...),db:Session=Depends(get_db),_:User=Depends(current_user)):
    c=db.get(Complaint,complaint_id)
    if not c:raise HTTPException(404,"Complaint not found")
    if not file.filename or file.size and file.size>10*1024*1024:raise HTTPException(400,"File must be 10MB or less")
    allowed={"application/pdf","image/jpeg","image/png","text/plain"}
    if file.content_type not in allowed:raise HTTPException(400,"Only PDF, PNG, JPEG and text files are supported")
    settings.upload_path.mkdir(parents=True,exist_ok=True); stored=f"{uuid.uuid4().hex}_{Path(file.filename).name}"; path=settings.upload_path/stored
    with path.open("wb") as output: shutil.copyfileobj(file.file,output)
    text=extract_text(path,file.content_type); c.attachments.append(Attachment(filename=Path(file.filename).name,path=str(path),content_type=file.content_type,ocr_text=text));
    if text: c.description += "\n\nEvidence OCR:\n"+text[:4000]; run_analysis(c,db)
    audit(db,c.id,_.id,"attachment_uploaded",Path(file.filename).name)
    db.commit();db.refresh(c);return c
@router.post("/{complaint_id}/analyze",response_model=ComplaintOut)
def reanalyze(complaint_id:int,db:Session=Depends(get_db),_:User=Depends(current_user)):
    c=db.get(Complaint,complaint_id)
    if not c:raise HTTPException(404,"Complaint not found")
    run_analysis(c,db);audit(db,c.id,_.id,"ai_analysis_requested");db.commit();db.refresh(c);return c
@router.get("/{complaint_id}/timeline",response_model=list[AuditOut])
def timeline(complaint_id:int,db:Session=Depends(get_db),_:User=Depends(current_user)):
    if not db.get(Complaint,complaint_id): raise HTTPException(404,"Complaint not found")
    return db.query(AuditLog).filter_by(complaint_id=complaint_id).order_by(AuditLog.created_at.desc()).all()
