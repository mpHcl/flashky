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
    """
    Perform application startup initialization.
    This function performs one-time initialization steps required before the application
    can handle requests. Currently it delegates to `init_db()` to ensure the database is
    ready, but it may be extended to include other startup tasks.
    """

    init_db()


@app.get("/")
def read_root(user_id=Depends(authenticate())):
    # ad hoc tests for auth
    return {"Hello": "World", "id": user_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    # ad hoc tests for auth
    return {"item_id": item_id, "q": q}
