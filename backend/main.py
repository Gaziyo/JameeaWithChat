from fastapi import FastAPI, UploadFile, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import uvicorn
from typing import List
import json
import asyncio
from datetime import datetime
import os
from models.llama_handler import LLaMAHandler
from models.speech_handler import SpeechHandler
from models.document_processor import DocumentProcessor
from models.vector_store import VectorStore
from models.chat_memory import ChatMemory
from auth.google_auth import GoogleAuth
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize components
llama = LLaMAHandler()
speech = SpeechHandler()
doc_processor = DocumentProcessor()
vector_store = VectorStore()
chat_memory = ChatMemory()
google_auth = GoogleAuth(os.getenv("GOOGLE_CLIENT_ID"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

manager = ConnectionManager()

@app.get("/chat-history/{user_id}")
async def get_chat_history(user_id: str):
    history = await chat_memory.get_chat_history(user_id)
    return {"history": history}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    
    # Send chat history when connecting
    history = await chat_memory.get_chat_history(user_id)
    await websocket.send_json({"type": "history", "messages": history})
    
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            
            # Store user message
            user_message = {
                "role": "user",
                "content": data["content"],
                "type": data.get("type", "text"),
                "timestamp": datetime.now().isoformat()
            }
            await chat_memory.add_message(user_id, user_message)
            
            # Generate and store AI response
            response = await llama.generate_text_response(data["content"])
            ai_message = {
                "role": "assistant",
                "content": response,
                "timestamp": datetime.now().isoformat()
            }
            
            if data.get("type") == "audio":
                audio_response = await speech.text_to_speech(response)
                ai_message["type"] = "audio"
                ai_message["audioUrl"] = f"data:audio/wav;base64,{audio_response}"
                
            await chat_memory.add_message(user_id, ai_message)
            await websocket.send_json(ai_message)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.post("/clear-history/{user_id}")
async def clear_chat_history(user_id: str):
    await chat_memory.clear_history(user_id)
    return {"status": "success"}