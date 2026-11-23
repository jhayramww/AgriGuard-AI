import pymysql

def test_connection():
    # Try typical local development credentials
    configs = [
        {"host": "localhost", "user": "root", "password": ""},
        {"host": "localhost", "user": "root", "password": "root"},
        {"host": "localhost", "user": "root", "password": "admin"},
        {"host": "localhost", "user": "root", "password": "password"},
        {"host": "localhost", "user": "root", "password": "1234"},
        {"host": "localhost", "user": "root", "password": "123456"},
        {"host": "localhost", "user": "root", "password": "mysql"},
        {"host": "localhost", "user": "root", "password": "root123"},
    ]
    
    for config in configs:
        try:
            conn = pymysql.connect(**config)
            print(f"Connected successfully with {config}")
            cursor = conn.cursor()
            cursor.execute("SHOW DATABASES")
            dbs = [row[0] for row in cursor.fetchall()]
            print("Databases:", dbs)
            conn.close()
            return True
        except Exception as e:
            print(f"Failed with {config}: {e}")
    return False

if __name__ == '__main__':
    test_connection()
