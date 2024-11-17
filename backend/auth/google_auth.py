from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException
from typing import Dict

class GoogleAuth:
    def __init__(self, client_id: str):
        self.client_id = client_id

    async def verify_token(self, token: str) -> Dict:
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), self.client_id
            )
            return {
                "email": idinfo["email"],
                "name": idinfo.get("name", ""),
                "picture": idinfo.get("picture", "")
            }
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid token")