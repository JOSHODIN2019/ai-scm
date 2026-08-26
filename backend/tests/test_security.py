from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_password_does_not_store_plaintext():
    hashed = hash_password("my-secret-password")
    assert hashed != "my-secret-password"
    assert hashed.startswith("$2b$")  # bcrypt hash format


def test_verify_password_roundtrip():
    hashed = hash_password("correct-horse-battery-staple")
    assert verify_password("correct-horse-battery-staple", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_access_token_roundtrip():
    token = create_access_token("user-id-123")
    assert decode_access_token(token) == "user-id-123"


def test_invalid_token_returns_none():
    assert decode_access_token("not-a-real-token") is None


def test_tampered_token_is_rejected():
    token = create_access_token("user-id-123")
    tampered = token[:-1] + ("A" if token[-1] != "A" else "B")
    assert decode_access_token(tampered) is None
