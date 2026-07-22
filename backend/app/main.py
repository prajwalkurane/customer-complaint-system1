from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.seed import run as seed_data

Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI(title="AI Complaint Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router, prefix="/api")
app.include_router(complaints_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}