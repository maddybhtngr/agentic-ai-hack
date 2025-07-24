
# -*- coding: utf-8 -*-
"""
This script extracts frames from a video file at a specified interval,
uploads them to a Google Cloud Storage (GCS) bucket,
then performs face detection using Google Cloud Vision API on these frames,
crops the detected faces, and stores the cropped faces in ANOTHER GCS bucket.

Prerequisites:
1.  Google Cloud Project setup.
2.  TWO GCS buckets created in your project (one for original frames, one for cropped faces).
3.  Authentication:
    * Ensure you have authenticated to Google Cloud. The simplest way is
        to run `gcloud auth application-default login` in your terminal.
        This sets up credentials for your default application.
    * Alternatively, you can set the `GOOGLE_APPLICATION_CREDENTIALS`
        environment variable to the path of your service account key file.
4.  Enable the Cloud Vision API in your Google Cloud project.
5.  Install necessary Python libraries:
    `pip install opencv-python google-cloud-storage google-cloud-vision`

Usage:
    python your_script_name.py --video_path "path/to/your/video.mp4" --original_frames_bucket_name "your-original-frames-bucket" --interval_seconds 5 --gcs_folder "video_frames/my_video/" --cropped_faces_bucket_name "your-cropped-faces-bucket" --cropped_faces_gcs_folder "cropped_faces/my_video/"

Example:
    python video_frame_extractor.py --video_path "my_holiday_video.mp4" --original_frames_bucket_name "my-holiday-frames" --interval_seconds 10 --gcs_folder "holiday_video_frames/" --cropped_faces_bucket_name "my-holiday-faces" --cropped_faces_gcs_folder "holiday_cropped_faces/"
"""

import os
import argparse
import cv2
import io  # For handling image bytes
from google.cloud import storage
from google.cloud import vision  # Import Google Cloud Vision API
from datetime import datetime

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'key.json'

