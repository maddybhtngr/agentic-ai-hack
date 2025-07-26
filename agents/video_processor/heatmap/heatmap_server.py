import os
import json
import time
import glob
from flask import Flask, render_template, jsonify
from flask_sock import Sock

# --- Setup ---
app = Flask(__name__, template_folder='templates')
sock = Sock(app)

# The base directory where cctv_1, cctv_2, etc. folders are located
BASE_CCTV_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'static_video'))

# --- Data Loading ---
def load_all_heatmap_data():
    """Loads all heatmap data from the cctv_* directories."""
    all_data = {}
    cctv_folders = sorted(glob.glob(os.path.join(BASE_CCTV_DIR, 'cctv_*')))
    for folder in cctv_folders:
        cctv_id = os.path.basename(folder)
        heatmap_file = os.path.join(folder, f'heatmap_{cctv_id}.json')
        if os.path.exists(heatmap_file):
            try:
                with open(heatmap_file, 'r') as f:
                    all_data[cctv_id] = json.load(f)
                print(f"Successfully loaded heatmap data for {cctv_id}")
            except json.JSONDecodeError:
                print(f"Error decoding JSON from {heatmap_file}")
            except Exception as e:
                print(f"Error loading {heatmap_file}: {e}")
    return all_data

# --- Routes ---
@app.route('/')
def index():
    """Serve the main heatmap page."""
    return render_template('index.html')

@app.route('/api/cctv-feeds')
def get_cctv_feeds():
    """Returns a list of available CCTV feeds that have heatmap data."""
    cctv_folders = sorted(glob.glob(os.path.join(BASE_CCTV_DIR, 'cctv_*')))
    feed_ids = [os.path.basename(f) for f in cctv_folders if os.path.exists(os.path.join(f, f'heatmap_{os.path.basename(f)}.json'))]
    return jsonify(feed_ids)

@sock.route('/ws/<cctv_id>')
def heatmap_socket(ws, cctv_id):
    """WebSocket route to stream heatmap data for a specific CCTV feed."""
    print(f"Client connected for CCTV feed: {cctv_id}")
    try:
        heatmap_data = load_all_heatmap_data().get(cctv_id)
        if not heatmap_data:
            print(f"ERROR: No data found for {cctv_id}")
            ws.send(json.dumps([{'error': f'Data for {cctv_id} not found on server.'}]))
            return

        print(f"Successfully loaded data for {cctv_id} with {len(heatmap_data)} timestamps.")

        sorted_timestamps = sorted([int(k) for k in heatmap_data.keys()])
        if not sorted_timestamps:
            print(f"No timestamps found for {cctv_id}")
            return

        # Simulate real-time playback based on timestamps
        # A more robust solution might involve a shared clock or a different playback strategy
        for i, timestamp in enumerate(sorted_timestamps):
            data_points = heatmap_data[str(timestamp)]
            ws.send(json.dumps(data_points))
            # print(f"Sent data for {cctv_id} @ timestamp {timestamp}")
            
            # Sleep until the next timestamp
            if i + 1 < len(sorted_timestamps):
                next_timestamp = sorted_timestamps[i+1]
                sleep_duration = next_timestamp - timestamp
                if sleep_duration > 0:
                    time.sleep(sleep_duration)

        print(f"Finished streaming data for {cctv_id}.")

    except Exception as e:
        print(f"An error occurred for {cctv_id}: {e}")
    finally:
        if not ws.closed:
            ws.close()
        print(f"WebSocket connection closed for {cctv_id}.")


def main():
    print("Starting Flask server for multi-CCTV heatmap display...")
    # Use a production-ready WSGI server like gunicorn or uWSGI for deployment
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)

if __name__ == '__main__':
    main()
