def check_password(password: str) -> list[str]:
    """
    Check if password meets requirements
    Args:
        password (str): password string

    Returns:
        list[str]: list of errors, empty list if no errors
    """
    errors = []
    if not any(c.islower() for c in password):
        errors.append("Password should have at least one lowercase letter.")
        
    if not any(c.isupper() for c in password):
        errors.append("Password should have at least one uppercase letter.")
        
    if not any(c.isnumeric() for c in password):
        errors.append("Password should have at least one numeric value")
        
    if not any(c in r"!@#$%^&*()-_=+[{]};:'\",<.>/?`~\\|" for c in password):
        errors.append("Password should have at least one special character.")
    if len(password) < 8:
        errors.append("Password should have at least 8 characters.")
    
    return errors