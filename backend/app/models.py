from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True); email: Mapped[str]=mapped_column(String(255), unique=True, index=True); full_name: Mapped[str]=mapped_column(String(120)); password_hash: Mapped[str]=mapped_column(String(255)); role: Mapped[str]=mapped_column(String(30), default="agent"); created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
class Complaint(Base):
    __tablename__="complaints"
    id: Mapped[int]=mapped_column(primary_key=True); reference: Mapped[str]=mapped_column(String(32), unique=True, index=True); title: Mapped[str]=mapped_column(String(255)); description: Mapped[str]=mapped_column(Text); customer_name: Mapped[str]=mapped_column(String(150)); customer_email: Mapped[str]=mapped_column(String(255)); category: Mapped[str]=mapped_column(String(80), default="General"); status: Mapped[str]=mapped_column(String(30), default="Open"); priority: Mapped[str]=mapped_column(String(30), default="Medium"); risk_level: Mapped[str]=mapped_column(String(30), default="Unknown"); ai_summary: Mapped[str|None]=mapped_column(Text, nullable=True); root_cause: Mapped[str|None]=mapped_column(Text, nullable=True); capa_recommendation: Mapped[str|None]=mapped_column(Text, nullable=True); duplicate_of_id: Mapped[int|None]=mapped_column(ForeignKey("complaints.id"), nullable=True); created_by_id: Mapped[int]=mapped_column(ForeignKey("users.id")); created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow); updated_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    attachments = relationship("Attachment", back_populates="complaint", cascade="all, delete-orphan")
class Attachment(Base):
    __tablename__="attachments"
    id: Mapped[int]=mapped_column(primary_key=True); complaint_id: Mapped[int]=mapped_column(ForeignKey("complaints.id")); filename: Mapped[str]=mapped_column(String(255)); path: Mapped[str]=mapped_column(String(500)); content_type: Mapped[str]=mapped_column(String(100)); ocr_text: Mapped[str|None]=mapped_column(Text, nullable=True); created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
    complaint=relationship("Complaint", back_populates="attachments")
class AuditLog(Base):
    __tablename__="audit_logs"
    id: Mapped[int]=mapped_column(primary_key=True); complaint_id: Mapped[int|None]=mapped_column(ForeignKey("complaints.id"),nullable=True,index=True); user_id: Mapped[int|None]=mapped_column(ForeignKey("users.id"),nullable=True); action: Mapped[str]=mapped_column(String(100)); detail: Mapped[str]=mapped_column(Text,default=""); created_at: Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow,index=True)
