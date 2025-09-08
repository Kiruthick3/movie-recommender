
import bcrypt, time, jwt
from flask import request, abort
from core.config import settings
from bson import ObjectId

ALG = 'HS256'

def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_pw(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def generate_token(uid):
    payload = {'sub': str(uid), 'iat': int(time.time())}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALG)

def parse_token():
    h = request.headers.get('Authorization', '')
    if not h.startswith('Bearer '):
        return None
    token = h.split(' ', 1)[1]
    try:
        data = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALG])
        return data
    except Exception:
        return None

def current_user_id():
    data = parse_token()
    if not data:
        abort(401)
    return ObjectId(data['sub'])

def auth_required(fn):
    def wrapper(*args, **kwargs):
        if not parse_token():
            abort(401)
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper
