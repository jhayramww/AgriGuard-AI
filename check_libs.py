libs = [
    'gtts', 'googletrans', 'deep_translator', 'speech_recognition', 
    'mysql.connector', 'pymysql', 'google.generativeai', 'flask', 
    'flask_sqlalchemy', 'openai', 'whisper', 'cv2', 'tensorflow', 'keras'
]

for lib in libs:
    try:
        __import__(lib)
        print(f"{lib}: Available")
    except ImportError as e:
        print(f"{lib}: NOT Available ({e})")
    except Exception as e:
        print(f"{lib}: Error on import ({e})")
