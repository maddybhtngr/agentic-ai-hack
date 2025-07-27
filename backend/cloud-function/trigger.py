import functions_framework
import json
import os
from datetime import datetime
from google.cloud import storage
import vertexai
from vertexai.vision_models import Image, MultiModalEmbeddingModel
from vertexai.generative_models import GenerativeModel  # New import for generative model
from google.generativeai import GenerativeModel
from vertexai.generative_models import GenerativeModel, Part
from mimetypes import guess_type
from math import cos, radians

# --- Configuration ---
# IMPORTANT: Replace with your actual Google Cloud Project ID
GCP_PROJECT_ID = os.environ.get('GCP_PROJECT_ID', 'carbon-hulling-466218-a0')
# IMPORTANT: Choose the region where your Vertex AI Multimodal Embedding model is available
# and where you want your Cloud Function to run. us-central1 is a common choice.
GCP_LOCATION = os.environ.get('GCP_LOCATION', 'asia-south1')
# IMPORTANT: Replace with the GCS bucket where the generated embeddings will be stored.
# This MUST be different from the input bucket to avoid recursive triggers.
EMBEDDINGS_OUTPUT_BUCKET = os.environ.get('EMBEDDINGS_OUTPUT_BUCKET', 'embeddings-agentic-ai')
# Prefix within the output bucket for embeddings (e.g., 'embeddings/').
EMBEDDINGS_OUTPUT_PREFIX = os.environ.get('EMBEDDINGS_OUTPUT_PREFIX', '')

# --- Location Validation Configuration ---
# Define the center point of your 20,000 sq ft area (replace with your actual coordinates)
# Example coordinates - replace with your venue's center point
VENUE_CENTER_LAT = float(os.environ.get('VENUE_CENTER_LAT', '28.6139'))  # New Delhi example
VENUE_CENTER_LON = float(os.environ.get('VENUE_CENTER_LON', '77.2090'))  # New Delhi example

# 20,000 sq ft = ~141.42 feet on each side
# Convert feet to degrees (approximate conversion)
# 1 degree latitude ≈ 364,000 feet
# 1 degree longitude ≈ 364,000 feet * cos(latitude)
SQUARE_SIZE_FEET = 20000  # 20,000 sq ft
SQUARE_SIDE_FEET = (SQUARE_SIZE_FEET ** 0.5)  # ~141.42 feet
FEET_PER_DEGREE_LAT = 364000  # Approximate
FEET_PER_DEGREE_LON = 364000 * abs(cos(radians(VENUE_CENTER_LAT)))  # Adjusted for latitude

# Calculate bounding box (half the side length in each direction)
LAT_TOLERANCE = (SQUARE_SIDE_FEET / 2) / FEET_PER_DEGREE_LAT
LON_TOLERANCE = (SQUARE_SIDE_FEET / 2) / FEET_PER_DEGREE_LON

# Bounding box limits
MIN_LAT = VENUE_CENTER_LAT - LAT_TOLERANCE
MAX_LAT = VENUE_CENTER_LAT + LAT_TOLERANCE
MIN_LON = VENUE_CENTER_LON - LON_TOLERANCE
MAX_LON = VENUE_CENTER_LON + LON_TOLERANCE

# Initialize Google Cloud Storage client
storage_client = storage.Client()

# Initialize Vertex AI models globally to avoid re-initialization on each function invocation
# This improves performance for Cloud Functions.
embedding_model = None
description_model = None

try:
    vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
    embedding_model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
    # Using 'gemini-2.0-flash' for description as it's multimodal and generally fast.
    # You could also use 'gemini-pro-vision' if you prefer.
    description_model = GenerativeModel("gemini-1.5-flash-002")
    print(
        f"Vertex AI Multimodal Embeddings and Generative models initialized for project '{GCP_PROJECT_ID}' in location '{GCP_LOCATION}'.")
except Exception as e:
    print(f"Error initializing Vertex AI models: {e}")
    # Re-raise the exception to indicate a critical setup failure
    raise


