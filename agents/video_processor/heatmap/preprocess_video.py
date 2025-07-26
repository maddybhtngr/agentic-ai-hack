import os
import json
import sys
import glob
from concurrent.futures import ProcessPoolExecutor, as_completed
from google.cloud import videointelligence_v1 as videointelligence
from google.cloud import storage
from dotenv import load_dotenv

# --- Configuration ---
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")
BUCKET_NAME = f"video-analysis-heatmap-{PROJECT_ID}".lower()
BASE_VIDEO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'static_video'))

def process_single_video(video_path):
    """Worker function to upload, analyze, and save data for one video."""
    camera_id = os.path.basename(os.path.dirname(video_path))
    print(f"[{camera_id}] Starting process...")

    # 1. Upload to GCS
    storage_client = storage.Client(project=PROJECT_ID)
    try:
        bucket = storage_client.get_bucket(BUCKET_NAME)
    except Exception:
        # This check is not thread-safe but good enough for this demo
        try:
            print(f"[{camera_id}] Bucket {BUCKET_NAME} not found, creating it...")
            bucket = storage_client.create_bucket(BUCKET_NAME, location=LOCATION)
        except Exception as e:
            print(f"[{camera_id}] Bucket creation failed (maybe a race condition): {e}")
            bucket = storage_client.get_bucket(BUCKET_NAME)
    
    blob_name = f"{camera_id}_{os.path.basename(video_path)}"
    blob = bucket.blob(blob_name)
    if not blob.exists():
        print(f"[{camera_id}] Uploading to gs://{BUCKET_NAME}/{blob_name}...")
        blob.upload_from_filename(video_path)
    else:
        print(f"[{camera_id}] File already exists in GCS.")
    gcs_uri = f"gs://{BUCKET_NAME}/{blob_name}"

    # 2. Analyze Video
    print(f"[{camera_id}] Starting analysis for {gcs_uri}. This will take several minutes.")
    video_client = videointelligence.VideoIntelligenceServiceClient()
    features = [videointelligence.Feature.PERSON_DETECTION]
    config = videointelligence.PersonDetectionConfig(include_bounding_boxes=True)
    context = videointelligence.VideoContext(person_detection_config=config)
    operation = video_client.annotate_video(
        request={"features": features, "input_uri": gcs_uri, "video_context": context}
    )
    result = operation.result(timeout=900)
    print(f"[{camera_id}] Analysis complete.")

    # 3. Process and save results
    heatmap_data = {}
    annotation_results = result.annotation_results[0]
    for person_annotation in annotation_results.person_detection_annotations:
        for track in person_annotation.tracks:
            for obj in track.timestamped_objects:
                timestamp = int(obj.time_offset.seconds)
                if timestamp not in heatmap_data:
                    heatmap_data[timestamp] = []
                box = obj.normalized_bounding_box
                point_data = {
                    'x': int((box.left + box.right) / 2 * 800), # Scale to container width
                    'y': int((box.top + box.bottom) / 2 * 600), # Scale to container height
                    'value': 100,
                    'confidence': track.confidence
                }
                heatmap_data[timestamp].append(point_data)

    output_filename = os.path.join(os.path.dirname(__file__), f'heatmap_data_{camera_id}.json')
    with open(output_filename, 'w') as f:
        json.dump(heatmap_data, f)
    
    return f"[{camera_id}] Successfully created {output_filename}"

def main():
    """Finds all CCTV videos and processes them in parallel."""
    if not PROJECT_ID or not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("Error: GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS must be set.")
        sys.exit(1)

    video_paths = glob.glob(os.path.join(BASE_VIDEO_DIR, 'cctv_*', '*.mp4'))
    if not video_paths:
        print(f"Error: No videos found in {BASE_VIDEO_DIR}/cctv_*/")
        sys.exit(1)

    print(f"Found {len(video_paths)} videos to process: {', '.join(map(os.path.basename, video_paths))}")

    with ProcessPoolExecutor(max_workers=len(video_paths)) as executor:
        futures = [executor.submit(process_single_video, path) for path in video_paths]
        for future in as_completed(futures):
            try:
                result = future.result()
                print(result)
            except Exception as e:
                print(f"A video processing task failed: {e}")

    print("\nBatch processing complete!")

if __name__ == "__main__":
    main()

