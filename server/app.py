from flask import Flask, jsonify
from flask_cors import CORS
from core.config import settings
from core.db import mongo

from auth.routes import auth_bp
from movies.routes import movies_bp
from users.routes import users_bp

import nltk
nltk.download('wordnet')
nltk.download('omw-1.4')  
nltk.download('vader_lexicon')

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

