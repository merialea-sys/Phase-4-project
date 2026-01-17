import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

application = Flask(__name__)

application.secret_key = os.environ.get('SECRET_KEY') or 'dev-key-for-local-testing-only'
application.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///banking_app.db'
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

application.config['SESSION_COOKIE_HTTPONLY'] = True
application.config['SESSION_COOKIE_SECURE'] = False

db = SQLAlchemy(application)
migrate = Migrate(application, db)
api = Api(application)

CORS(application, supports_credentials=True)