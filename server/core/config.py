import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    MONGO_URI = os.getenv('MONGO_URI')
    TMDB_API_KEY = os.getenv('TMDB_API_KEY')
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    TFIDF_MIN_DF = int(os.getenv('TFIDF_MIN_DF', 2))
    CORS_ORIGINS = os.getenv("CORS_ORIGINS")
settings = Settings()
