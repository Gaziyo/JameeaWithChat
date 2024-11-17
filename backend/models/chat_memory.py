from typing import List, Dict
import json
from datetime import datetime
import aiofiles
import os

class ChatMemory:
    def __init__(self, storage_dir: str = "storage"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)

    def _get_user_file(self, user_id: str) -> str:
        return os.path.join(self.storage_dir, f"{user_id}_chat_history.json")

    async def _load_user_memory(self, user_id: str) -> List[Dict]:
        file_path = self._get_user_file(user_id)
        try:
            async with aiofiles.open(file_path, 'r') as f:
                content = await f.read()
                return json.loads(content)
        except FileNotFoundError:
            return []

    async def _save_user_memory(self, user_id: str, messages: List[Dict]):
        file_path = self._get_user_file(user_id)
        async with aiofiles.open(file_path, 'w') as f:
            await f.write(json.dumps(messages, indent=2))

    async def add_message(self, user_id: str, message: Dict):
        messages = await self._load_user_memory(user_id)
        
        # Add unique message ID if not present
        if 'id' not in message:
            message['id'] = f"{len(messages) + 1}_{datetime.now().timestamp()}"
        
        # Ensure timestamp is present
        if 'timestamp' not in message:
            message['timestamp'] = datetime.now().isoformat()
            
        messages.append(message)
        await self._save_user_memory(user_id, messages)

    async def get_chat_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        messages = await self._load_user_memory(user_id)
        return messages[-limit:]

    async def clear_history(self, user_id: str):
        await self._save_user_memory(user_id, [])