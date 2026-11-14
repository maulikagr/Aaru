"""
Genshin Impact Enka Profile Viewer
Flask Web Application
"""
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from enka_parser import fetch_and_parse_enka

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/damage-calc")
def damage_calc():
    return render_template("home.html", active_tab="damage_calc")

@app.route("/profile/<uid>")
def profile(uid):
    return render_template("profile.html", uid=uid)

@app.route("/api/player", methods=["POST"])
def get_player_profile():
    body = request.get_json(silent=True) or {}
    uid = str(body.get("uid", "")).strip()
    if not uid:
        return jsonify({"success": False, "error": "Please provide a valid Genshin Impact UID."}), 400

    print(f"[Webapp] Fetching profile for UID: {uid}")
    result = fetch_and_parse_enka(uid)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"Starting Genshin Enka Viewer on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
