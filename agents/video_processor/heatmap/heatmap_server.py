import os
import json
import time
from flask import Flask, render_template
from flask_sock import Sock

# --- Setup ---
app = Flask(__name__, template_folder='templates')
sock = Sock(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'heatmap_data.json')

# --- Routes ---
@app.route('/')
def index():
    """Serve the main heatmap page."""
    return render_template('index.html')

@sock.route('/ws')
def heatmap_socket(ws):
    """WebSocket route to stream heatmap data."""
    print("Client connected to WebSocket.")
    try:
        with open(DATA_FILE, 'r') as f:
            heatmap_data = json.load(f)
        print(f"Successfully loaded heatmap data with {len(heatmap_data)} timestamps.")

        # Get sorted timestamps
        sorted_timestamps = sorted([int(k) for k in heatmap_data.keys()])
        start_time = sorted_timestamps[0]

        for timestamp in sorted_timestamps:
            # Calculate the delay needed to simulate real-time playback
            delay = timestamp - start_time
            time.sleep(delay)
            start_time = timestamp

            data_points = heatmap_data[str(timestamp)]
            ws.send(json.dumps(data_points))
            print(f"Sent data for timestamp: {timestamp}")
        
        print("Finished streaming data.")
        ws.close()

    except FileNotFoundError:
        print(f"ERROR: heatmap_data.json not found!")
        ws.send(json.dumps([{'error': 'Data file not found on server.'}]))
        ws.close()
    except Exception as e:
        print(f"An error occurred: {e}")
        ws.close()


def main():
    print("Starting Flask server with WebSocket support...")
    # Note: Use a production-ready WSGI server like gunicorn or uWSGI for deployment
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)

if __name__ == '__main__':
    main()
