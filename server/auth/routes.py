from flask import Blueprint, request, jsonify
from core.db import col
from utils.security import hash_pw, verify_pw, generate_token
from bson import ObjectId
from core.config import settings

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/signup')
def signup():
    try:
        j = request.get_json(force=True)
        email = j.get('email')
        password = j.get('password')
        name = j.get('name', '')

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        if col('users').find_one({'email': email}):
            return jsonify({"error": "User already exists"}), 409

        uid = col('users').insert_one({
            'email': email,
            'password_hash': hash_pw(password),
            'name': name
        }).inserted_id

        token = generate_token(str(uid))
        return jsonify({"token": token}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.post('/login')
def login():
    try:
        j = request.get_json(force=True)
        email = j.get('email')
        password = j.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        u = col('users').find_one({'email': email})
        if not u or not verify_pw(password, u.get('password_hash', '')):
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_token(str(u['_id']))
        return jsonify({"token": token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