def extract_frames_and_upload_to_gcs(
        video_path: str,
        original_frames_bucket_name: str,  # Renamed for clarity
        interval_seconds: float = 1.0,
        gcs_folder: str = "extracted_frames/",
        cropped_faces_bucket_name: str = "cropped_faces_bucket",  # New argument for a different bucket
        cropped_faces_gcs_folder: str = "cropped_faces/"
):
    """
    Extracts frames from a video at a specified interval, uploads them to a GCS bucket,
    performs face detection using Google Cloud Vision API, crops faces,
    and stores cropped faces in a DIFFERENT GCS bucket.

    Args:
        video_path (str): The local path to the video file.
        original_frames_bucket_name (str): The name of the GCS bucket for original frames.
        interval_seconds (float): The interval in seconds at which to extract frames.
                                  Defaults to 1.0 second (1 frame per second).
        gcs_folder (str): The folder/prefix within the original frames GCS bucket where original frames will be stored.
                          Ensure it ends with a '/' if you want it to act as a folder.
        cropped_faces_bucket_name (str): The name of the GCS bucket for cropped faces.
        cropped_faces_gcs_folder (str): The folder/prefix within the cropped faces GCS bucket where cropped faces will be stored.
                                        Ensure it ends with a '/' for folder-like behavior.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at '{video_path}'")
        return

    # Initialize GCS client for original frames bucket
    try:
        storage_client = storage.Client()
        original_frames_bucket = storage_client.bucket(original_frames_bucket_name)
        print(f"Successfully connected to GCS bucket for original frames: '{original_frames_bucket_name}'")
    except Exception as e:
        print(f"Error connecting to original frames GCS bucket: {e}")
        print("Please ensure your Google Cloud authentication is set up correctly.")
        print("Try running `gcloud auth application-default login`.")
        return

    # Initialize GCS client for cropped faces bucket
    try:
        cropped_faces_bucket = storage_client.bucket(cropped_faces_bucket_name)
        print(f"Successfully connected to GCS bucket for cropped faces: '{cropped_faces_bucket_name}'")
    except Exception as e:
        print(f"Error connecting to cropped faces GCS bucket: {e}")
        print("Please ensure the cropped faces bucket exists and is accessible.")
        return

    # Initialize Google Cloud Vision API client
    try:
        vision_client = vision.ImageAnnotatorClient()
        print("Successfully initialized Google Cloud Vision API client.")
    except Exception as e:
        print(f"Error initializing Vision API client: {e}")
        print("Please ensure the Cloud Vision API is enabled for your project.")
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
    faces_detected_count = 0

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

            # Generate a unique filename for the original frame
            frame_filename = f"{video_filename_base}_{timestamp_prefix}_frame_{current_frame_index:07d}.jpg"
            gcs_blob_name = os.path.join(gcs_folder, frame_filename)

            # Encode the frame to JPEG format in memory
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 100]
            result, encoded_image = cv2.imencode('.jpg', frame, encode_param)

            if not result:
                print(f"Error: Could not encode frame {current_frame_index} to JPEG. Skipping.")
                current_frame_index += frame_step
                continue

            # Upload the encoded original image (bytes) to the ORIGINAL FRAMES GCS bucket
            blob = original_frames_bucket.blob(gcs_blob_name)
            blob.upload_from_string(encoded_image.tobytes(), content_type='image/jpeg')
            extracted_count += 1
            print(
                f"Uploaded original frame {extracted_count} (index {current_frame_index}) to gs://{original_frames_bucket_name}/{gcs_blob_name}")

            # --- Face Detection and Cropping ---
            try:
                # Prepare image for Vision API
                image = vision.Image(content=encoded_image.tobytes())

                # Perform face detection
                response = vision_client.face_detection(image=image)
                faces = response.face_annotations

                if faces:
                    print(f"  Detected {len(faces)} face(s) in frame {current_frame_index}.")
                    for i, face in enumerate(faces):
                        # Get bounding box coordinates
                        vertices = [(v.x, v.y) for v in face.bounding_poly.vertices]

                        # Ensure coordinates are within image bounds
                        x_min = max(0, min(v[0] for v in vertices))
                        y_min = max(0, min(v[1] for v in vertices))
                        x_max = min(frame.shape[1], max(v[0] for v in vertices))
                        y_max = min(frame.shape[0], max(v[1] for v in vertices))

                        # Crop the face from the original frame
                        # Note: OpenCV uses (y_min:y_max, x_min:x_max) for slicing
                        cropped_face = frame[y_min:y_max, x_min:x_max]

                        if cropped_face.shape[0] == 0 or cropped_face.shape[1] == 0:
                            print(
                                f"    Warning: Cropped face {i} from frame {current_frame_index} has zero dimension. Skipping.")
                            continue

                        # Encode the cropped face to JPEG
                        result_cropped, encoded_cropped_face = cv2.imencode('.jpg', cropped_face, encode_param)

                        if result_cropped:
                            # Generate unique filename for the cropped face
                            cropped_face_filename = f"{video_filename_base}_{timestamp_prefix}_frame_{current_frame_index:07d}_face_{i:02d}.jpg"
                            # gcs_cropped_blob_name = os.path.join(cropped_faces_gcs_folder, cropped_face_filename)
                            gcs_cropped_blob_name = 'school/' + cropped_face_filename

                            # Upload the cropped face to the CROPPED FACES GCS bucket
                            cropped_blob = cropped_faces_bucket.blob(gcs_cropped_blob_name)
                            cropped_blob.upload_from_string(encoded_cropped_face.tobytes(), content_type='image/jpeg')
                            faces_detected_count += 1
                            print(
                                f"    Uploaded cropped face {i} to gs://{cropped_faces_bucket_name}/{gcs_cropped_blob_name}")
                        else:
                            print(
                                f"    Error: Could not encode cropped face {i} from frame {current_frame_index} to JPEG.")
                else:
                    print(f"  No faces detected in frame {current_frame_index}.")

            except Exception as vision_e:
                print(f"  Error during Vision API face detection for frame {current_frame_index}: {vision_e}")
            # --- End Face Detection and Cropping ---

            # Move to the next frame based on the interval
            current_frame_index += frame_step

    except Exception as e:
        print(f"An error occurred during frame extraction or upload: {e}")
    finally:
        # Release the video capture object
        cap.release()
        print(f"\nFinished processing. Total {extracted_count} original frames uploaded to GCS.")
        print(f"Total {faces_detected_count} cropped faces uploaded to GCS.")


if __name__ == "__main__":
    extract_frames_and_upload_to_gcs(
        video_path='video-school.mp4',
        original_frames_bucket_name='video_frames_agentic_ai',
        interval_seconds=1,
        gcs_folder='',
        cropped_faces_bucket_name='source_image_for_analysis',
        cropped_faces_gcs_folder=''
    )
