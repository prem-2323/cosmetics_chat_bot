from fastapi import FastAPI
from pydantic import BaseModel
from response import answer_question

app = FastAPI(title="CosmoGPT API", version="1.0.0")

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]

@app.get("/")
def home():
    return {"message": "CosmoGPT API Running"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = answer_question(request.question)
    return ChatResponse(answer=result["answer"], sources=result["sources"])
