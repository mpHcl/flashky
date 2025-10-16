from fastapi import HTTPException
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()


def hash_password(password):
    """
    Hashes the given password using the SHA-512 algorithm.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.

    """
    hashedPassword = ph.hash(password)
    return hashedPassword


def verify_password(password_request, password_orig):
    try:
        ph.verify(password_request, password_orig)  # stored_hash, plain_password
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Wrong password")