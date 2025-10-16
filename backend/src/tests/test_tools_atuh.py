import pytest
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException

from app.tools.auth.authenticate import authenticate
from app.tools.auth.jwt_handler import (
    SECRET_KEY,
    get_token_handler,
    invalidate_token,
    generate_token,
    decode_token,
    get_id_from_token,
)
from app.tools.auth.hash import hash_password, verify_password
from app.models import ExpireTokens

from argon2 import PasswordHasher

# ---------- Fixtures ----------


@pytest.fixture(autouse=True)
def mock_db(mocker):
    """Automatically mock the database for all tests"""
    db = mocker.MagicMock()
    mocker.patch("app.database.get_session", return_value=db)
    return db


@pytest.fixture
def sample_user_id():
    return "user123"


@pytest.fixture
def sample_token(sample_user_id):
    """Valid token generated from the tested function."""
    return generate_token(sample_user_id)


# ---------- Tests for get_token_handler ----------


def test_get_token_handler_valid():
    # Arrange
    header = "Bearer my.jwt.token"
    # Act
    token = get_token_handler(header)
    # Assert
    assert token == "my.jwt.token"


def test_get_token_handler_invalid_format():
    invalid_header = "InvalidHeader"

    with pytest.raises(HTTPException) as exc:
        get_token_handler(invalid_header)

    assert exc.value.status_code == 401
    assert "Invalid Authorization header" in exc.value.detail


# ---------- Tests for jwt_handler----------


def test_generate_and_decode_token(sample_user_id):
    token = generate_token(sample_user_id)

    payload = decode_token(token)

    assert payload["sub"] == sample_user_id
    assert "exp" in payload
    assert "iat" in payload


def test_decode_token_expired():
    expired_payload = {
        "exp": datetime.utcnow() - timedelta(seconds=1),
        "iat": datetime.utcnow() - timedelta(days=1),
        "sub": "user123",
    }
    token = jwt.encode(expired_payload, SECRET_KEY, algorithm="HS256")

    with pytest.raises(HTTPException) as exc:
        decode_token(token)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Login expired"


def test_decode_token_invalid():
    invalid_token = "not.a.valid.token"

    with pytest.raises(HTTPException) as exc:
        decode_token(invalid_token)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invalid token"


def test_get_id_from_token(sample_token, sample_user_id):
    user_id = get_id_from_token(sample_token)
    assert user_id == sample_user_id


def test_invalidate_token_adds_to_db(mocker, mock_db, sample_token):
    # Mock decode_token to return a fake exp timestamp
    fake_payload = {"exp": datetime.now(tz=timezone.utc).timestamp(), "sub": "user123"}
    mocker.patch("app.tools.auth.jwt_handler.decode_token", return_value=fake_payload)

    # Run function
    result = invalidate_token(sample_token, mock_db)

    # Check DB operations
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

    # Validate result
    assert isinstance(mock_db.add.call_args[0][0], ExpireTokens)
    assert result == sample_token


# ---------- Tests for hash_password----------


def test_hash_password(mocker, mock_db, sample_token):
    # Arrange
    password = "MySecurePassword123"
    ph = PasswordHasher()
    hashedPassword = ph.hash(password)

    # Act
    result = hash_password(password)

    # Assert
    assert result.startswith("$argon2")
    assert ph.verify(result, password)
    assert isinstance(result, str)


def test_verify_password_success():
    # Arrange
    ph = PasswordHasher()
    plain_password = "correct_password"
    stored_hash = ph.hash(plain_password)

    # Act & Assert (should not raise)
    verify_password(stored_hash, plain_password)


def test_verify_password_failure():
    # Arrange
    plain_password = "wrong_password"
    ph = PasswordHasher()
    stored_hash = ph.hash("correct_password")

    # Act & Assert (should raise HTTPException)
    with pytest.raises(HTTPException) as exc_info:
        verify_password(stored_hash, plain_password)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Wrong password"


# ---------- Tests for authenticate----------


def test_authenticate_valid_token(mocker):
    # Arrange
    dependency = authenticate()
    mock_db = mocker.MagicMock()
    mock_db.query().filter().first.return_value = None

    mocker.patch(
        "app.tools.auth.jwt_handler.decode_token", return_value={"sub": "user123"}
    )

    # Act
    user_id = dependency(token="valid_token", db=mock_db)

    # Assert
    assert user_id == "user123"
    mock_db.query().filter().first.assert_called_once()


def test_authenticate_invalid_token_in_db(mocker):
    # Arrange
    dependency = authenticate()
    mock_db = mocker.MagicMock()
    mock_db.query().filter().first.return_value = ExpireTokens(
        token_value="expired", expiration_date=None
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        dependency(token="expired", db=mock_db)

    assert exc.value.status_code == 401
    assert "Invalid token" in exc.value.detail


def test_authenticate_with_roles_not_implemented(mocker):
    # Arrange
    dependency = authenticate(roles=["admin"])
    mock_db = mocker.MagicMock()
    mock_db.query().filter().first.return_value = None

    mocker.patch(
        "app.tools.auth.jwt_handler.decode_token", return_value={"sub": "user123"}
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        dependency(token="valid_token", db=mock_db)

    assert exc.value.status_code == 404
    assert "Not implemented yet" in exc.value.detail
