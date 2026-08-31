from app.routes.admin import admin_bp
from app.routes.auth import auth_bp
from app.routes.student import student_bp
from app.routes.teacher import teacher_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(student_bp)
