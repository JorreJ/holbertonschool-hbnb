import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI =  'sqlite:///devlopment.db'
    SQLALCHEMY_TRACK_MODIFICATION = False

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}