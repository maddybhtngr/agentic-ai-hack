import os
import json
import sys
import asyncio
import concurrent.futures
from google.cloud import videointelligence_v1 as videointelligence
from google.cloud import storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")
BUCKET_NAME = f"video-analysis-heatmap-{PROJECT_ID}".lower()
VIDEOS_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'videos', 'static_video'))
OUTPUT_BASE_PATH = os.path.join(os.path.dirname(__file__), 'data')

# Ensure output directory exists
os.makedirs(OUTPUT_BASE_PATH, exist_ok=True)

def get_cctv_video_path(cctv_id):
    """Get the video path for a specific CCTV camera."""
    cctv_folder = os.path.join(VIDEOS_BASE_PATH, f'cctv_{cctv_id}')
    
    # Look for common video file extensions
    for ext in ['*.mp4', '*.avi', '*.mov', '*.mkv']:
        import glob
        videos = glob.glob(os.path.join(cctv_folder, ext))
        if videos:
            return videos[0]  # Return first video found
    
    # If no video found, return None
    return None

def upload_to_gcs(video_path, bucket_name, cctv_id):
    """Uploads a video file to GCS bucket."""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    storage_client = storage.Client(project=PROJECT_ID)
    try:
        bucket = storage_client.get_bucket(bucket_name)
    except Exception:
        print(f"Creating bucket {bucket_name}...")
        bucket = storage_client.create_bucket(bucket_name, location=LOCATION)

    blob_name = f"cctv_{cctv_id}_{os.path.basename(video_path)}"
    blob = bucket.blob(blob_name)

    if not blob.exists():
        print(f"Uploading CCTV {cctv_id} video to GCS...")
        blob.upload_from_filename(video_path, timeout=600)
    else:
        print(f"CCTV {cctv_id} video already exists in GCS.")

    return f"gs://{bucket_name}/{blob_name}"

def analyze_single_cctv(cctv_id):
    """Analyze a single CCTV camera video."""
    print(f"\n=== Processing CCTV {cctv_id} ===")
    
    # Get video path
    video_path = get_cctv_video_path(cctv_id)
    if not video_path:
        print(f"No video found for CCTV {cctv_id}")
        return None
    
    print(f"Found video: {video_path}")
    
    try:
        # Upload to GCS
        gcs_uri = upload_to_gcs(video_path, BUCKET_NAME, cctv_id)
        
        # Analyze video
        print(f"Starting analysis for CCTV {cctv_id}...")
        video_client = videointelligence.VideoIntelligenceServiceClient()

        features = [videointelligence.Feature.PERSON_DETECTION]
        config = videointelligence.PersonDetectionConfig(include_bounding_boxes=True)
        context = videointelligence.VideoContext(person_detection_config=config)

        operation = video_client.annotate_video(
            request={
                "features": features,
                "input_uri": gcs_uri,
                "video_context": context
            }
        )

        print(f"Waiting for CCTV {cctv_id} analysis to complete...")
        result = operation.result(timeout=2500)
        print(f"CCTV {cctv_id} analysis complete.")

        # Process results
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
                        'x': (box.left + box.right) / 2.0,
                        'y': (box.top + box.bottom) / 2.0,
                        'value': int(track.confidence * 100),
                        'confidence': track.confidence
                    }
                    heatmap_data[timestamp].append(point_data)
        
        # Save individual CCTV data
        cctv_folder = os.path.join(VIDEOS_BASE_PATH, f'cctv_{cctv_id}')
        output_file = os.path.join(cctv_folder, f'heatmap_cctv_{cctv_id}.json')
        with open(output_file, 'w') as f:
            json.dump(heatmap_data, f, indent=2)
        
        print(f"CCTV {cctv_id}: Processed {len(heatmap_data)} timestamps")
        return {
            'cctv_id': cctv_id,
            'data': heatmap_data,
            'status': 'success',
            'timestamps': len(heatmap_data)
        }
        
    except Exception as e:
        print(f"Error processing CCTV {cctv_id}: {e}")
        return {
            'cctv_id': cctv_id,
            'status': 'error',
            'error': str(e)
        }

def process_all_cctvs():
    """Process all CCTV cameras sequentially."""
    results = {}
    
    for cctv_id in range(1, 7):  # CCTV 1 to 6
        result = analyze_single_cctv(cctv_id)
        if result:
            results[f'cctv_{cctv_id}'] = result
    
    return results

def process_all_cctvs_parallel():
    """Process all CCTV cameras in parallel (faster but more resource intensive)."""
    results = {}
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all CCTV processing tasks
        future_to_cctv = {
            executor.submit(analyze_single_cctv, cctv_id): cctv_id 
            for cctv_id in range(1, 7)
        }
        
        # Collect results
        for future in concurrent.futures.as_completed(future_to_cctv):
            cctv_id = future_to_cctv[future]
            try:
                result = future.result()
                if result:
                    results[f'cctv_{cctv_id}'] = result
            except Exception as e:
                print(f"CCTV {cctv_id} generated an exception: {e}")
                results[f'cctv_{cctv_id}'] = {
                    'cctv_id': cctv_id,
                    'status': 'error',
                    'error': str(e)
                }
    
    return results

def create_combined_data(results):
    """Create a combined data file for the UI."""
    combined_data = {
        'metadata': {
            'total_cctvs': len(results),
            'processed_at': str(asyncio.get_event_loop().time()),
            'status': 'success'
        },
        'cctvs': {}
    }
    
    for cctv_key, result in results.items():
        if result['status'] == 'success':
            combined_data['cctvs'][cctv_key] = {
                'cctv_id': result['cctv_id'],
                'timestamps': result['timestamps'],
                'status': 'success'
            }
        else:
            combined_data['cctvs'][cctv_key] = {
                'cctv_id': result['cctv_id'],
                'status': 'error',
                'error': result.get('error', 'Unknown error')
            }
    
    # Save combined metadata
    combined_file = os.path.join(OUTPUT_BASE_PATH, 'combined_metadata.json')
    with open(combined_file, 'w') as f:
        json.dump(combined_data, f, indent=2)
    
    print(f"Combined metadata saved to {combined_file}")
    return combined_data

def main():
    """Main function."""
    if not PROJECT_ID or not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("Error: GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS must be set.")
        sys.exit(1)

    print("=== Multi-CCTV Heatmap Preprocessor ===")
    print("Choose processing mode:")
    print("1. Sequential (slower, less resource intensive)")
    print("2. Parallel (faster, more resource intensive)")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    try:
        if choice == "2":
            print("Processing all CCTVs in parallel...")
            results = process_all_cctvs_parallel()
        else:
            print("Processing all CCTVs sequentially...")
            results = process_all_cctvs()
        
        # Create combined data file
        combined_data = create_combined_data(results)
        
        print("\n=== Processing Summary ===")
        for cctv_key, result in results.items():
            if result['status'] == 'success':
                print(f"✅ {cctv_key.upper()}: {result['timestamps']} timestamps processed")
            else:
                print(f"❌ {cctv_key.upper()}: {result.get('error', 'Failed')}")
        
        print(f"\nAll data saved to: {OUTPUT_BASE_PATH}")
        print("Ready for multi-CCTV UI!")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
