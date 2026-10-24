import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parent.parent / "data" / "app.db"

def con():
    DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init():
    c = con()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS chats(
      id INTEGER PRIMARY KEY, character_id TEXT, title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS messages(
      id INTEGER PRIMARY KEY, chat_id INTEGER, role TEXT, content TEXT,
      emotion TEXT DEFAULT 'neutral', created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS battles(
      id INTEGER PRIMARY KEY, fighter_a TEXT, fighter_b TEXT, result TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS saved_battles(
      id INTEGER PRIMARY KEY, state_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    c.commit(); c.close()

def chats():
    c=con(); r=c.execute("SELECT * FROM chats ORDER BY updated_at DESC, id DESC").fetchall(); c.close(); return [dict(x) for x in r]

def chat(i):
    c=con(); a=c.execute("SELECT * FROM chats WHERE id=?",(i,)).fetchone(); b=c.execute("SELECT * FROM messages WHERE chat_id=? ORDER BY id",(i,)).fetchall(); c.close()
    return {"chat":dict(a) if a else None,"messages":[dict(x) for x in b]}

def new(cid,title):
    c=con(); x=c.execute("INSERT INTO chats(character_id,title) VALUES(?,?)",(cid,title)); c.commit(); i=x.lastrowid; c.close(); return i

def add(i,role,text,emotion="neutral"):
    c=con(); c.execute("INSERT INTO messages(chat_id,role,content,emotion) VALUES(?,?,?,?)",(i,role,text,emotion)); c.execute("UPDATE chats SET updated_at=CURRENT_TIMESTAMP WHERE id=?",(i,)); c.commit(); c.close()

def delete_chat(i):
    c=con(); c.execute("DELETE FROM messages WHERE chat_id=?",(i,)); c.execute("DELETE FROM chats WHERE id=?",(i,)); ok=c.total_changes>0; c.commit(); c.close(); return ok

def save_battle(state_json):
    c=con(); x=c.execute("INSERT INTO saved_battles(state_json) VALUES(?)",(state_json,)); c.commit(); i=x.lastrowid; c.close(); return i

def saved_battles():
    c=con(); r=c.execute("SELECT * FROM saved_battles ORDER BY updated_at DESC,id DESC").fetchall(); c.close(); return [dict(x) for x in r]

def get_saved_battle(i):
    c=con(); r=c.execute("SELECT * FROM saved_battles WHERE id=?",(i,)).fetchone(); c.close(); return dict(r) if r else None

def delete_saved_battle(i):
    c=con(); c.execute("DELETE FROM saved_battles WHERE id=?",(i,)); ok=c.total_changes>0; c.commit(); c.close(); return ok