def is_location_within_bounds(latitude, longitude):
    """
    Validate if the given coordinates are within the defined 20,000 sq ft area.

    Args:
        latitude (float): Latitude coordinate
        longitude (float): Longitude coordinate

    Returns:
        bool: True if coordinates are within bounds, False otherwise
    """
    within_bounds = (MIN_LAT <= latitude <= MAX_LAT and
                     MIN_LON <= longitude <= MAX_LON)

    if not within_bounds:
        print(f"Coordinates ({latitude}, {longitude}) outside bounds. "
              f"Valid range: Lat[{MIN_LAT:.6f}, {MAX_LAT:.6f}], "
              f"Lon[{MIN_LON:.6f}, {MAX_LON:.6f}]")
    else:
        print(f"Coordinates ({latitude}, {longitude}) within valid 20,000 sq ft area")

    return within_bounds


# --- Bucket-based Location and Zone Mapping ---
# Define mapping of GCS bucket names to zones and coordinates
BUCKET_ZONE_MAPPING = {
    'entrance-cameras': 'Entrance',
    'main-hall-feeds': 'Main Hall',
    'exit-monitors': 'Exit',
    'vip-area-cams': 'VIP Area',
    'stage-cameras': 'Stage',
    'security-feeds': 'Security',
    'food-court-cams': 'Food Court',
    'parking-monitors': 'Parking',
    'lobby-cameras': 'Lobby',
    'emergency-exits': 'Emergency Exit'
}

# Define constant coordinates for each bucket (all within 20,000 sq ft area)
BUCKET_COORDINATES = {
    'entrance-cameras': {'latitude': 28.613900, 'longitude': 77.209000},  # North entrance
    'main-hall-feeds': {'latitude': 28.613950, 'longitude': 77.209050},  # Center main hall
    'exit-monitors': {'latitude': 28.614000, 'longitude': 77.209100},  # South exit
    'vip-area-cams': {'latitude': 28.613850, 'longitude': 77.208950},  # West VIP area
    'stage-cameras': {'latitude': 28.614050, 'longitude': 77.209150},  # East stage area
    'security-feeds': {'latitude': 28.613800, 'longitude': 77.209200},  # Security office
    'food-court-cams': {'latitude': 28.614100, 'longitude': 77.208900},  # Food court
    'parking-monitors': {'latitude': 28.613750, 'longitude': 77.209250},  # Parking area
    'lobby-cameras': {'latitude': 28.614150, 'longitude': 77.209050},  # Main lobby
    'emergency-exits': {'latitude': 28.613950, 'longitude': 77.208850}  # Emergency exits
}


def extract_location_from_bucket(bucket_name):
    """
    Extract location coordinates based on GCS bucket name.
    Uses predefined mapping of bucket names to coordinates.

    Args:
        bucket_name (str): The GCS bucket name

    Returns:
        dict: Dictionary with latitude and longitude, or None if bucket not mapped
    """
    print(f"DEBUG: Extracting location from bucket: {bucket_name}")

    # Check if bucket name is in our mapping
    if bucket_name in BUCKET_COORDINATES:
        coordinates = BUCKET_COORDINATES[bucket_name]
        print(f"DEBUG: Found coordinates for bucket '{bucket_name}': {coordinates}")

        # Validate coordinates are within bounds (they should be by design)
        if is_location_within_bounds(coordinates['latitude'], coordinates['longitude']):
            return coordinates
        else:
            print(f"WARNING: Predefined coordinates for bucket '{bucket_name}' are outside bounds!")
            return None

    # If bucket not found, try partial matching
    for bucket_key in BUCKET_COORDINATES.keys():
        if bucket_key in bucket_name.lower() or bucket_name.lower() in bucket_key:
            coordinates = BUCKET_COORDINATES[bucket_key]
            print(f"DEBUG: Found partial match for bucket '{bucket_name}' -> '{bucket_key}': {coordinates}")
            return coordinates

    # If no mapping found, return default center coordinates
    print(f"DEBUG: No mapping found for bucket '{bucket_name}', using venue center coordinates")
    default_coords = {'latitude': VENUE_CENTER_LAT, 'longitude': VENUE_CENTER_LON}
    return default_coords


