from app.database import SessionLocal, Base, engine
from app.models import User, Complaint, AuditLog
from app.core.security import hash_password
def run():
    Base.metadata.create_all(engine); db=SessionLocal()
    if db.query(User).first(): return
    admin=User(email="admin@example.com",full_name="System Administrator",password_hash=hash_password("Admin123!"),role="admin"); agent=User(email="agent@example.com",full_name="Case Agent",password_hash=hash_password("Agent123!"),role="agent"); db.add_all([admin,agent]);db.flush()
    for title,desc,risk in [("Damaged delivery","The ordered device arrived damaged and unusable.","High"),("Invoice discrepancy","Customer reports duplicate invoice charge.","Medium"),("Safety concern","Product overheated during operation; no injuries reported.","Critical")]:
        c=Complaint(reference=f"SAMPLE-{len(title)}",title=title,description=desc,customer_name="Sample Customer",customer_email="customer@example.com",risk_level=risk,created_by_id=admin.id,ai_summary=desc,root_cause="Pending investigation",capa_recommendation="Assign owner and investigate");db.add(c);db.flush();db.add(AuditLog(complaint_id=c.id,user_id=admin.id,action="seeded",detail="Sample complaint"))
    db.commit();db.close()
if __name__=="__main__": run()
