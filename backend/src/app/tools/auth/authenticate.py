from fastapi import HTTPException, Depends
from sqlmodel import Session
from typing import Optional, List

from app.database import get_session
from ...models import ExpireTokens, User
from .jwt_handler import get_id_from_token, get_token_handler


def authenticate(roles: Optional[List[str]] = None):
    """
    Creates a FastAPI dependency for JWT authentication and (future) role-based authorization.

    Args:
        roles (Optional[List[str]], optional): List of required user roles for authorization. If None, only authentication is performed.

    Returns:
        Callable: A dependency function that validates the JWT token, checks for expiration, and extracts the user ID. If roles are specified, raises a 404 error (role-based authorization not implemented yet).

    Raises:
        HTTPException: (401) If the token is found in the expired tokens table (invalid token).
        HTTPException: (403) If user does not have requested role.
    """

    def dependency(
        token: str = Depends(get_token_handler), db: Session = Depends(get_session)
    ):
        """
        Dependency function for validating JWT tokens and extracting user ID.

        Args:
            token (str): JWT token extracted via dependency injection.
            db (Session): SQLAlchemy database session injected via dependency.

        Raises:
            HTTPException:
                - 401 if the token is found in the expired tokens table (invalid token) 
                    or user does not exist in the database.
                - 403 if user does not have requested role.

        Returns:
            int: The user ID extracted from the token if roles are not specified.

        Notes:
            - Role-based authorization is not implemented yet.
            - Future implementation should check user roles against required roles.
        """
        token_entry = (
            db.query(ExpireTokens).filter(ExpireTokens.token_value == token).first()
        )
        if token_entry:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = get_id_from_token(token=token)

        if type(user_id) is str:
            user_id = int(user_id)

        if roles == None:
            return user_id
        else:
            user = db.query(User).filter(User.id == user_id).first()

            if user is None:
                raise HTTPException(status_code=401, detail="Unauthorized")

            if user.roles is None:
                raise HTTPException(status_code=403, detail="Insufficient permissions")

            roles_str = [role.name for role in user.roles]

            for role in roles:
                if role not in roles_str:
                    raise HTTPException(
                        status_code=403, detail="Insufficient permissions"
                    )

            return user_id

    return dependency
