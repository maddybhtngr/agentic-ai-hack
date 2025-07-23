import functions_framework
import json
import os
from google.cloud import storage
import vertexai
from vertexai.vision_models import Image, MultiModalEmbeddingModel

# --- Configuration ---
# IMPORTANT: Replace with your actual Google Cloud Project ID
GCP_PROJECT_ID = os.environ.get('GCP_PROJECT_ID', 'silver-pact-466407-p8')
# IMPORTANT: Choose the region where your Vertex AI Multimodal Embedding model is available
# and where you want your Cloud Function to run. us-central1 is a common choice.
GCP_LOCATION = os.environ.get('GCP_LOCATION', 'us-east1')
# IMPORTANT: Replace with the GCS bucket where the generated embeddings will be stored.
# This MUST be different from the input bucket to avoid recursive triggers.
EMBEDDINGS_OUTPUT_BUCKET = os.environ.get('EMBEDDINGS_OUTPUT_BUCKET', 'agentic-ai-embedding-output')
# Prefix within the output bucket for embeddings (e.g., 'embeddings/').
EMBEDDINGS_OUTPUT_PREFIX = os.environ.get('EMBEDDINGS_OUTPUT_PREFIX', 'embeddings/')
storage_client = storage.Client()

try:
    vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
    embedding_model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
    print(
        f"Vertex AI Multimodal Embeddings model initialized for project '{GCP_PROJECT_ID}' in location '{GCP_LOCATION}'.")
except Exception as e:
    print(f"Error initializing Vertex AI Embeddings model: {e}")
    # Re-raise the exception to indicate a critical setup failure
    raise


@functions_framework.cloud_event
def generate_image_embedding_gcs_trigger(cloud_event):
    """
    Google Cloud Function that triggers upon a new image being uploaded to GCS.
    It generates a multimodal embedding for the image and saves it to a
    specified output GCS bucket in JSONL format for Vertex AI Vector Search.

    Args:
        cloud_event (google.cloud.functions.Context): The Cloud Event that
            triggered this function. Contains information about the GCS event.
            The 'data' field contains the GCS object metadata.
    """
    data = cloud_event.data
    print(data)
    bucket_name = data["bucket"]
    file_name = data["name"]
    content_type = data["contentType"]

    # Skip directories or non-image files if necessary
    if not file_name or file_name.endswith('/') or not content_type.startswith('image/'):
        print(f"Skipping non-image file or directory: {file_name}")
        return

    print(f"Processing new image: gs://{bucket_name}/{file_name}")

    # 1. Download the image from the input GCS bucket
    temp_file_path = f"/tmp/{file_name.split('/')[-1]}"  # Save to /tmp directory
    try:
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_name)
        blob.download_to_filename(temp_file_path)
        print(f"Image downloaded to {temp_file_path}")
    except Exception as e:
        print(f"Error downloading image {file_name} from bucket {bucket_name}: {e}")
        return

    # 2. Generate embedding using Vertex AI Multimodal Embeddings
    try:
        with open(temp_file_path, "rb") as f:
            image_bytes = f.read()

        vertex_ai_image = Image(image_bytes=image_bytes)
        embeddings = embedding_model.get_embeddings(image=vertex_ai_image)
        feature_vector = embeddings.image_embedding
        print(f"Generated embedding for {file_name}. Dimensions: {len(feature_vector)}")

    except Exception as e:
        print(f"Error generating embedding for {file_name}: {e}")
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return

    # 3. Prepare data for Vertex AI Vector Search (JSONL format)
    # Each line in the JSONL file represents a datapoint for Vector Search
    # The 'id' should be unique for each datapoint. Using the GCS URI is a good practice.
    datapoint_id = f"gs://{bucket_name}/{file_name}"

    vector_search_datapoint = {
        "id": datapoint_id,
        "embedding": feature_vector,
        # Optional: Add any other metadata you want to store or filter on
        "restricts": [
            {"namespace": "source_bucket", "allow": [bucket_name]},
            {"namespace": "original_filename", "allow": [file_name]},
            {"namespace": "content_type", "allow": [content_type]}
        ]
    }

    # 4. Upload the embedding JSONL to the output GCS bucket
    output_blob_name = f"{EMBEDDINGS_OUTPUT_PREFIX}{os.path.basename(file_name)}.json"
    output_bucket = storage_client.bucket(EMBEDDINGS_OUTPUT_BUCKET)
    output_blob = output_bucket.blob(output_blob_name)

    try:
        # Write the JSON object as a single line in the JSONL file
        output_blob.upload_from_string(json.dumps(vector_search_datapoint) + '\n', content_type='application/json')
        print(f"Embedding saved to gs://{EMBEDDINGS_OUTPUT_BUCKET}/{output_blob_name}")
    except Exception as e:
        print(f"Error uploading embedding for {file_name} to GCS: {e}")
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Cleaned up temporary file: {temp_file_path}")

