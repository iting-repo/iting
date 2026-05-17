import os
import json
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

DISCORD_WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL')

@app.route('/', methods=['POST'])
def webhook():
    if not DISCORD_WEBHOOK_URL:
        return jsonify({"error": "DISCORD_WEBHOOK_URL not set"}), 500

    data = request.json
    
    # Format Alertmanager payload for Discord
    alerts = data.get('alerts', [])
    if not alerts:
        return "No alerts", 200

    fields = []
    for alert in alerts:
        fields.append({
            "name": f"🚨 {alert['labels']['alertname']} ({alert['status']})",
            "value": alert.get('annotations', {}).get('description', 'No description'),
            "inline": False
        })

    payload = {
        "embeds": [{
            "title": "ITing Alert",
            "color": 16711680 if alerts[0]['status'] == 'firing' else 65280,
            "fields": fields,
            "footer": {
                "text": f"GroupKey: {data.get('groupKey', 'N/A')}"
            }
        }]
    }

    try:
        requests.post(DISCORD_WEBHOOK_URL, json=payload, timeout=5)
    except Exception as e:
        print(f"Error sending to Discord: {e}")
        return "Error", 500

    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
