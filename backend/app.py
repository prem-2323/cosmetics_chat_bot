from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from response import answer_question
from database import (
    login_user,
    create_session,
    save_message,
    get_history,
    get_conversation,
    delete_conversation
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CosmoGPT API", version="1.0.0")

# Enable CORS for cross-domain requests (Vercel frontend calling Render backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your Vercel domain once deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Pydantic models
class LoginRequest(BaseModel):
    google_id: str
    name: str
    email: str
    picture: str

class LoginResponse(BaseModel):
    user_id: str

class NewChatRequest(BaseModel):
    user_id: str

class NewChatResponse(BaseModel):
    session_id: str

class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    message: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

@app.get("/")
def home():
    return {"message": "CosmoGPT API Running"}

@app.post("/auth/login", response_model=LoginResponse)
def auth_login(request: LoginRequest):
    try:
        user_id = login_user(
            google_id=request.google_id,
            name=request.name,
            email=request.email,
            picture=request.picture
        )
        return LoginResponse(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/new", response_model=NewChatResponse)
def new_chat(request: NewChatRequest):
    try:
        session_id = create_session(request.user_id)
        return NewChatResponse(session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.session_id or not request.user_id:
        raise HTTPException(status_code=400, detail="session_id and user_id are required")
        
    try:
        # 1. Retrieve RAG answer using existing pipeline
        result = answer_question(request.message)
        
        # 2. Save user message in messages collection
        save_message(
            session_id=request.session_id,
            user_id=request.user_id,
            role="user",
            content=request.message
        )
        
        # 3. Save assistant message in messages collection
        save_message(
            session_id=request.session_id,
            user_id=request.user_id,
            role="assistant",
            content=result["answer"],
            sources=result["sources"]
        )
        
        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def chat_history(user_id: str):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    try:
        return get_history(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{session_id}")
def chat_conversation(session_id: str):
    try:
        return get_conversation(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history/{session_id}")
def delete_chat(session_id: str):
    try:
        delete_conversation(session_id)
        return {"status": "success", "message": f"Deleted session {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