def test_bucket_extraction():
    """
    Test function to debug bucket-based location and zone extraction.
    Call this function to test your bucket mappings.
    """
    print("\n=== TESTING BUCKET-BASED EXTRACTION ===")
    print(f"Venue center: ({VENUE_CENTER_LAT}, {VENUE_CENTER_LON})")
    print(f"Valid bounds: Lat[{MIN_LAT:.6f}, {MAX_LAT:.6f}], Lon[{MIN_LON:.6f}, {MAX_LON:.6f}]")
    print(f"Area: {SQUARE_SIZE_FEET} sq ft ({SQUARE_SIDE_FEET:.1f} ft per side)\n")

    # Test various bucket names
    test_buckets = [
        "entrance-cameras",  # Should work - exact match
        "main-hall-feeds",  # Should work - exact match
        "exit-monitors",  # Should work - exact match
        "security-feeds",  # Should work - exact match
        "vip-area-cams",  # Should work - exact match
        "stage-cameras",  # Should work - exact match
        "entrance-cam-backup",  # Should work - partial match
        "main-hall-backup",  # Should work - partial match
        "unknown-bucket",  # Should fallback to center coordinates
        "random-bucket-name",  # Should fallback to center coordinates
    ]

    for test_bucket in test_buckets:
        print(f"\nTesting bucket: {test_bucket}")
        location_result = extract_location_from_bucket(test_bucket)
        zone_result = extract_zone_from_bucket(test_bucket)
        print(f"Location: {location_result}")
        print(f"Zone: {zone_result}")
        print("-" * 50)


def extract_zone_from_bucket(bucket_name):
    """
    Extract zone information from GCS bucket name.
    Uses predefined mapping of bucket names to zones.

    Args:
        bucket_name (str): The GCS bucket name

    Returns:
        str: Zone name or 'Unknown Zone' if not mapped
    """
    print(f"DEBUG: Extracting zone from bucket: {bucket_name}")

    # Check if bucket name is in our mapping
    if bucket_name in BUCKET_ZONE_MAPPING:
        zone = BUCKET_ZONE_MAPPING[bucket_name]
        print(f"DEBUG: Found zone for bucket '{bucket_name}': {zone}")
        return zone

    # If bucket not found, try partial matching
    for bucket_key, zone in BUCKET_ZONE_MAPPING.items():
        if bucket_key in bucket_name.lower() or bucket_name.lower() in bucket_key:
            print(f"DEBUG: Found partial match for bucket '{bucket_name}' -> '{bucket_key}': {zone}")
            return zone

    # Check for common keywords in bucket name as fallback
    bucket_lower = bucket_name.lower()
    if 'entrance' in bucket_lower or 'entry' in bucket_lower:
        return 'Entrance'
    elif 'main' in bucket_lower and 'hall' in bucket_lower:
        return 'Main Hall'
    elif 'stage' in bucket_lower or 'performance' in bucket_lower:
        return 'Stage'
    elif 'vip' in bucket_lower:
        return 'VIP Area'
    elif 'food' in bucket_lower or 'dining' in bucket_lower:
        return 'Food Court'
    elif 'parking' in bucket_lower:
        return 'Parking'
    elif 'lobby' in bucket_lower:
        return 'Lobby'
    elif 'exit' in bucket_lower:
        return 'Exit'
    elif 'security' in bucket_lower:
        return 'Security'
    elif 'emergency' in bucket_lower:
        return 'Emergency Exit'

    # Default fallback
    print(f"DEBUG: No zone mapping found for bucket '{bucket_name}', using 'Unknown Zone'")
    return 'Unknown Zone'


