from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ok"}

class OTPRequest(BaseModel):
    aadhaar: str
    otp: str

@app.post("/verify-otp")
def verify_otp(data: OTPRequest):
    if data.otp == "1234":
        return {"abha_id": "ABHA-12345"}
    return {"error": "Invalid OTP"}

class ProfileRequest(BaseModel):
    name: str
    abha_id: str
    blood_group: str
    allergies: str
    conditions: str
    medications: str

@app.post("/profile")
def save_profile(data: ProfileRequest, db: Session = Depends(get_db)):
    new_user = models.User(**data.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id}