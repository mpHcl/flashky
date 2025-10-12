from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Header
from fastapi.security import OAuth2PasswordBearer
import jwt

SECRET_KEY = 'some key'


def get_token_handler(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    token = authorization.split("Bearer ")[1]
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
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': user_id
    }
    print(user_id)
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


def get_id_from_token(token: str = Depends(get_token_handler)):
    """
    Retrieves the user ID from the given JWT token.

    Args:
        token (str): The JWT token to decode.

    Returns:
        str: The user ID extracted from the token.

    Raises:
        str: If the token has expired, returns 'Signature expired. Please log in again.'
        str: If the token is invalid, returns 'Invalid token. Please log in again.'
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Login expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")