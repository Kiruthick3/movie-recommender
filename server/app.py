from flask import Flask, jsonify
from flask_cors import CORS
from core.config import settings
from core.db import mongo

from auth.routes import auth_bp
from movies.routes import movies_bp
from users.routes import users_bp

import os
import nltk

nltk_data_path = os.path.join(os.path.dirname(__file__), 'nltk_data')
nltk.data.path.insert(0, nltk_data_path)

try:
    nltk.corpus.wordnet.ensure_loaded()
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    raise RuntimeError(
        "NLTK corpora not found in server/nltk_data folder. "
        "Make sure 'wordnet' and 'vader_lexicon' are present."
    )


def create_app():
    app = Flask(__name__)
    CORS(
        app, 
        resources={r"/api/*": {"origins": settings.CORS_ORIGINS}}, 
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
        )
    app.config['MONGO_URI'] = settings.MONGO_URI
    app.config['SECRET_KEY'] = settings.SECRET_KEY

    mongo.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(users_bp, url_prefix='/api/user')

    @app.get('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    return app

app = create_app()