@functions_framework.cloud_event
def generate_image_embedding_gcs_trigger(cloud_event):
    """
    Google Cloud Function that triggers upon a new image being uploaded to GCS.
    It generates a multimodal embedding and a textual description for the image,
    and saves both to a specified output GCS bucket in JSON format for
    Vertex AI Vector Search and RAG consumption.

    Args:
        cloud_event (google.cloud.functions.Context): The Cloud Event that
            triggered this function. Contains information about the GCS event.
            The 'data' field contains the GCS object metadata.
    """
    data = cloud_event.data
    print(f"Received Cloud Event data: {data}")

    bucket_name = data.get("bucket")
    file_name = data.get("name")
    content_type = data.get("contentType")

    # Basic validation for event data
    if not bucket_name or not file_name or not content_type:
        print("Missing essential data in Cloud Event (bucket, name, or contentType). Exiting.")
        return

    # Skip directories or non-image files
    if file_name.endswith('/') or not content_type.startswith('image/'):
        print(f"Skipping non-image file or directory: {file_name} (Content-Type: {content_type})")
        return

    print(f"Processing new image: gs://{bucket_name}/{file_name}")

    # 1. Download the image from the input GCS bucket
    # Use os.path.basename to get just the file name, avoiding issues with GCS paths
    temp_file_path = f"/tmp/{os.path.basename(file_name)}"
    try:
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_name)
        blob.download_to_filename(temp_file_path)
        print(f"Image downloaded to {temp_file_path}")
    except Exception as e:
        print(f"Error downloading image {file_name} from bucket {bucket_name}: {e}")
        return

    # Initialize variables for embedding and description
    feature_vector = []
    generated_description = "Description generation failed."  # Default fallback

    try:
        with open(temp_file_path, "rb") as f:
            image_bytes = f.read()

        vertex_ai_image = Image(image_bytes=image_bytes)

        # 2. Generate embedding using Vertex AI Multimodal Embeddings
        if embedding_model:
            try:
                embeddings = embedding_model.get_embeddings(image=vertex_ai_image)
                feature_vector = embeddings.image_embedding
                print(f"Generated embedding for {file_name}. Dimensions: {len(feature_vector)}")
            except Exception as e:
                print(f"Error generating embedding for {file_name}: {e}")
                feature_vector = []  # Ensure it's an empty list on failure
        else:
            print("Embedding model not initialized. Skipping embedding generation.")

        # 3. Generate textual description using Gemini Generative Model
        if description_model:
            try:
                description_prompt = "Describe this image in detail, focusing on any people present, their clothing, and apparent features (e.g., hair color, accessories). Be concise but comprehensive for identification purposes."
                mime_type = guess_type(file_name)[0] or 'image/jpeg'

                # --- CORRECTED LINE HERE ---
                response = description_model.generate_content([
                    Part.from_data(data=image_bytes, mime_type=mime_type),
                    Part.from_text(description_prompt)
                ])
                # --- END CORRECTED LINE ---

                generated_description = response.text
                print(
                    f"Generated description for {file_name}: {generated_description[:150]}...")  # Print first 150 chars
            except Exception as e:
                print(f"Error generating description for {file_name}: {e}")
                generated_description = "Description generation failed due to API error."  # Fallback
        else:
            print("Description model not initialized. Skipping description generation.")

    except Exception as e:
        print(f"General error during image processing for {file_name}: {e}")
        # Ensure temp file is cleaned up even if there's an error in processing
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return

    # Extract metadata from bucket name instead of filename
    location_coords = extract_location_from_bucket(bucket_name)
    print(f"DEBUG: Extracted location coordinates from bucket '{bucket_name}': {location_coords}")
    zone_info = extract_zone_from_bucket(bucket_name)
    print(f"DEBUG: Extracted zone info from bucket '{bucket_name}': {zone_info}")
    current_timestamp = datetime.now().isoformat()

    # 4. Prepare data for Vertex AI Vector Search (JSON format)
    # The 'id' should be unique for each datapoint. Using the GCS URI is a good practice.
    datapoint_id = f"gs://{bucket_name}/{file_name}"

    vector_search_datapoint = {
        "id": datapoint_id,
        "embedding": feature_vector,
        "description": generated_description,  # Add the generated description here
        # NEW METADATA FIELDS
        "location": location_coords,  # Coordinates (lat/lng)
        "zone": zone_info,  # Zone of venue (main gate, entrance, etc.)
        "timestamp": current_timestamp,  # Processing timestamp
        # Optional: Add any other metadata you want to store or filter on
        "restricts": [
            {"namespace": "source_bucket", "allow": [bucket_name]},
            {"namespace": "original_filename", "allow": [file_name]},
            {"namespace": "content_type", "allow": [content_type]},
            {"namespace": "zone", "allow": [zone_info]},  # Add zone to restricts for filtering
        ]
    }

    # 5. Upload the embedding and description JSON to the output GCS bucket
    # Using .json extension for individual JSON files
    output_blob_name = f"{EMBEDDINGS_OUTPUT_PREFIX}{os.path.basename(file_name).replace('.', '_')}.json"
    output_bucket = storage_client.bucket(EMBEDDINGS_OUTPUT_BUCKET)
    output_blob = output_bucket.blob(output_blob_name)

    try:
        # Upload the JSON object
        output_blob.upload_from_string(json.dumps(vector_search_datapoint), content_type='application/json')
        print(f"Embedding and description saved to gs://{EMBEDDINGS_OUTPUT_BUCKET}/{output_blob_name}")
        print(f"Added metadata - Zone: {zone_info}, Timestamp: {current_timestamp}")
    except Exception as e:
        print(f"Error uploading embedding and description for {file_name} to GCS: {e}")
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Cleaned up temporary file: {temp_file_path}")
