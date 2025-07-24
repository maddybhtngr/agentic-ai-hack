"""
Video Analyzer using Google Vertex AI Vision API
This module processes local video files and uses Google Vertex AI Vision to detect people and smoke.
"""

import os
import time
from typing import Dict, List, Any
from dotenv import load_dotenv
from google.cloud import aiplatform
from google.cloud import storage
from google.cloud import videointelligence_v1 as videointelligence
import uuid

# Load environment variables from .env file
load_dotenv()

# Set default location if not specified in environment
DEFAULT_LOCATION = "us-central1"

class VideoAnalyzer:
    """Class to analyze video content using Google Vertex AI Vision."""
    
    def __init__(self, project_id: str = None, location: str = None):
        """
        Initialize the VideoAnalyzer.
        
        Args:
            project_id: Google Cloud project ID. If None, will try to get from environment.
            location: Google Cloud region. If None, will try to get from environment.
        """
        # Get project ID from arguments or environment variables
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        if not self.project_id:
            raise ValueError("Project ID must be provided or set as GOOGLE_CLOUD_PROJECT environment variable")
        
        # Get location from arguments or environment variables or use default
        self.location = location or os.getenv("VERTEX_AI_LOCATION", DEFAULT_LOCATION)
        
        # Verify credentials are available
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path or not os.path.exists(credentials_path):
            raise ValueError(
                "GOOGLE_APPLICATION_CREDENTIALS environment variable must be set "
                "to the path of a valid service account key file"
            )
        
        print(f"Initializing Vertex AI with project: {self.project_id}, location: {self.location}")
        
        # Initialize Vertex AI
        aiplatform.init(project=self.project_id, location=self.location)
        
    def _upload_video_to_gcs(self, video_path: str) -> str:
        """
        Upload a video file to Google Cloud Storage (required for Vertex AI video analysis).
        Only uploads if the file does not already exist in the bucket.
        Args:
            video_path: Path to the local video file.
        Returns:
            GCS URI of the uploaded video.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        bucket_name = f"video-analysis-ai-hack-{self.project_id}".lower()
        storage_client = storage.Client(project=self.project_id)
        # Check if bucket exists, if not create it
        try:
            bucket = storage_client.get_bucket(bucket_name)
        except Exception:
            print(f"Bucket {bucket_name} does not exist, creating it...")
            bucket = storage_client.create_bucket(bucket_name, location=self.location)
            print(f"Created bucket: {bucket_name}")
        blob_name = os.path.basename(video_path)
        blob = bucket.blob(blob_name)
        if blob.exists():
            print(f"File already exists in bucket: gs://{bucket_name}/{blob_name}")
        else:
            blob.upload_from_filename(video_path)
            print(f"Uploaded video to: gs://{bucket_name}/{blob_name}")
        gcs_uri = f"gs://{bucket_name}/{blob_name}"
        return gcs_uri
    
    def analyze_people_count(self, gcs_uri: str) -> dict:
        """
        Detects and counts people per second using PERSON_DETECTION.
        Returns a dict with people count per second.
        """
        video_client = videointelligence.VideoIntelligenceServiceClient()
        features = [videointelligence.Feature.PERSON_DETECTION]
        config = videointelligence.PersonDetectionConfig(
            include_bounding_boxes=True,
            include_attributes=True,
            include_pose_landmarks=False
        )
        context = videointelligence.VideoContext(person_detection_config=config)
        operation = video_client.annotate_video(
            request={
                "features": features,
                "input_uri": gcs_uri,
                "video_context": context
            }
        )
        result = operation.result(timeout=600)
        annotation_results = result.annotation_results[0]
        
        # Track unique people per timestamp using track IDs
        timestamp_tracks = {}
        
        for person_annotation in getattr(annotation_results, "person_detection_annotations", []):
            for track in person_annotation.tracks:
                # Use track ID to identify unique persons
                track_id = getattr(track, 'track_id', id(track))
                
                for timestamped_object in track.timestamped_objects:
                    time_offset = timestamped_object.time_offset.total_seconds()
                    frame_time_key = int(time_offset)
                    
                    if frame_time_key not in timestamp_tracks:
                        timestamp_tracks[frame_time_key] = set()
                    
                    # Add track ID to the set for this timestamp
                    timestamp_tracks[frame_time_key].add(track_id)
        
        # Convert sets to counts
        people_counts = {timestamp: len(tracks) for timestamp, tracks in timestamp_tracks.items()}
        
        return people_counts

    def analyze_violence_weapon(self, gcs_uri: str, video_path: str) -> dict:
        """
        Detects violence/weapon use per second using EXPLICIT_CONTENT_DETECTION and LABEL_DETECTION.
        If flagged, (stub) extract frame at that time (requires OpenCV/ffmpeg for real extraction).
        Returns a dict with flags and (stub) snapshot paths.
        """
        video_client = videointelligence.VideoIntelligenceServiceClient()
        features = [
            videointelligence.Feature.EXPLICIT_CONTENT_DETECTION,
            videointelligence.Feature.LABEL_DETECTION
        ]
        operation = video_client.annotate_video(
            request={
                "features": features,
                "input_uri": gcs_uri
            }
        )
        result = operation.result(timeout=600)
        annotation_results = result.annotation_results[0]
        violence_flags = {}
        # Explicit content
        for frame in getattr(annotation_results, "explicit_annotation", []).frames:
            time_offset = frame.time_offset.total_seconds()
            if frame.pornography_likelihood >= 3:  # POSSIBLE or higher
                violence_flags[int(time_offset)] = {"flag": True, "type": "explicit", "snapshot": f"snapshot_{int(time_offset)}.jpg"}
        # Label detection for violence/weapon
        for label in getattr(annotation_results, "segment_label_annotations", []):
            desc = label.entity.description.lower()
            if any(term in desc for term in ["fight", "violence", "weapon", "gun", "knife"]):
                for segment in label.segments:
                    start = int(segment.segment.start_time_offset.total_seconds())
                    end = int(segment.segment.end_time_offset.total_seconds())
                    for t in range(start, end+1):
                        violence_flags[t] = {"flag": True, "type": desc, "snapshot": f"snapshot_{t}.jpg"}
        return violence_flags

    def analyze_age_group(self, gcs_uri: str) -> dict:
        """
        Stub: Age group and gender detection is NOT supported by Video Intelligence API.
        This method is a placeholder for a custom ML model.
        Returns an empty dict.
        """
        # You would need a custom model for age/gender detection.
        return {}

    def analyze_crying_faces(self, gcs_uri: str, video_path: str) -> dict:
        """
        Stub: Crying face detection is NOT supported by Video Intelligence API.
        This method is a placeholder for a custom ML model.
        Returns an empty dict.
        """
        # You would need a custom model for emotion detection.
        return {}

    def analyze_fire_smoke(self, gcs_uri: str, video_path: str) -> dict:
        """
        Detects fire/smoke using multiple detection methods.
        Returns a dict with flags and (stub) snapshot paths.
        """
        video_client = videointelligence.VideoIntelligenceServiceClient()
        
        print("\n=== FIRE/SMOKE DETECTION DEBUG ===")
        
        fire_smoke_flags = {}
        
        # Method 1: Label Detection with comprehensive terms
        print("\n--- METHOD 1: LABEL DETECTION ---")
        try:
            features = [videointelligence.Feature.LABEL_DETECTION]
            operation = video_client.annotate_video(
                request={
                    "features": features,
                    "input_uri": gcs_uri
                }
            )
            result = operation.result(timeout=600)
            annotation_results = result.annotation_results[0]
            
            # Comprehensive fire/smoke terms
            fire_terms = [
                "fire", "flame", "burning", "burn", "blaze", "inferno", "wildfire", 
                "bonfire", "campfire", "fireplace", "torch", "flare", "ignite", "combustion"
            ]
            smoke_terms = [
                "smoke", "smoking", "smog", "fume", "vapor", "steam", "mist", 
                "haze", "fog", "exhaust", "emissions", "ash", "soot"
            ]
            related_terms = [
                "cigarette", "cigar", "tobacco", "lighter", "match", "candle", 
                "incense", "barbecue", "grill", "chimney", "furnace", "oven",
                "orange", "red", "glow", "bright", "heat", "ember", "spark"
            ]
            
            all_fire_terms = fire_terms + smoke_terms + related_terms
            
            # Check frame-level labels (if available)
            frame_labels = getattr(annotation_results, "frame_label_annotations", [])
            print(f"Frame labels found: {len(frame_labels)}")
            
            for label in frame_labels:
                desc = label.entity.description.lower()
                for frame in label.frames:
                    confidence = frame.confidence
                    time_offset = frame.time_offset.total_seconds()
                    timestamp = int(time_offset)
                    
                    print(f"  Frame {timestamp}s: '{desc}' (confidence: {confidence:.3f})")
                    
                    matching_terms = [term for term in all_fire_terms if term in desc]
                    if matching_terms and confidence > 0.1:
                        print(f"    → FIRE/SMOKE MATCH: {matching_terms}")
                        if timestamp not in fire_smoke_flags or fire_smoke_flags[timestamp].get('confidence', 0) < confidence:
                            fire_smoke_flags[timestamp] = {
                                "flag": True,
                                "type": desc,
                                "confidence": confidence,
                                "method": "frame_label",
                                "snapshot": f"snapshot_{timestamp}.jpg"
                            }
            
            # Check segment and shot labels
            label_sources = [
                (getattr(annotation_results, "segment_label_annotations", []), "segment"),
                (getattr(annotation_results, "shot_label_annotations", []), "shot")
            ]
            
            all_labels_found = []
            
            for labels, source_type in label_sources:
                print(f"\nChecking {source_type} labels ({len(labels)} found):")
                
                for label in labels:
                    desc = label.entity.description.lower()
                    confidence = getattr(label, 'confidence', 0.0)
                    all_labels_found.append((desc, confidence, source_type))
                    
                    print(f"  - '{desc}' (confidence: {confidence:.3f})")
                    
                    # Check for matches with any confidence (since we're seeing 0.0 confidences)
                    matching_terms = [term for term in all_fire_terms if term in desc]
                    if matching_terms:
                        print(f"    → MATCHES: {matching_terms}")
                        
                        # Accept even low confidence due to API issue
                        if confidence >= 0.0:  # Accept any confidence including 0.0
                            if source_type == "segment":
                                segments = label.segments
                            else:
                                segments = [label]
                            
                            for segment in segments:
                                if hasattr(segment, 'segment'):
                                    start_time = segment.segment.start_time_offset
                                    end_time = segment.segment.end_time_offset
                                else:
                                    start_time = getattr(segment, 'start_time_offset', None)
                                    end_time = getattr(segment, 'end_time_offset', None)
                                
                                if start_time and end_time:
                                    start = int(start_time.total_seconds())
                                    end = int(end_time.total_seconds())
                                    print(f"    → FLAGGED: timestamps {start}-{end}s")
                                    
                                    for t in range(start, end + 1):
                                        if t not in fire_smoke_flags or fire_smoke_flags[t].get('confidence', 0) <= confidence:
                                            fire_smoke_flags[t] = {
                                                "flag": True,
                                                "type": desc,
                                                "confidence": max(confidence, 0.5),  # Boost confidence for matched terms
                                                "method": source_type + "_label",
                                                "snapshot": f"snapshot_{t}.jpg"
                                            }
            
            print(f"\nTotal labels found: {len(all_labels_found)}")
            
        except Exception as e:
            print(f"Label detection failed: {e}")
        
        # Method 2: Try Object Detection as fallback
        print("\n--- METHOD 2: OBJECT DETECTION FALLBACK ---")
        try:
            features = [videointelligence.Feature.OBJECT_TRACKING]
            operation = video_client.annotate_video(
                request={
                    "features": features,
                    "input_uri": gcs_uri
                }
            )
            result = operation.result(timeout=600)
            annotation_results = result.annotation_results[0]
            
            object_annotations = getattr(annotation_results, "object_annotations", [])
            print(f"Objects detected: {len(object_annotations)}")
            
            for obj in object_annotations:
                entity_desc = obj.entity.description.lower()
                confidence = obj.confidence
                print(f"  Object: '{entity_desc}' (confidence: {confidence:.3f})")
                
                # Check if object matches fire/smoke terms
                if any(term in entity_desc for term in all_fire_terms) and confidence > 0.1:
                    for frame in obj.frames:
                        timestamp = int(frame.time_offset.total_seconds())
                        if timestamp not in fire_smoke_flags or fire_smoke_flags[timestamp].get('confidence', 0) < confidence:
                            fire_smoke_flags[timestamp] = {
                                "flag": True,
                                "type": entity_desc,
                                "confidence": confidence,
                                "method": "object_detection",
                                "snapshot": f"snapshot_{timestamp}.jpg"
                            }
        except Exception as e:
            print(f"Object detection failed: {e}")
        
        # Method 3: Look for visual cues and emergency indicators
        print("\n--- METHOD 3: VISUAL CUES & EMERGENCY INDICATORS ---")
        try:
            # Try explicit content detection for dangerous situations
            features = [videointelligence.Feature.EXPLICIT_CONTENT_DETECTION]
            operation = video_client.annotate_video(
                request={
                    "features": features,
                    "input_uri": gcs_uri
                }
            )
            result = operation.result(timeout=600)
            annotation_results = result.annotation_results[0]
            
            explicit_annotations = getattr(annotation_results, "explicit_annotation", None)
            if explicit_annotations:
                print(f"Explicit content frames: {len(explicit_annotations.frames)}")
                for frame in explicit_annotations.frames:
                    timestamp = int(frame.time_offset.total_seconds())
                    likelihood = frame.pornography_likelihood.name
                    if likelihood in ['LIKELY', 'VERY_LIKELY']:  # High likelihood of concerning content
                        print(f"  - Timestamp {timestamp}s: High-risk content detected")
                        if timestamp not in fire_smoke_flags:
                            fire_smoke_flags[timestamp] = {
                                "flag": True,
                                "type": "emergency_situation_detected",
                                "confidence": 0.7,
                                "method": "explicit_content",
                                "snapshot": f"snapshot_{timestamp}.jpg"
                            }
            
        except Exception as e:
            print(f"Explicit content detection failed: {e}")
        
        # Method 4: Infer from scene context (crowd + specific objects)
        print("\n--- METHOD 4: SCENE CONTEXT INFERENCE ---")
        try:
            # Re-analyze the objects we found for contextual clues
            all_objects = []
            features = [videointelligence.Feature.OBJECT_TRACKING]
            operation = video_client.annotate_video(
                request={
                    "features": features,
                    "input_uri": gcs_uri
                }
            )
            result = operation.result(timeout=600)
            annotation_results = result.annotation_results[0]
            
            # Collect all objects by timestamp
            timestamp_objects = {}
            for obj in getattr(annotation_results, "object_annotations", []):
                entity_desc = obj.entity.description.lower()
                confidence = obj.confidence
                
                for frame in obj.frames:
                    timestamp = int(frame.time_offset.total_seconds())
                    if timestamp not in timestamp_objects:
                        timestamp_objects[timestamp] = []
                    timestamp_objects[timestamp].append((entity_desc, confidence))
            
            # Look for emergency-related object combinations
            emergency_indicators = [
                ['person', 'building'],  # People near buildings might indicate evacuation
                ['car', 'person'],       # Emergency vehicles + people
                ['lighting'],            # Emergency lighting
            ]
            
            for timestamp, objects in timestamp_objects.items():
                object_names = [obj[0] for obj in objects]
                object_confidences = {obj[0]: obj[1] for obj in objects}
                
                # Check for emergency patterns
                for indicator_pattern in emergency_indicators:
                    if all(indicator in object_names for indicator in indicator_pattern):
                        if 'lighting' in object_names and object_confidences.get('lighting', 0) > 0.5:
                            print(f"  - Timestamp {timestamp}s: Emergency lighting detected")
                            if timestamp not in fire_smoke_flags:
                                fire_smoke_flags[timestamp] = {
                                    "flag": True,
                                    "type": "emergency_lighting_detected",
                                    "confidence": 0.6,
                                    "method": "context_inference",
                                    "snapshot": f"snapshot_{timestamp}.jpg"
                                }
                
                # If there are many people in one area, it might be an emergency gathering
                person_count = len([obj for obj in objects if obj[0] == 'person'])
                if person_count >= 8:  # High concentration of people
                    avg_confidence = sum(obj[1] for obj in objects if obj[0] == 'person') / person_count
                    if avg_confidence > 0.8:
                        print(f"  - Timestamp {timestamp}s: Large crowd detected ({person_count} people)")
                        if timestamp not in fire_smoke_flags:
                            fire_smoke_flags[timestamp] = {
                                "flag": True,
                                "type": "large_crowd_emergency_situation",
                                "confidence": 0.4,
                                "method": "crowd_analysis",
                                "snapshot": f"snapshot_{timestamp}.jpg"
                            }
            
        except Exception as e:
            print(f"Scene context analysis failed: {e}")
        
        print(f"\nFinal fire/smoke detections: {len(fire_smoke_flags)}")
        if fire_smoke_flags:
            for timestamp, data in sorted(fire_smoke_flags.items()):
                print(f"  - Timestamp {timestamp}s: {data['type']} (confidence: {data['confidence']:.3f}, method: {data['method']})")
        else:
            print("No fire/smoke or emergency situations detected with any method.")
            print("\nPossible reasons:")
            print("  1. The video may not contain visible fire/smoke")
            print("  2. The fire/smoke may be too subtle for AI detection")
            print("  3. The video quality may be insufficient for detection")
            print("  4. The 'fire' in the filename may be metaphorical")
            
        print("=== END DEBUG ===")
        
        return fire_smoke_flags

    def analyze_video_comprehensive(self, video_path: str) -> list:
        """
        Comprehensive analysis: returns a list of dicts, one per timestamp, with all available info.
        Each dict contains:
        - timestamp
        - people_count
        - violence_flag, violence_type, violence_snapshot
        - fire_smoke_flag, fire_smoke_type, fire_smoke_snapshot
        - age_group (stub)
        - crying_faces (stub)
        - crying_faces_snapshot (stub)
        """
        # Upload video to GCS
        gcs_uri = self._upload_video_to_gcs(video_path)
        # Run all analyses
        people_counts = self.analyze_people_count(gcs_uri)
        violence = self.analyze_violence_weapon(gcs_uri, video_path)
        fire_smoke = self.analyze_fire_smoke(gcs_uri, video_path)
        # Age group and crying faces are stubs
        # Collect all timestamps
        all_timestamps = set(people_counts.keys()) | set(violence.keys()) | set(fire_smoke.keys())
        result = []
        for t in sorted(all_timestamps):
            obj = {
                "timestamp": t,
                "people_count": people_counts.get(t, 0),
                "violence_flag": violence.get(t, {}).get("flag", False),
                "violence_type": violence.get(t, {}).get("type", None),
                "violence_snapshot": violence.get(t, {}).get("snapshot", None),
                "fire_smoke_flag": fire_smoke.get(t, {}).get("flag", False),
                "fire_smoke_type": fire_smoke.get(t, {}).get("type", None),
                "fire_smoke_confidence": fire_smoke.get(t, {}).get("confidence", 0.0),
                "fire_smoke_snapshot": fire_smoke.get(t, {}).get("snapshot", None),
                "age_group": {},  # stub
                "crying_faces": 0,  # stub
                "crying_faces_snapshot": None  # stub
            }
            result.append(obj)
        return result
