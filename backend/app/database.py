from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config

DB_USER = config("DB_USER", default="root")
DB_PASSWORD = config("DB_PASSWORD", default="your_password")
DB_HOST = config("DB_HOST", default="localhost")
DB_PORT = config("DB_PORT", default="3306")
DB_NAME = config("DB_NAME", default="drone_survey_db")

SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() 