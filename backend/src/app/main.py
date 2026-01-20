from typing import Union

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles

from app.routers import authentication, decks, flashcards, media, learn, comments, reports, users
from app.tools.auth.authenticate import authenticate
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Routers
app.include_router(authentication.router)
app.include_router(decks.router)
app.include_router(flashcards.router)
app.include_router(media.router)
app.include_router(learn.router)
app.include_router(comments.router)
app.include_router(reports.router)
app.include_router(users.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", 'http://127.0.0.1:3000'],  # or ["*"] for all origins (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory="./files"), name="files")