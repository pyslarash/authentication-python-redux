import os
from flask import Flask, request, jsonify, url_for, send_from_directory, make_response
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
import datetime
import jwt
import base64

#from models import Person

ENV = os.getenv("FLASK_ENV")
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)

# Allow CORS requests to this API
CORS(app, resources={r"/*": {"origins": "*"}})

app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# initialize the database with the Flask app instance
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type = True)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0 # avoid cache memory
    return response

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if email is already in use
    if User.query.filter_by(email=email).first():
        raise APIException('Email already in use', status_code=409)

    # Create new user object and add to database
    new_user = User(email=email, password=password, is_active=True)
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token for new user
    token_payload = {'email': email}
    token = jwt.encode(token_payload, 'secret_key', algorithm='HS256')

    # Set token as a cookie in the response
    expires = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    response = make_response(jsonify({
        'email': email,
        'token': token
    }), 201)

    response.set_cookie('token', token, expires=expires, httponly=True)

    return response

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user exists and password is correct
    user = User.query.filter_by(email=email).first()
    if not user or user.password != password:
        raise APIException('Invalid email or password', status_code=401)

    # Generate JWT token for user
    token_payload = {'email': email}
    token = jwt.encode(token_payload, 'secret_key', algorithm='HS256')

    # Set token as a cookie in the response
    expires = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    response = jsonify({
        'email': email,
        'token': token
    })
    response.set_cookie('token', token, expires=expires, httponly=True)

    return response, 200

@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'User logged out successfully'})
    response.delete_cookie('token')
    return response, 200


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
