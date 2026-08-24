import sqlite3

def migrate():
    conn = sqlite3.connect('finassist.db')
    c = conn.cursor()
    
    # Try to create chat_sessions table in case Base.metadata.create_all didn't run yet
    try:
        c.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title VARCHAR DEFAULT 'New Conversation',
                created_at VARCHAR NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        print("Ensured chat_sessions exists.")
    except Exception as e:
        print(f"Error creating chat_sessions: {e}")
        
    # Check if session_id column exists
    c.execute("PRAGMA table_info(chat_messages)")
    columns = [info[1] for info in c.fetchall()]
    
    if "session_id" not in columns:
        print("Adding session_id to chat_messages...")
        # Since it's existing data without sessions, we just add it as nullable first or with default 0
        c.execute("ALTER TABLE chat_messages ADD COLUMN session_id INTEGER DEFAULT 0")
        print("Added session_id.")
    else:
        print("session_id already exists in chat_messages.")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
