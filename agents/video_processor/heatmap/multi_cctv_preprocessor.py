import os
import json
import sys
import concurrent.futures
import glob

# Add the parent directory to the path to allow importing video_analyzer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from video_analyzer import VideoAnalyzer

VIDEOS_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'static_video'))

def get_cctv_video_path(cctv_id):
    cctv_folder = os.path.join(VIDEOS_BASE_PATH, f'cctv_{cctv_id}')
    for ext in ['*.mp4', '*.avi', '*.mov', '*.mkv']:
        videos = glob.glob(os.path.join(cctv_folder, ext))
        if videos:
            return videos[0]
    return None

def analyze_and_save(cctv_id, analyzer):
    print(f"\n=== Processing CCTV {cctv_id} ===")
    video_path = get_cctv_video_path(cctv_id)
    if not video_path:
        print(f"No video found for CCTV {cctv_id}")
        return {'cctv_id': cctv_id, 'status': 'error', 'error': 'Video file not found'}

    try:
        print(f"Starting comprehensive analysis for {video_path}...")
        # The analyzer now returns the perfectly formatted, timestamp-centric data
        timestamp_data = analyzer.analyze_video_comprehensive(video_path, cctv_id)
        print(f"Comprehensive analysis complete for CCTV {cctv_id}.")

        # Save the data to the final JSON file
        output_file = os.path.join(os.path.dirname(video_path), f'cctv_{cctv_id}_analysis.json')
        with open(output_file, 'w') as f:
            json.dump(timestamp_data, f, indent=4)
        
        print(f"✅ CCTV {cctv_id}: Analysis saved to {output_file}")
        return {'cctv_id': cctv_id, 'status': 'success'}

    except Exception as e:
        print(f"❌ Error processing CCTV {cctv_id}: {e}")
        import traceback
        traceback.print_exc()
        return {'cctv_id': cctv_id, 'status': 'error', 'error': str(e)}

def main():
    print("Initializing Video Analyzer...")
    try:
        analyzer = VideoAnalyzer()
    except Exception as e:
        print(f"Failed to initialize VideoAnalyzer: {e}")
        return

    print("\nStarting comprehensive analysis for all CCTV cameras...")
    results = {}
    cctv_ids = range(1, 7) # Process all CCTVs

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_to_cctv = {executor.submit(analyze_and_save, cctv_id, analyzer): cctv_id for cctv_id in cctv_ids}
        for future in concurrent.futures.as_completed(future_to_cctv):
            cctv_id = future_to_cctv[future]
            try:
                results[f'cctv_{cctv_id}'] = future.result()
            except Exception as exc:
                print(f'CCTV {cctv_id} generated an exception: {exc}')
                results[f'cctv_{cctv_id}'] = {'status': 'error', 'error': str(exc)}

    print("\n=== Processing Summary ===")
    success_count = sum(1 for res in results.values() if res and res.get('status') == 'success')
    print(f"Processing complete. {success_count}/{len(cctv_ids)} CCTVs processed successfully.")
    print("You can now start the heatmap_server.py to view the results.")

if __name__ == "__main__":
    main()
