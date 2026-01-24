import os
import jwt

from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, Header
from sqlmodel import Session

from app.database import get_session
from ...models import ExpireTokens


def get_secret_key():
    return os.getenv("AUTH_KEY")


def get_token_handler(authorization: str = Header(...)):
    """
    Extracts the JWT token from the Authorization header.

    Args:
        authorization (str): The Authorization header value, expected in the format 'Bearer <token>'.

    Returns:
        str: The extracted JWT token.

    Raises:
        HTTPException: (401) If the Authorization header is missing or not in the expected format.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    token = authorization.split("Bearer ")[1]
    return token


def invalidate_token(
    token: str = Depends(get_token_handler), db: Session = Depends(get_session)
):
    """
    Invalidates a JWT token by storing its value and expiration date in the database.

    Args:
        token (str): The JWT token to invalidate, provided by dependency injection.
        db (Session): The database session, provided by dependency injection.

    Returns:
        str: The invalidated token.

    Side Effects:
        Adds an ExpireTokens record to the database and commits the transaction.
    """
    expiration_timestamp = decode_token(token)["exp"]
    expiration_date = datetime.fromtimestamp(expiration_timestamp, tz=timezone.utc)
    expire_token = ExpireTokens(token_value=token, expiration_date=expiration_date)
    db.add(expire_token)
    db.commit()

    return token


def generate_token(user_id: str):
    """
    Generates a JWT token for the given user ID.

    Args:
        user_id (str): The ID of the user.

    Returns:
        str: The generated JWT token.
    """
    payload = {
        "exp": datetime.utcnow() + timedelta(days=1),
        "iat": datetime.utcnow(),
        "sub": user_id,
    }
    print(user_id)
    token = jwt.encode(payload, get_secret_key(), algorithm="HS256")
    return token


def decode_token(token):
    """
    Retrieves the payload from the given JWT token.

    Args:
        token (str): The JWT token to decode.

    Returns:
        str: The user ID extracted from the token.

    Raises:
        HTTPException: (401) If the token has expired, returns 'Signature expired. Please log in again.'
        HTTPException: (401) If the token is invalid, returns 'Invalid token. Please log in again.'
    """
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Login expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_id_from_token(token: str):
    """
    Extracts and returns the user ID ('sub' claim) from a JWT token.
    Args:
        token (str): The JWT token string.
    Returns:
        Any: The value of the 'sub' claim from the decoded token, typically the user ID.
    Raises:
        HTTPException: (401) If the token is invalid or the expired claim is missing.
    """
    return decode_token(token)["sub"]
