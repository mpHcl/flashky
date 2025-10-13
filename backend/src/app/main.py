from typing import Union

from fastapi import FastAPI, Depends

from app.routers import authentication
from app.database import init_db
from app.tools.auth.authenticate import authenticate


app = FastAPI()

# Routers
app.include_router(authentication.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def read_root(user_id=Depends(authenticate())):
    return {"Hello": "World", "id": user_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
