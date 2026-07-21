from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
class RegisterIn(BaseModel): email: EmailStr; full_name: str = Field(min_length=2, max_length=120); password: str = Field(min_length=8)
class LoginIn(BaseModel): email: EmailStr; password: str
class TokenOut(BaseModel): access_token: str; token_type: str = "bearer"
class UserOut(BaseModel): id:int; email:EmailStr; full_name:str; role:str
    
class ComplaintIn(BaseModel):
    title: str = Field(min_length=3, max_length=255); description: str = Field(min_length=5); customer_name: str; customer_email: EmailStr; category: str = "General"; priority: str = "Medium"; status: str = "Open"
class ComplaintUpdate(BaseModel):
    title: str|None=None; description: str|None=None; customer_name: str|None=None; customer_email: EmailStr|None=None; category: str|None=None; priority: str|None=None; status: str|None=None
class AttachmentOut(BaseModel): id:int; filename:str; content_type:str; ocr_text:str|None=None
class ComplaintOut(BaseModel):
    id:int; reference:str; title:str; description:str; customer_name:str; customer_email:EmailStr; category:str; status:str; priority:str; risk_level:str; ai_summary:str|None; root_cause:str|None; capa_recommendation:str|None; duplicate_of_id:int|None; created_at:datetime; updated_at:datetime; attachments:list[AttachmentOut]=[]
    class Config: from_attributes=True
class DashboardOut(BaseModel): total:int; open:int; in_progress:int; resolved:int; critical:int; recent:list[ComplaintOut]
class AuditOut(BaseModel):
    id:int; complaint_id:int|None; user_id:int|None; action:str; detail:str; created_at:datetime
    class Config: from_attributes=True
