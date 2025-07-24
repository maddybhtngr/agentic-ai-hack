# -*- coding: utf-8 -*-
"""
This script extracts frames from a video file at a specified interval
and uploads them to a Google Cloud Storage (GCS) bucket.

Prerequisites:
1.  Google Cloud Project setup.
2.  A GCS bucket created in your project.
3.  Authentication:
    * Ensure you have authenticated to Google Cloud. The simplest way is
        to run `gcloud auth application-default login` in your terminal.
        This sets up credentials for your default application.
    * Alternatively, you can set the `GOOGLE_APPLICATION_CREDENTIALS`
        environment variable to the path of your service account key file.
4.  Install necessary Python libraries:
    `pip install opencv-python google-cloud-storage`

Usage:
    python your_script_name.py --video_path "path/to/your/video.mp4" --bucket_name "your-gcs-bucket-name" --interval_seconds 5 --gcs_folder "video_frames/my_video/"

Example:
    python video_frame_extractor.py --video_path "my_holiday_video.mp4" --bucket_name "my-ai-project-bucket" --interval_seconds 10 --gcs_folder "holiday_video_frames/"
"""

import os
import argparse
import cv2
from google.cloud import storage
from datetime import datetime
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'key.json'

def extract_frames_and_upload_to_gcs(
        video_path: str,
        bucket_name: str,
        interval_seconds: float = 1.0,
        gcs_folder: str = "extracted_frames/"
):
    """
    Extracts frames from a video at a specified interval and uploads them to GCS.

    Args:
        video_path (str): The local path to the video file.
        bucket_name (str): The name of the GCS bucket to upload frames to.
        interval_seconds (float): The interval in seconds at which to extract frames.
                                  Defaults to 1.0 second (1 frame per second).
        gcs_folder (str): The folder/prefix within the GCS bucket where frames will be stored.
                          Ensure it ends with a '/' if you want it to act as a folder.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at '{video_path}'")
        return

    # Initialize GCS client
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        print(f"Successfully connected to GCS bucket: '{bucket_name}'")
    except Exception as e:
        print(f"Error connecting to GCS: {e}")
        print("Please ensure your Google Cloud authentication is set up correctly.")
        print("Try running `gcloud auth application-default login`.")
        return

    # Open the video file
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error: Could not open video file '{video_path}'.")
        return

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_seconds = total_frames / fps

    print(f"Video: '{video_path}'")
    print(f"FPS: {fps}")
    print(f"Total Frames: {total_frames}")
    print(f"Duration: {duration_seconds:.2f} seconds")
    print(f"Extracting frames every {interval_seconds} seconds.")

    # Calculate frame step based on interval_seconds
    frame_step = int(fps * interval_seconds)
    if frame_step < 1:
        frame_step = 1  # Ensure at least one frame is extracted if interval is very small

    extracted_count = 0
    current_frame_index = 0

    video_filename_base = os.path.splitext(os.path.basename(video_path))[0]
    timestamp_prefix = datetime.now().strftime("%Y%m%d_%H%M%S")

    try:
        while current_frame_index < total_frames:
            # Set the video capture position to the desired frame
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame_index)

            # Read the frame
            ret, frame = cap.read()

            if not ret:
                print(f"Warning: Could not read frame at index {current_frame_index}. Skipping.")
                break  # Exit loop if no more frames can be read

            # Generate a unique filename for the frame
            frame_filename = f"{video_filename_base}_{timestamp_prefix}_frame_{current_frame_index:07d}.jpg"
            gcs_blob_name = os.path.join(gcs_folder, frame_filename)

            # Encode the frame to JPEG format in memory
            # Quality can be adjusted (0-100, default is 95)
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 95]
            result, encoded_image = cv2.imencode('.jpg', frame, encode_param)

            if not result:
                print(f"Error: Could not encode frame {current_frame_index} to JPEG. Skipping.")
                current_frame_index += frame_step
                continue

            # Upload the encoded image (bytes) to GCS
            blob = bucket.blob(gcs_blob_name)
            blob.upload_from_string(encoded_image.tobytes(), content_type='image/jpeg')

            extracted_count += 1
            print(
                f"Uploaded frame {extracted_count} (index {current_frame_index}) to gs://{bucket_name}/{gcs_blob_name}")

            # Move to the next frame based on the interval
            current_frame_index += frame_step

    except Exception as e:
        print(f"An error occurred during frame extraction or upload: {e}")
    finally:
        # Release the video capture object
        cap.release()
        print(f"\nFinished processing. Total {extracted_count} frames uploaded to GCS.")


if __name__ == "__main__":
    extract_frames_and_upload_to_gcs(
        video_path='video.mp4',
        bucket_name='video_frames_agentic_ai',
        interval_seconds=1,
        gcs_folder=''
    )
