"""
Genshin Impact Enka Profile Viewer
Flask Web Application
"""
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from enka_parser import fetch_and_parse_enka
from dps_calculator import calculate_full_team_dps

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.jinja_env.auto_reload = True
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

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/api/player", methods=["POST"])
def get_player_profile():
    body = request.get_json(silent=True) or {}
    uid = str(body.get("uid", "")).strip()
    if not uid:
        return jsonify({"success": False, "error": "Please provide a valid Genshin Impact UID."}), 400

    print(f"[Webapp] Fetching profile for UID: {uid}")
    result = fetch_and_parse_enka(uid)
    return jsonify(result)

@app.route("/api/calculate-dps", methods=["POST"])
def calculate_dps():
    body = request.get_json(silent=True) or {}
    team = body.get("team", [])
    uid = str(body.get("uid", "")).strip()
    if not team or not isinstance(team, list):
        return jsonify({"success": False, "error": "No team members provided for DPS calculation."}), 400

    # Fetch live character data directly from Enka Network if UID is provided
    if uid:
        try:
            print(f"[Webapp] Fetching fresh live character data directly from Enka Network for UID: {uid}")
            live_result = fetch_and_parse_enka(uid)
            if live_result.get("success") and live_result.get("characters"):
                live_chars_by_name = {c.get("name"): c for c in live_result.get("characters", [])}
                refreshed_team = []
                for m in team:
                    m_name = m.get("name")
                    if m_name in live_chars_by_name:
                        refreshed_team.append(live_chars_by_name[m_name])
                    else:
                        refreshed_team.append(m)
                team = refreshed_team
                print(f"[Webapp] Successfully refreshed {len(team)} character(s) live from Enka!")
        except Exception as e:
            print(f"[Webapp] Warning refreshing live data from Enka: {e}")

    print(f"[Webapp] Calculating Team DPS for {len(team)} character(s)...")
    result = calculate_full_team_dps(team)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"Starting Genshin Enka Viewer on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
