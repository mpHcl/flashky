import hashlib


def hash_password(password):
    """
    Hashes the given password using the SHA-512 algorithm.

    Args:
        password (str): The password to be hashed.

    Returns:
        str: The hashed password.

    """
    hashedPassword = hashlib.sha512(password.encode("utf-8")).hexdigest()
    return hashedPassword
