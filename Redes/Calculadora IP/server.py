from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/styles.css')
def send_css():
    return send_from_directory('.', 'styles.css')

@app.route('/script.js')
def send_js():
    return send_from_directory('.', 'script.js')


if __name__ == "__main__":
    app.run(port=8080)
