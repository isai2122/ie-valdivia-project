from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ie_valdivia')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    image: Optional[str] = None
    type: Optional[str] = 'image'
    likes: int = 0
    comments: List = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    title: str
    description: str
    category: str
    image: Optional[str] = None
    type: Optional[str] = 'image'

@api_router.post("/posts", response_model=Post)
async def create_post(post_in: PostCreate):
    try:
        post_data = post_in.dict()
        post = Post(**post_data)
        await db.posts.insert_one(post.dict())
        return post
    except Exception as e:
        logging.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while creating post.")

@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    posts = await db.posts.find().sort("createdAt", -1).to_list(1000)
    return [Post(**post) for post in posts]

@api_router.put("/posts/{post_id}", response_model=Post)
async def update_post(post_id: str, post_in: PostCreate):
    existing_post = await db.posts.find_one({"id": post_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post_in.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow() # Update timestamp
    
    await db.posts.update_one({"id": post_id}, {"$set": update_data})
    updated_post = await db.posts.find_one({"id": post_id})
    return Post(**updated_post)

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    delete_result = await db.posts.delete_one({"id": post_id})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
