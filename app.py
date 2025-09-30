from flask import Flask, request
import uuid
import time

app = Flask(__name__)


@app.get('/health')
def health():
    return {'status': 'OK'}


USERS = {'alice@example.com': {'password': 'pass123', 'role': 'user'},
         'admin@example.com': {'password': 'admin123', 'role': 'admin'}}

TOKENS = {}

# bearer fcghjkhgfgtyhui


def require_bearer(req):
    auth = req.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ', 1)[1].strip()
    return TOKENS.get(token)


@app.post("/login")
def login():
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    user = USERS.get(email)
    if not user or user['password'] != password:
        return {'Error': 'Credentials are bad'}, 401
    tok = str(uuid.uuid4())
    TOKENS[tok] = {'email': email, 'role': user['role']}
    time.sleep(0.15)

    return {'token': tok, 'role': user['role']}


@app.get("/me")
def me():
    principals = require_bearer(request)
    if not principals:
        return {'Error': 'unauthorized'}, 401
    return {'email': principals['email'], 'role': principals['role']}


@app.get("/admin")
def admin():
    principals = require_bearer(request)
    if not principals:
        return {'error': 'unauthorized'}, 401

    if principals.get('role') != 'admin':
        return {'error': 'forbidden'}, 403

    return {'ok': True, 'secret': 'flag-123'}


@app.post('/change-password')
def change_password():
    # --- Auth (Bearer required) ---
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return {'error': 'unauthorized'}, 401
    old_token = auth.split(' ', 1)[1].strip()
    principals = TOKENS.get(old_token)
    if not principals:
        return {'error': 'unauthorized'}, 401

    # --- Parse & validate body ---
    data = request.get_json(silent=True) or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not isinstance(old_password, str) or not isinstance(new_password, str):
        return {'error': "Both 'old_password' and 'new_password' are required as strings."}, 400
    if len(new_password) < 6:
        return {'error': 'New password must be at least 6 characters.'}, 400
    if new_password == old_password:
        return {'error': 'New password must differ from old password.'}, 400

    email = principals['email']
    user = USERS.get(email)
    if not user or user['password'] != old_password:
        return {'error': 'Old password does not match.'}, 400

    # --- Update password ---
    USERS[email]['password'] = new_password

    # --- Token rotation: revoke old, issue new ---
    TOKENS.pop(old_token, None)
    new_token = str(uuid.uuid4())
    TOKENS[new_token] = {'email': email, 'role': 'user'}

    return {'token': new_token}, 200

    
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000)