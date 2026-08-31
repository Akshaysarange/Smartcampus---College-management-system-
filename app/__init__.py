import os

from flask import Flask

from config import Config
from app.extensions import mysql, csrf

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))


def create_app(config_class=Config):
    app = Flask(
        __name__,
        template_folder=os.path.join(basedir, "templates"),
        static_folder=os.path.join(basedir, "static"),
    )
    app.config.from_object(config_class)

    mysql.init_app(app)
    csrf.init_app(app)

    from app.routes import register_blueprints

    register_blueprints(app)

    return app
