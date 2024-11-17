from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np
from typing import List, Dict
import os

class VectorStore:
    def __init__(self):
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = "documents"
        self.setup_collection()

    def setup_collection(self):
        try:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=768,  # BERT embeddings size
                    distance=models.Distance.COSINE
                ),
            )
        except Exception:
            pass  # Collection already exists

    async def store_document(self, 
        user_id: str,
        document_id: str,
        embeddings: List[float],
        metadata: Dict
    ):
        # Store document embeddings with metadata
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=document_id,
                    vector=embeddings,
                    payload={
                        "user_id": user_id,
                        "document_id": document_id,
                        **metadata
                    }
                )
            ]
        )

    async def search(self, 
        user_id: str,
        query_vector: List[float],
        limit: int = 5
    ) -> List[Dict]:
        # Search for similar documents within user's scope
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="user_id",
                        match=models.MatchValue(value=user_id)
                    )
                ]
            ),
            limit=limit
        )
        
        return [{
            "id": hit.id,
            "score": hit.score,
            "metadata": hit.payload
        } for hit in results]

    async def delete_document(self, document_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.PointIdsList(
                points=[document_id]
            )
        )

    async def delete_user_documents(self, user_id: str):
        # Delete all documents for a specific user
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_id",
                            match=models.MatchValue(value=user_id)
                        )
                    ]
                )
            )
        )