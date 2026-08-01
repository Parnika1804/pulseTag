from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    abha_id = Column(String)
    blood_group = Column(String)
    allergies = Column(String)
    conditions = Column(String)
    medications = Column(String)
    phone = Column(String)