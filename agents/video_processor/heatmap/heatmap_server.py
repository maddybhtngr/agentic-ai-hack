import os
import json
import time
import glob
from flask import Flask, render_template, jsonify
from flask_sock import Sock

app = Flask(__name__, template_folder='templates')
sock = Sock(app)

BASE_CCTV_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'static_video'))

def load_all_analysis_data():
    all_data = {}
    analysis_files = glob.glob(os.path.join(BASE_CCTV_DIR, 'cctv_*', '*_analysis.json'))
    for file_path in sorted(analysis_files):
        try:
            cctv_id = os.path.basename(os.path.dirname(file_path))
            with open(file_path, 'r') as f:
                all_data[cctv_id] = json.load(f)
            print(f"Successfully loaded analysis data for {cctv_id}")
        except Exception as e:
            print(f"Error loading or parsing {file_path}: {e}")
    return all_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cctv-feeds')
def get_cctv_feeds():
    """Returns a list of available CCTV feeds that have analysis data."""
    all_data = load_all_analysis_data()
    return jsonify(list(all_data.keys()))

@sock.route('/ws/<cctv_id>')
def heatmap_socket(ws, cctv_id):
    print(f"Client connected for CCTV feed: {cctv_id}")
    try:
        all_data = load_all_analysis_data()
        cctv_data = all_data.get(cctv_id)

        if not cctv_data:
            ws.send(json.dumps({'error': f'Data for {cctv_id} not found.'}))
            return

        sorted_timestamps = sorted([int(k) for k in cctv_data.keys()])
        if not sorted_timestamps:
            return

        for i, timestamp in enumerate(sorted_timestamps):
            timestamp_str = str(timestamp)
            data_to_send = cctv_data.get(timestamp_str, {})
            # Add timestamp to the payload for the UI
            data_to_send['timestamp'] = timestamp
            ws.send(json.dumps(data_to_send))
            
            if i + 1 < len(sorted_timestamps):
                sleep_duration = sorted_timestamps[i+1] - timestamp
                if sleep_duration > 0:
                    time.sleep(sleep_duration)

    except Exception as e:
        print(f"An error occurred for {cctv_id}: {e}")
    finally:
        if not ws.closed:
            ws.close()
        print(f"WebSocket connection closed for {cctv_id}.")

def main():
    print("Starting Flask server for multi-CCTV analysis dashboard...")
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)

if __name__ == '__main__':
    main()
