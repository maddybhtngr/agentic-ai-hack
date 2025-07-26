import os
import json
import time
from typing import Dict, List
from dotenv import load_dotenv
from google.cloud import storage
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from collections import defaultdict

# Load environment variables from the correct path
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

DEFAULT_LOCATION = "us-central1"

class GeminiVideoAnalyzer:
    def __init__(self, project_id: str = None, location: str = None):
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        if not self.project_id:
            raise ValueError("Project ID must be provided or set as GOOGLE_CLOUD_PROJECT")
        self.location = location or os.getenv("VERTEX_AI_LOCATION", DEFAULT_LOCATION)
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path or not os.path.exists(credentials_path):
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS must be set to a valid service account key file")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        self.model = GenerativeModel("gemini-2.5-pro")
        print(f"GeminiVideoAnalyzer initialized for project '{self.project_id}' in '{self.location}'.")

    def _upload_video_to_gcs(self, video_path: str, cctv_id: str) -> str:
        print(f"Uploading {video_path} to GCS with organized folder structure...")
        bucket_name = f"video-analysis-heatmap-{self.project_id}".lower()
        storage_client = storage.Client(project=self.project_id)
        bucket = storage_client.bucket(bucket_name)
        if not bucket.exists():
            print(f"Bucket {bucket_name} not found. Creating new bucket.")
            bucket = storage_client.create_bucket(bucket_name, location=self.location)
        
        # Create organized folder structure: cctv_1/video.mp4, cctv_2/video.mp4, etc.
        folder_name = f"cctv_{cctv_id}"
        blob_name = f"{folder_name}/video.mp4"
        blob = bucket.blob(blob_name)
        
        if not blob.exists():
            blob.upload_from_filename(video_path, timeout=300)
            print(f"Video uploaded to gs://{bucket_name}/{blob_name}")
        else:
            print(f"Video already exists in GCS: gs://{bucket_name}/{blob_name}")
        
        return f"gs://{bucket_name}/{blob_name}"

    def _create_analysis_prompt(self) -> str:
        return """
You are an expert video analyst specializing in security and emergency detection. 
Analyze this video and provide detailed frame-by-frame analysis.

For EACH SECOND of the video, provide INDEPENDENT analysis (do not accumulate counts):

1. **People Count & Demographics**: Count ONLY the people visible AT THIS SPECIFIC TIMESTAMP
   - Count each person you can see in the frame at this exact moment
   - DO NOT add to previous counts - each timestamp is independent
   - Provide demographic breakdown of visible people at this moment

2. **People Positions**: For each person visible at this timestamp, estimate their position
   - **CRITICAL REQUIREMENT**: The number of heatmap_points MUST EXACTLY EQUAL the people_count
   - If you count 15 people, you must provide exactly 15 heatmap coordinate points
   - Every person counted must have a corresponding (x, y) coordinate in heatmap_points
   - DO NOT provide fewer heatmap points than people count - this creates data inconsistency

3. **Fire Detection**: Look for flames, fire, burning objects, torches, molotov cocktails
4. **Smoke Detection**: Look for smoke, smog, haze from fires  
5. **Violence Detection**: Look for riots, protests, fighting, weapons, aggressive crowds
6. **Weapon Detection**: Identify any weapons, guns, knives, sticks, stones, bottles
7. **Sentiment Analysis**: Analyze crowd emotions and behavioral patterns
8. **Security Assessment**: Evaluate suspicious activities and crowd behavior

Return your analysis as a JSON object with this exact structure:
```json
{
  "0": {
    "people_count": 15,
    "demographics": {
      "male_count": 8,
      "female_count": 5,
      "child_count": 1,
      "elder_count": 1
    },
    "heatmap_points": [
      {"x": 0.1, "y": 0.2, "value": 95}, {"x": 0.3, "y": 0.4, "value": 90}, {"x": 0.7, "y": 0.6, "value": 85},
      {"x": 0.2, "y": 0.8, "value": 90}, {"x": 0.9, "y": 0.3, "value": 85}, {"x": 0.5, "y": 0.5, "value": 98},
      {"x": 0.15, "y": 0.7, "value": 88}, {"x": 0.8, "y": 0.25, "value": 92}, {"x": 0.4, "y": 0.9, "value": 87},
      {"x": 0.6, "y": 0.15, "value": 89}, {"x": 0.85, "y": 0.75, "value": 93}, {"x": 0.25, "y": 0.45, "value": 91},
      {"x": 0.65, "y": 0.8, "value": 86}, {"x": 0.35, "y": 0.1, "value": 94}, {"x": 0.75, "y": 0.55, "value": 89}
    ],
    "security_flags": {
      "violence_flag": true,
      "fire_flag": true,
      "smoke_flag": false,
      "weapon_detected": true,
      "weapon_names": ["sticks", "stones"],
      "suspicious_behavior": true,
      "crowd_density": "high",
      "emergency_evacuation": false
    },
    "sentiment_analysis": {
      "dominant_emotions": ["anger", "fear", "aggression", "panic"],
      "crowd_mood": "hostile",
      "energy_level": "high"
    },
    "environmental": {
      "lighting_condition": "daylight",
      "weather_condition": "clear",
      "vehicles_present": false
    }
  }
}
```

Key guidelines:
- **CRITICAL**: Each timestamp is INDEPENDENT - do not accumulate people counts across frames
- **CRITICAL**: heatmap_points array LENGTH must EXACTLY EQUAL people_count number
- **CRITICAL**: If people_count = 85, then heatmap_points must contain exactly 85 coordinate objects
- Count ONLY people visible in that specific frame/second - not cumulative totals
- "value" in heatmap_points should be confidence (70-100)
- Demographics: Analyze age groups and gender (male, female, child <16, elder >60)
- Weapons: Look for guns, knives, sticks, stones, bottles, any threatening objects
- Sentiment: Identify emotions like anger, fear, panic, aggression, calm, excitement
- Crowd density: "low" (<10), "medium" (10-25), "high" (25-50), "very_high" (>50)
- Suspicious behavior: unusual movements, gathering patterns, aggressive gestures
- Environmental: lighting (daylight/twilight/night), weather (clear/cloudy/rain)
- Look carefully for fire/flames - they may be from torches, burning objects, or protests
- Analyze the entire video duration, providing data for each second
- ENSURE the JSON is complete and valid
- **DOUBLE-CHECK**: Verify heatmap_points count matches people_count before responding

Provide ONLY the JSON response, no other text.
"""

    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini's JSON response and convert to our expected format"""
        try:
            # Clean the response text - remove any markdown formatting
            clean_text = response_text.strip()
            if clean_text.startswith('```json'):
                clean_text = clean_text[7:]  # Remove ```json
            if clean_text.endswith('```'):
                clean_text = clean_text[:-3]  # Remove ```
            clean_text = clean_text.strip()
            
            # Additional cleaning: fix common JSON truncation issues
            import re
            
            # Remove trailing commas before closing brackets/braces
            clean_text = re.sub(r',\s*([}\]])', r'\1', clean_text)
            
            # Handle truncated JSON by finding the last complete object
            lines = clean_text.split('\n')
            cleaned_lines = []
            brace_count = 0
            
            for line in lines:
                # Count braces to track JSON structure
                brace_count += line.count('{') - line.count('}')
                
                # Only include lines that maintain valid JSON structure
                if brace_count >= 0:
                    cleaned_lines.append(line)
                else:
                    # If we get negative brace count, the JSON is malformed
                    break
            
            # Ensure JSON is properly closed
            clean_text = '\n'.join(cleaned_lines)
            if brace_count > 0:
                # Add missing closing braces
                clean_text += '\n' + '}' * brace_count
            
            print(f"Attempting to parse cleaned JSON (first 300 chars): {clean_text[:300]}...")
            print(f"JSON brace balance check - opening: {clean_text.count('{')} closing: {clean_text.count('}')}")
            print(f"Cleaned JSON length: {len(clean_text)} characters")
            
            # Parse JSON
            gemini_data = json.loads(clean_text)
            
            # Handle both array format and object format from Gemini
            final_data = {}
            
            if isinstance(gemini_data, list):
                # Handle array format: [{"frame_sec": 0, ...}, {"frame_sec": 1, ...}]
                for item in gemini_data:
                    timestamp = item.get('frame_sec', 0)
                    final_data[timestamp] = self._extract_analysis_data(item)
            else:
                # Handle object format: {"0": {...}, "1": {...}}
                for timestamp_str, data in gemini_data.items():
                    timestamp = int(timestamp_str)
                    final_data[timestamp] = self._extract_analysis_data(data)
            
            return dict(sorted(final_data.items()))
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Raw response (first 500 chars): {response_text[:500]}...")
            print(f"Raw response (last 200 chars): ...{response_text[-200:]}")
            return {}
    
    def _extract_analysis_data(self, data: dict) -> dict:
        """Extract and standardize analysis data from Gemini response"""
        # Extract security flags
        security_flags = data.get('security_flags', {})
        
        return {
            'heatmap_points': data.get('heatmap_points', []),
            'people_count': data.get('people_count', 0),
            
            # Demographics
            'demographics': data.get('demographics', {
                'male_count': 0,
                'female_count': 0,
                'child_count': 0,
                'elder_count': 0
            }),
            
            # Security flags (maintain backward compatibility)
            'violence_flag': security_flags.get('violence_flag', data.get('violence_flag', False)),
            'fire_flag': security_flags.get('fire_flag', data.get('fire_flag', False)),
            'smoke_flag': security_flags.get('smoke_flag', data.get('smoke_flag', False)),
            
            # New security features
            'weapon_detected': security_flags.get('weapon_detected', False),
            'weapon_names': security_flags.get('weapon_names', []),
            'suspicious_behavior': security_flags.get('suspicious_behavior', False),
            'crowd_density': security_flags.get('crowd_density', 'low'),
            'emergency_evacuation': security_flags.get('emergency_evacuation', False),
            
            # Sentiment analysis
            'sentiment_analysis': data.get('sentiment_analysis', {
                'dominant_emotions': [],
                'crowd_mood': 'neutral',
                'energy_level': 'low'
            }),
            
            # Environmental conditions
            'environmental': data.get('environmental', {
                'lighting_condition': 'unknown',
                'weather_condition': 'unknown',
                'vehicles_present': False
            })
        }

    def _analyze_with_gemini(self, video_path: str) -> Dict:
        """Analyze video using Gemini 2.5 Pro"""
        print("--- Starting Gemini 2.5 Pro Video Analysis ---")
        
        try:
            # Create video part for Gemini
            video_part = Part.from_uri(
                uri=video_path,
                mime_type="video/mp4"
            )
            
            prompt = self._create_analysis_prompt()
            print("Sending video to Gemini 2.5 Pro for analysis...")
            
            # Generate content with enhanced settings
            response = self.model.generate_content(
                [prompt, video_part],
                generation_config={
                    "temperature": 0.1,  # Low temperature for consistent analysis
                    "max_output_tokens": 60000,  # Maximum tokens for complete heatmap data
                }
            )
            
            print("Gemini analysis complete, parsing response...")
            return self._parse_gemini_response(response.text)
            
        except Exception as e:
            print(f"Error in Gemini analysis: {e}")
            return {}

    def analyze_video_comprehensive(self, video_path: str, cctv_id: str) -> Dict:
        """Main method for comprehensive video analysis"""
        print(f"Starting comprehensive analysis for {video_path}...")
        
        # Upload video to GCS with organized folder structure
        gcs_uri = self._upload_video_to_gcs(video_path, cctv_id)
        
        # Analyze with Gemini 2.5 Pro
        analysis_results = self._analyze_with_gemini(gcs_uri)
        
        if not analysis_results:
            print("Gemini analysis failed - no data returned")
            return {}
        
        # Print summary statistics
        total_timestamps = len(analysis_results)
        timestamps_with_people = sum(1 for data in analysis_results.values() if data.get('people_count', 0) > 0)
        timestamps_with_violence = sum(1 for data in analysis_results.values() if data.get('violence_flag', False))
        timestamps_with_fire = sum(1 for data in analysis_results.values() if data.get('fire_flag', False))
        timestamps_with_smoke = sum(1 for data in analysis_results.values() if data.get('smoke_flag', False))
        
        print(f"Gemini Analysis Complete: {total_timestamps} timestamps, {timestamps_with_people} with people, {timestamps_with_violence} with violence, {timestamps_with_fire} with fire, {timestamps_with_smoke} with smoke")
        
        return analysis_results

# Backward compatibility alias
VideoAnalyzer = GeminiVideoAnalyzer
