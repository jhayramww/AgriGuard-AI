import os
import pymysql
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'agriguard_secret_key_2026_btech')
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    TTS_FOLDER = os.path.join('static', 'tts')
    
    # Ensure directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(TTS_FOLDER, exist_ok=True)
    
    # API Keys
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')
    
    # Database Configuration
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '') # Empty default, user can fill in .env
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_NAME = os.environ.get('DB_NAME', 'agriguard')
    
    # Try MySQL first
    mysql_uri = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    sqlite_uri = "sqlite:///agriguard.db"
    
    # Check if MySQL is available and create database if needed
    MYSQL_AVAILABLE = False
    try:
        # Connect without db name first to create it
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            connect_timeout=3
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        conn.commit()
        cursor.close()
        conn.close()
        
        # Test connection with database name
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME,
            connect_timeout=3
        )
        conn.close()
        
        SQLALCHEMY_DATABASE_URI = mysql_uri
        MYSQL_AVAILABLE = True
        print(f"[*] AgriGuard AI: Connected to MySQL database '{DB_NAME}' successfully.")
    except Exception as e:
        print(f"[!] AgriGuard AI: MySQL connection failed: {e}")
        print("[*] AgriGuard AI: Falling back to SQLite database.")
        SQLALCHEMY_DATABASE_URI = sqlite_uri
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
