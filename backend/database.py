import os
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://mod:23-Sep-06@mod.mkykuwm.mongodb.net/"

# Setup connection to CosmeticsBot database
client = MongoClient(MONGO_URI)
db = client["CosmeticsBot"]

users_col = db["users"]
sessions_col = db["chat_sessions"]
messages_col = db["messages"]

def login_user(google_id: str, name: str, email: str, picture: str) -> str:
    """Store or update user profile from Google Sign-In and return user_id string."""
    now = datetime.utcnow()
    user_doc = users_col.find_one({"google_id": google_id})
    
    if user_doc:
        users_col.update_one(
            {"google_id": google_id},
            {
                "$set": {
                    "name": name,
                    "email": email,
                    "picture": picture,
                    "last_login": now
                }
            }
        )
        return str(user_doc["_id"])
    else:
        new_user = {
            "google_id": google_id,
            "name": name,
            "email": email,
            "picture": picture,
            "created_at": now,
            "last_login": now
        }
        res = users_col.insert_one(new_user)
        return str(res.inserted_id)

def create_session(user_id: str) -> str:
    """Create a new chat session linked to user_id and return session_id string."""
    now = datetime.utcnow()
    session_doc = {
        "user_id": ObjectId(user_id),
        "title": "New Chat",
        "created_at": now,
        "updated_at": now,
        "last_message": "",
        "message_count": 0
    }
    res = sessions_col.insert_one(session_doc)
    return str(res.inserted_id)

def save_message(session_id: str, user_id: str, role: str, content: str, sources: list = None) -> None:
    """Save a chat message to messages collection and update session metadata."""
    now = datetime.utcnow()
    
    # Save the message document
    message_doc = {
        "session_id": ObjectId(session_id),
        "user_id": ObjectId(user_id),
        "role": role,
        "content": content,
        "sources": sources or [],
        "timestamp": now
    }
    messages_col.insert_one(message_doc)
    
    # Update session summary info
    session = sessions_col.find_one({"_id": ObjectId(session_id)})
    if not session:
        return
        
    updates = {
        "$set": {
            "updated_at": now,
            "last_message": content[:100] + ("..." if len(content) > 100 else "")
        },
        "$inc": {
            "message_count": 1
        }
    }
    
    # Automatic title generation on the user's first query
    if role == "user" and (session.get("message_count", 0) == 0 or session.get("title") == "New Chat"):
        title_text = content.strip().replace("\n", " ")
        session_title = title_text[:35].strip() + ("..." if len(title_text) > 35 else "")
        updates["$set"]["title"] = session_title
        
    sessions_col.update_one({"_id": ObjectId(session_id)}, updates)

def get_history(user_id: str) -> list:
    """Retrieve all chat sessions for a specific user sorted by latest activity."""
    sessions = sessions_col.find({"user_id": ObjectId(user_id)}).sort("updated_at", -1)
    
    history_list = []
    for s in sessions:
        updated_at_val = s.get("updated_at")
        updated_at_str = updated_at_val.isoformat() + "Z" if isinstance(updated_at_val, datetime) else datetime.utcnow().isoformat() + "Z"
        
        history_list.append({
            "session_id": str(s["_id"]),
            "title": s.get("title", "New Chat"),
            "updated_at": updated_at_str,
            "last_message": s.get("last_message", ""),
            "message_count": s.get("message_count", 0)
        })
    return history_list

def get_conversation(session_id: str) -> list:
    """Retrieve all messages for a session sorted by timestamp ascending."""
    messages = messages_col.find({"session_id": ObjectId(session_id)}).sort("timestamp", 1)
    
    convo = []
    for m in messages:
        convo.append({
            "role": m["role"],
            "content": m["content"],
            "sources": m.get("sources", [])
        })
    return convo

def delete_conversation(session_id: str) -> None:
    """Delete a chat session and all associated messages."""
    sessions_col.delete_one({"_id": ObjectId(session_id)})
    messages_col.delete_many({"session_id": ObjectId(session_id)})
