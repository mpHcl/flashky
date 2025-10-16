import pytest
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException

from app.api.v1.routes.auth_utils import (
    SECRET_KEY,
    get_token_handler,
    invalidate_token,
    generate_token,
    decode_token,
    get_id_from_token,
)
from ...models import ExpireTokens


# ---------- Fixtures ----------

@pytest.fixture
def mock_db(mocker):
    """Mock database session with add() and commit() methods."""
    db = mocker.MagicMock()
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


# ---------- Tests for generate_token and decode_token ----------

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


# ---------- Tests for get_id_from_token ----------

def test_get_id_from_token(sample_token, sample_user_id):
    user_id = get_id_from_token(sample_token)
    assert user_id == sample_user_id


# ---------- Tests for invalidate_token ----------

def test_invalidate_token_adds_to_db(mocker, mock_db, sample_token):
    # Mock decode_token to return a fake exp timestamp
    fake_payload = {
        "exp": datetime.now(tz=timezone.utc).timestamp(),
        "sub": "user123"
    }
    mocker.patch("app.api.v1.routes.auth_utils.decode_token", return_value=fake_payload)

    # Run function
    result = invalidate_token(sample_token, mock_db)

    # Check DB operations
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

    # Validate result
    assert isinstance(mock_db.add.call_args[0][0], ExpireTokens)
    assert result == sample_token