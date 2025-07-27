import os
import json
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict, deque
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

from google.cloud import storage
from google.cloud import aiplatform
from google.cloud.aiplatform import TabularDataset, AutoMLForecastingTrainingJob
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import pandas as pd


@dataclass
class FlowMetrics:
    """Represents crowd flow metrics at a specific timestamp with incident triggers"""
    timestamp: int
    inflow_count: int
    outflow_count: int
    net_flow: int
    total_people: int
    density_level: str
    average_velocity: float
    movement_vectors: List[Tuple[float, float]]
    congestion_points: List[Tuple[float, float]]
    # Critical incident trigger flags
    fire_detected: bool = False
    smoke_detected: bool = False
    violence_detected: bool = False
    weapon_detected: bool = False
    weapon_types: List[str] = None
    suspicious_behavior: bool = False
    emergency_evacuation: bool = False
    
    def __post_init__(self):
        if self.weapon_types is None:
            self.weapon_types = []


@dataclass
class PredictionResult:
    """Represents incident prediction results"""
    incident_probability: float
    prediction_confidence: float
    predicted_incident_type: str
    time_to_incident_seconds: int
    risk_factors: List[str]
    recommended_action: str
    alert_level: str  # 'green', 'yellow', 'orange', 'red'


class FlowPredictor:
    """Advanced Flow Analysis and Incident Prediction System"""
    
    def __init__(self, project_id: str = None, location: str = "us-central1"):
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location
        
        # Initialize APIs
        vertexai.init(project=self.project_id, location=self.location)
        aiplatform.init(project=self.project_id, location=self.location)
        
        # Use Gemini 2.5 Pro for advanced flow analysis (consistent with video_analyzer.py)
        self.storage_client = storage.Client(project=self.project_id)
        self.gemini_model = GenerativeModel("gemini-2.5-pro")
        
        # Initialize Vertex AI Forecasting
        self.forecasting_model = None
        self.time_series_data = []  # Store for training forecasting model
        
        # Flow tracking data structures
        self.flow_history = deque(maxlen=60)  # Keep 60 seconds of flow data
        self.person_tracks = {}  # Track individual people across frames
        self.movement_patterns = []
        
        # Prediction thresholds
        self.CONGESTION_THRESHOLD = 0.7
        self.VELOCITY_THRESHOLD = 2.0  # meters per second
        self.forecasting_model = None
        self.prediction_cache = {}
        
        # Initialize with known available dataset (from recent runs)
        self.cached_dataset_resource = 'projects/537730884870/locations/us-central1/datasets/601408121381847040'
        
        # Dynamic model discovery (no hardcoding)
        self.available_model_resources = []
        
        # Dynamically discover available models
        self._discover_available_models()
        
        # Try to load existing trained model
        self._initialize_existing_model()
        
        print(f"🚀 FlowPredictor initialized with Vertex AI Vision + Forecasting for '{self.project_id}'")
        print(f"🎯 Features: Gemini 2.5 Pro Flow Analysis + Vertex AI Forecasting + 10min Prediction")
        print(f"💾 Cached Dataset: {self.cached_dataset_resource}")
        print(f"🧠 Model Status: {'✅ Ready' if self.forecasting_model else '⏳ Will train on demand'}")
        
        # Show relationship between datasets and models
        self._show_dataset_model_relationship()

    def _discover_available_models(self):
        """Dynamically discover available trained models in the project"""
        try:
            print("🔍 Dynamically discovering available forecasting models...")
            
            # List all models in the project/location
            models = aiplatform.Model.list(
                # Note: Vertex AI models don't have specific model_type filter
                # We'll filter by checking display_name patterns instead
                order_by='create_time desc'  # Get newest first
            )
            
            # Filter for successfully trained forecasting models
            for model in models:
                try:
                    # Check if it's a forecasting model by display name
                    display_name = getattr(model, 'display_name', '').lower()
                    if ('forecast' in display_name or 'flow-incident' in display_name or 
                        'time-series' in display_name) and model.state == "SUCCEEDED":
                        
                        model_resource = model.resource_name
                        self.available_model_resources.append(model_resource)
                        print(f"✅ Found forecasting model: {display_name} - {model_resource}")
                        
                except Exception as e:
                    print(f"⚠️ Could not check model: {e}")
                    continue
            
            if not self.available_model_resources:
                print("🎯 No trained forecasting models found in project")
            else:
                print(f"📊 Discovered {len(self.available_model_resources)} available models")
                
        except Exception as e:
            print(f"⚠️ Error discovering models: {e}")
            print("🔄 Will proceed without pre-trained models")

    def _initialize_existing_model(self):
        """Try to load existing trained models from known resources"""
        for model_resource in self.available_model_resources:
            try:
                print(f"🔄 Attempting to load existing model: {model_resource}")
                model = aiplatform.Model(model_resource)
                
                # Verify model is ready
                if model.state == "SUCCEEDED":
                    self.forecasting_model = model
                    self.forecasting_model_resource = model_resource
                    print(f"✅ Successfully loaded existing trained model: {model_resource}")
                    return
                else:
                    print(f"⚠️ Model {model_resource} not ready (state: {model.state})")
                    
            except Exception as e:
                print(f"⚠️ Could not load model {model_resource}: {e}")
                continue
        
        print("🎯 No existing trained models available - will train on demand")

    def _show_dataset_model_relationship(self):
        """Explain the relationship between datasets and models"""
        print()
        print("📊 DATASET → MODEL RELATIONSHIP:")
        print(f"  📁 Dataset: Contains training data (people counts, timestamps, risk scores)")
        print(f"  🧠 Model: ML model trained FROM the dataset to make predictions")
        print(f"  🔄 Flow: Dataset → AutoMLForecastingTrainingJob → Model → Predictions")
        print()
        if self.available_model_resources:
            print(f"  ✅ Found {len(self.available_model_resources)} models trained in this project")
            for i, model_resource in enumerate(self.available_model_resources, 1):
                model_id = model_resource.split('/')[-1]
                print(f"    {i}. Model ID: {model_id}")
        else:
            print(f"  ⚠️ No models found - will create new model from dataset when needed")
            print(f"  📊 Dataset available: {self.cached_dataset_resource.split('/')[-1]}")
            print(f"  🔄 Next: AutoMLForecastingTrainingJob will create model from this dataset")
        print()

    def analyze_video_flow(self, video_path: str, cctv_id: str) -> Dict[int, FlowMetrics]:
        """Analyze video for people flow patterns using Vertex AI Vision + Gemini"""
        print(f"🎥 Starting advanced flow analysis for {video_path}...")
        
        # Upload video to GCS if not already there
        gcs_uri = self._upload_to_gcs(video_path, cctv_id)
        
        # Use Gemini 2.5 Pro for comprehensive flow analysis
        flow_metrics = self._analyze_flow_with_gemini(gcs_uri, cctv_id)
        
        print(f"✅ Flow analysis complete: {len(flow_metrics)} timestamps processed")
        return flow_metrics

    def _analyze_flow_with_gemini(self, gcs_uri: str, cctv_id: str) -> Dict[int, FlowMetrics]:
        """Use Gemini 2.5 Pro for advanced flow analysis"""
        print("🤖 Using Gemini 2.5 Pro for flow analysis...")
        
        try:
            # Create video part for Gemini
            video_part = Part.from_uri(uri=gcs_uri, mime_type="video/mp4")
            
            # Enhanced prompt for flow analysis
            flow_prompt = self._create_flow_analysis_prompt()
            
            # Generate analysis
            response = self.gemini_model.generate_content(
                [flow_prompt, video_part],
                generation_config={
                    "temperature": 0.1,
                    "max_output_tokens": 50000,
                }
            )
            
            # Parse response to flow metrics
            flow_data = self._parse_flow_response(response.text)
            
            return flow_data
            
        except Exception as e:
            print(f"❌ Error in Gemini flow analysis: {e}")
            return {}

    def _create_flow_analysis_prompt(self) -> str:
        """Create enhanced prompt for Gemini flow analysis"""
        return """
You are an expert crowd flow analyst. Analyze this video to track people movement and predict crowd flow patterns.

For EACH SECOND of the video, provide detailed flow analysis:

1. **People Tracking**: Count people and track their positions
   - Track individuals across frames to detect entry/exit
   - Calculate movement vectors and velocities
   - Identify unique person tracks

2. **Flow Analysis**: 
   - **Inflow**: People entering the frame/area from boundaries
   - **Outflow**: People leaving the frame/area to boundaries  
   - **Net Flow**: inflow_count - outflow_count
   - **Movement Patterns**: crowd_surge, evacuation_flow, bottleneck_formation, normal_flow, panic_scatter

3. **Density & Congestion**:
   - Calculate crowd density level: low (<10), medium (10-30), high (30-60), critical (>60)
   - Identify congestion points where people cluster
   - Measure average movement velocity

4. **Predictive Indicators**:
   - Detect pre-incident patterns (sudden stops, direction changes, convergence)
   - Identify evacuation precursors (rapid outflow, panic movements)
   - Spot bottleneck formation and crowd pressure buildup

5. **CRITICAL INCIDENT TRIGGERS** (High Priority for Forecasting):
   - **Fire Detection**: Look for flames, smoke, burning objects
   - **Smoke Detection**: Identify smoke clouds, hazy air, visibility reduction
   - **Violence Detection**: Fighting, hitting, aggressive behavior, panic responses
   - **Weapon Detection**: Guns, knives, sticks, stones, bottles, any threatening objects
   - **Suspicious Behavior**: Unusual movements, threatening gestures, panic reactions
   - **Emergency Evacuation**: Rapid mass exodus, emergency responses

Return JSON with this structure:
```json
{
  "0": {
    "total_people": 25,
    "inflow_count": 3,
    "outflow_count": 1,
    "net_flow": 2,
    "density_level": "medium",
    "average_velocity": 0.15,
    "movement_patterns": ["normal_flow"],
    "congestion_points": [{"x": 0.6, "y": 0.4}],
    "movement_vectors": [{"dx": 0.02, "dy": -0.01, "magnitude": 0.022}],
    "flow_quality": "stable",
    "fire_detected": false,
    "smoke_detected": false,
    "violence_detected": false,
    "weapon_detected": false,
    "weapon_types": [],
    "suspicious_behavior": false,
    "emergency_evacuation": false
  }
}
```

Key Guidelines:
- **CRITICAL**: Track people across frames to accurately detect inflow/outflow
- Monitor frame boundaries (edges) for entry/exit detection
- Calculate realistic movement velocities (typical walking = 0.05-0.2 normalized units/second)
- Identify congestion where 5+ people cluster in small areas
- movement_patterns: ["crowd_surge", "evacuation_flow", "bottleneck_formation", "normal_flow", "panic_scatter", "gathering"]
- flow_quality: "stable", "unstable", "concerning", "dangerous"
- Provide analysis for entire video duration

Respond with ONLY the JSON, no other text.
"""

    def _parse_flow_response(self, response_text: str) -> Dict[int, FlowMetrics]:
        """Parse Gemini response into FlowMetrics objects"""
        try:
            # Clean and parse JSON
            cleaned_response = self._clean_json_response(response_text)
            flow_data = json.loads(cleaned_response)
            
            metrics = {}
            for timestamp_str, data in flow_data.items():
                timestamp = int(timestamp_str)
                
                # Create FlowMetrics object with security flags
                metrics[timestamp] = FlowMetrics(
                    timestamp=timestamp,
                    inflow_count=data.get('inflow_count', 0),
                    outflow_count=data.get('outflow_count', 0),
                    net_flow=data.get('net_flow', 0),
                    total_people=data.get('total_people', 0),
                    density_level=data.get('density_level', 'low'),
                    average_velocity=data.get('average_velocity', 0.0),
                    movement_vectors=self._parse_movement_vectors(data.get('movement_vectors', [])),
                    congestion_points=self._parse_congestion_points(data.get('congestion_points', [])),
                    # Critical incident trigger flags
                    fire_detected=data.get('fire_detected', False),
                    smoke_detected=data.get('smoke_detected', False),
                    violence_detected=data.get('violence_detected', False),
                    weapon_detected=data.get('weapon_detected', False),
                    weapon_types=data.get('weapon_types', []),
                    suspicious_behavior=data.get('suspicious_behavior', False),
                    emergency_evacuation=data.get('emergency_evacuation', False)
                )
            
            print(f"✅ Parsed {len(metrics)} timestamps of flow data")
            return metrics
            
        except Exception as e:
            print(f"❌ Error parsing flow response: {e}")
            return {}

    def _clean_json_response(self, response_text: str) -> str:
        """Clean Gemini response to extract valid JSON"""
        # Remove markdown code blocks
        cleaned = response_text.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        
        # Find JSON boundaries
        start = cleaned.find('{')
        end = cleaned.rfind('}') + 1
        
        if start != -1 and end > start:
            return cleaned[start:end]
        
        return cleaned

    def _parse_movement_vectors(self, vectors_data: List[dict]) -> List[Tuple[float, float]]:
        """Parse movement vectors from response data"""
        vectors = []
        for vector in vectors_data:
            if isinstance(vector, dict) and 'dx' in vector and 'dy' in vector:
                vectors.append((float(vector['dx']), float(vector['dy'])))
        return vectors

    def _parse_congestion_points(self, congestion_data: List[dict]) -> List[Tuple[float, float]]:
        """Parse congestion points from response data"""
        points = []
        for point in congestion_data:
            if isinstance(point, dict) and 'x' in point and 'y' in point:
                points.append((float(point['x']), float(point['y'])))
        return points

    def _legacy_process_person_detections(self, annotations) -> Dict[int, FlowMetrics]:
        """Process person detection results to extract flow metrics"""
        flow_data = {}
        
        # Process person detection annotations
        for person_detection in annotations.person_detection_annotations:
            for track in person_detection.tracks:
                track_id = track.track_id
                
                # Process each timestamped object in the track
                for timestamped_object in track.timestamped_objects:
                    # Extract timestamp (convert to seconds)
                    time_offset = timestamped_object.time_offset
                    timestamp = int(time_offset.seconds + time_offset.microseconds / 1e6)
                    
                    # Extract bounding box for position
                    if timestamped_object.normalized_bounding_box:
                        bbox = timestamped_object.normalized_bounding_box
                        center_x = (bbox.left + bbox.right) / 2
                        center_y = (bbox.top + bbox.bottom) / 2
                        
                        # Store person tracking data
                        if timestamp not in flow_data:
                            flow_data[timestamp] = {
                                'persons': [],
                                'track_positions': {}
                            }
                        
                        flow_data[timestamp]['persons'].append({
                            'track_id': track_id,
                            'x': center_x,
                            'y': center_y,
                            'bbox': bbox
                        })
                        
                        # Store for movement vector calculation
                        if track_id not in self.person_tracks:
                            self.person_tracks[track_id] = []
                        
                        self.person_tracks[track_id].append({
                            'timestamp': timestamp,
                            'x': center_x,
                            'y': center_y
                        })
        
        # Calculate flow metrics for each timestamp
        flow_metrics = {}
        for timestamp, data in flow_data.items():
            metrics = self._calculate_flow_metrics(timestamp, data)
            flow_metrics[timestamp] = metrics
            
        return flow_metrics

    def _calculate_flow_metrics(self, timestamp: int, frame_data: dict) -> FlowMetrics:
        """Calculate detailed flow metrics for a specific timestamp"""
        persons = frame_data['persons']
        total_people = len(persons)
        
        # Calculate inflow/outflow by tracking boundary crossings
        inflow_count, outflow_count = self._calculate_boundary_crossings(timestamp, persons)
        net_flow = inflow_count - outflow_count
        
        # Calculate movement vectors and velocities
        movement_vectors = self._calculate_movement_vectors(timestamp)
        average_velocity = self._calculate_average_velocity(movement_vectors)
        
        # Determine density level
        density_level = self._calculate_density_level(total_people)
        
        # Identify congestion points
        congestion_points = self._identify_congestion_points(persons)
        
        return FlowMetrics(
            timestamp=timestamp,
            inflow_count=inflow_count,
            outflow_count=outflow_count,
            net_flow=net_flow,
            total_people=total_people,
            density_level=density_level,
            average_velocity=average_velocity,
            movement_vectors=movement_vectors,
            congestion_points=congestion_points
        )

    def _calculate_boundary_crossings(self, timestamp: int, persons: List[dict]) -> Tuple[int, int]:
        """Calculate people entering (inflow) and leaving (outflow) the frame"""
        inflow = 0
        outflow = 0
        
        for person in persons:
            track_id = person['track_id']
            
            # Check if this person just appeared (inflow)
            if track_id in self.person_tracks:
                track_history = self.person_tracks[track_id]
                if len(track_history) >= 2:
                    prev_pos = track_history[-2]
                    curr_pos = track_history[-1]
                    
                    # Check boundary crossings
                    # Left/Right boundaries
                    if prev_pos['x'] < 0.05 and curr_pos['x'] > 0.05:
                        inflow += 1
                    elif prev_pos['x'] > 0.95 and curr_pos['x'] < 0.95:
                        inflow += 1
                    elif prev_pos['x'] > 0.05 and curr_pos['x'] < 0.05:
                        outflow += 1
                    elif prev_pos['x'] < 0.95 and curr_pos['x'] > 0.95:
                        outflow += 1
                    
                    # Top/Bottom boundaries
                    if prev_pos['y'] < 0.05 and curr_pos['y'] > 0.05:
                        inflow += 1
                    elif prev_pos['y'] > 0.95 and curr_pos['y'] < 0.95:
                        inflow += 1
                    elif prev_pos['y'] > 0.05 and curr_pos['y'] < 0.05:
                        outflow += 1
                    elif prev_pos['y'] < 0.95 and curr_pos['y'] > 0.95:
                        outflow += 1
        
        return inflow, outflow

    def _calculate_movement_vectors(self, timestamp: int) -> List[Tuple[float, float]]:
        """Calculate movement vectors for all tracked people"""
        vectors = []
        
        for track_id, positions in self.person_tracks.items():
            if len(positions) >= 2:
                # Get last two positions
                prev = positions[-2]
                curr = positions[-1]
                
                # Calculate movement vector
                dx = curr['x'] - prev['x']
                dy = curr['y'] - prev['y']
                vectors.append((dx, dy))
        
        return vectors

    def _calculate_average_velocity(self, movement_vectors: List[Tuple[float, float]]) -> float:
        """Calculate average velocity of crowd movement"""
        if not movement_vectors:
            return 0.0
        
        velocities = []
        for dx, dy in movement_vectors:
            velocity = np.sqrt(dx**2 + dy**2)
            velocities.append(velocity)
        
        return np.mean(velocities) if velocities else 0.0

    def _calculate_density_level(self, people_count: int) -> str:
        """Determine crowd density level"""
        if people_count < 10:
            return "low"
        elif people_count < 30:
            return "medium"
        elif people_count < 60:
            return "high"
        else:
            return "critical"

    def _identify_congestion_points(self, persons: List[dict]) -> List[Tuple[float, float]]:
        """Identify points of congestion using clustering"""
        if len(persons) < 5:
            return []
        
        positions = [(p['x'], p['y']) for p in persons]
        
        # Simple clustering to find congestion points
        congestion_points = []
        
        # Grid-based approach for simplicity
        grid_size = 0.1
        grid_counts = defaultdict(int)
        
        for x, y in positions:
            grid_x = int(x / grid_size)
            grid_y = int(y / grid_size)
            grid_counts[(grid_x, grid_y)] += 1
        
        # Find high-density grid cells
        for (grid_x, grid_y), count in grid_counts.items():
            if count >= 5:  # Threshold for congestion
                center_x = (grid_x + 0.5) * grid_size
                center_y = (grid_y + 0.5) * grid_size
                congestion_points.append((center_x, center_y))
        
        return congestion_points

    def predict_incidents(self, flow_metrics: Dict[int, FlowMetrics], 
                         current_timestamp: int) -> PredictionResult:
        """Predict potential incidents based on flow patterns"""
        print(f"Analyzing flow patterns for incident prediction at timestamp {current_timestamp}...")
        
        # Get recent flow history
        recent_flows = []
        for ts in range(max(0, current_timestamp - 10), current_timestamp + 1):
            if ts in flow_metrics:
                recent_flows.append(flow_metrics[ts])
        
        if len(recent_flows) < 3:
            return self._create_low_risk_prediction()
        
        # Analyze patterns
        risk_factors = []
        incident_probability = 0.0
        predicted_type = "none"
        
        # Check density trends
        densities = [self._density_to_numeric(flow.density_level) for flow in recent_flows]
        if densities[-1] > 3:  # Critical density
            risk_factors.append("critical_density")
            incident_probability += 0.3
        
        # Check velocity patterns
        velocities = [flow.average_velocity for flow in recent_flows]
        if len(velocities) >= 2:
            velocity_increase = velocities[-1] - velocities[-2]
            if velocity_increase > 0.1:  # Sudden velocity increase
                risk_factors.append("rapid_movement")
                incident_probability += 0.2
                predicted_type = "panic" if velocity_increase > 0.2 else "crowd_surge"
        
        # Check flow imbalance
        net_flows = [flow.net_flow for flow in recent_flows]
        if any(abs(nf) > 10 for nf in net_flows):
            risk_factors.append("flow_imbalance")
            incident_probability += 0.15
        
        # Check congestion
        congestion_counts = [len(flow.congestion_points) for flow in recent_flows]
        if congestion_counts[-1] > 2:
            risk_factors.append("multiple_congestion_points")
            incident_probability += 0.25
            predicted_type = "crowd_crush" if congestion_counts[-1] > 4 else "bottleneck"
        
        # Determine prediction confidence
        confidence = min(0.95, len(risk_factors) * 0.2 + 0.3)
        
        # Estimate time to incident
        time_to_incident = self._estimate_time_to_incident(incident_probability, risk_factors)
        
        # Determine recommended action
        recommended_action = self._determine_action(incident_probability, risk_factors)
        
        # Determine alert level
        alert_level = self._determine_alert_level(incident_probability)
        
        return PredictionResult(
            incident_probability=min(1.0, incident_probability),
            prediction_confidence=confidence,
            predicted_incident_type=predicted_type if incident_probability > 0.3 else "none",
            time_to_incident_seconds=time_to_incident,
            risk_factors=risk_factors,
            recommended_action=recommended_action,
            alert_level=alert_level
        )

    def _density_to_numeric(self, density_level: str) -> int:
        """Convert density level to numeric value"""
        mapping = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        return mapping.get(density_level, 1)

    def _estimate_time_to_incident(self, probability: float, risk_factors: List[str]) -> int:
        """Estimate time until potential incident occurs"""
        base_time = 20  # Base prediction window
        
        # Adjust based on risk factors
        if "critical_density" in risk_factors:
            base_time -= 8
        if "rapid_movement" in risk_factors:
            base_time -= 5
        if "multiple_congestion_points" in risk_factors:
            base_time -= 6
        
        # Adjust based on probability
        if probability > 0.7:
            base_time -= 5
        elif probability > 0.5:
            base_time -= 3
        
        return max(2, base_time)

    def _determine_action(self, probability: float, risk_factors: List[str]) -> str:
        """Determine recommended action based on prediction"""
        if probability > 0.8:
            return "immediate_evacuation"
        elif probability > 0.6:
            return "crowd_control"
        elif probability > 0.4:
            return "security_dispatch"
        elif probability > 0.2:
            return "monitor_closely"
        else:
            return "no_action"

    def _determine_alert_level(self, probability: float) -> str:
        """Determine alert level based on incident probability"""
        if probability > 0.7:
            return "red"
        elif probability > 0.5:
            return "orange"
        elif probability > 0.3:
            return "yellow"
        else:
            return "green"

    def _create_low_risk_prediction(self) -> PredictionResult:
        """Create a low-risk prediction result"""
        return PredictionResult(
            incident_probability=0.1,
            prediction_confidence=0.6,
            predicted_incident_type="none",
            time_to_incident_seconds=20,
            risk_factors=[],
            recommended_action="no_action",
            alert_level="green"
        )

    def generate_stable_forecast(self, flow_metrics: Dict[int, FlowMetrics], cctv_id: str) -> PredictionResult:
        """Generate ONE stable forecast using ALL historical data"""
        if not flow_metrics:
            return PredictionResult(
                incident_probability=0.1,
                prediction_confidence=0.5,
                predicted_incident_type="none",
                time_to_incident_seconds=600,
                risk_factors=[],
                recommended_action="no_action",
                alert_level="green"
            )
        
        # Aggregate ALL historical data for pattern analysis
        total_people = sum(fm.total_people for fm in flow_metrics.values())
        avg_people = total_people / len(flow_metrics)
        
        total_inflow = sum(fm.inflow_count for fm in flow_metrics.values())
        total_outflow = sum(fm.outflow_count for fm in flow_metrics.values())
        net_flow = total_inflow - total_outflow
        
        avg_velocity = sum(fm.average_velocity for fm in flow_metrics.values()) / len(flow_metrics)
        total_congestion_points = sum(len(fm.congestion_points) for fm in flow_metrics.values())
        
        # Calculate overall trend and stability
        timestamps = sorted(flow_metrics.keys())
        people_trend = self._calculate_trend([flow_metrics[t].total_people for t in timestamps])
        velocity_trend = self._calculate_trend([flow_metrics[t].average_velocity for t in timestamps])
        
        # Analyze critical incident triggers across ALL timestamps
        fire_detected = any(fm.fire_detected for fm in flow_metrics.values())
        smoke_detected = any(fm.smoke_detected for fm in flow_metrics.values())
        violence_detected = any(fm.violence_detected for fm in flow_metrics.values())
        weapon_detected = any(fm.weapon_detected for fm in flow_metrics.values())
        suspicious_behavior = any(fm.suspicious_behavior for fm in flow_metrics.values())
        emergency_evacuation = any(fm.emergency_evacuation for fm in flow_metrics.values())
        
        # Get all weapon types detected
        all_weapon_types = set()
        for fm in flow_metrics.values():
            all_weapon_types.update(fm.weapon_types)
        
        # CRITICAL INCIDENT TRIGGERS - Highest Priority (60% total weight)
        risk_score = 0.0
        risk_factors = []
        
        # Fire/Smoke Detection (20% weight) - Immediate incident trigger
        if fire_detected:
            risk_score += 0.20 * 1.0  # Maximum risk
            risk_factors.extend(["fire_detected", "immediate_evacuation_needed"])
        elif smoke_detected:
            risk_score += 0.20 * 0.9  # Very high risk
            risk_factors.extend(["smoke_detected", "potential_fire"])
        
        # Violence/Weapon Detection (20% weight) - Immediate incident trigger
        if weapon_detected:
            risk_score += 0.20 * 1.0  # Maximum risk
            risk_factors.extend(["weapons_detected", "immediate_security_response"])
            if all_weapon_types:
                risk_factors.extend([f"weapon_{w}" for w in all_weapon_types])
        elif violence_detected:
            risk_score += 0.20 * 0.9  # Very high risk
            risk_factors.extend(["violence_detected", "crowd_agitation"])
        
        # Emergency/Suspicious Behavior (20% weight) - High priority
        if emergency_evacuation:
            risk_score += 0.20 * 0.95  # Near maximum risk
            risk_factors.extend(["emergency_evacuation", "mass_panic_risk"])
        elif suspicious_behavior:
            risk_score += 0.20 * 0.7  # High risk
            risk_factors.append("suspicious_behavior")
        
        # CROWD FLOW FACTORS - Secondary Priority (40% total weight)
        
        # People density risk (15% weight) - Reduced from 25%
        if avg_people > 150:
            risk_score += 0.15 * 0.9
            risk_factors.append("critical_density")
        elif avg_people > 100:
            risk_score += 0.15 * 0.7
            risk_factors.append("high_density")
        elif avg_people > 50:
            risk_score += 0.15 * 0.4
            risk_factors.append("moderate_density")
        
        # Flow imbalance risk (10% weight) - Reduced from 25%
        if abs(net_flow) > 50:
            risk_score += 0.10 * 0.8
            risk_factors.append("severe_flow_imbalance")
        elif abs(net_flow) > 20:
            risk_score += 0.10 * 0.5
            risk_factors.append("flow_imbalance")
        
        # Congestion risk (10% weight) - Reduced from 25%
        if total_congestion_points > 10:
            risk_score += 0.10 * 0.9
            risk_factors.append("multiple_congestion_points")
        elif total_congestion_points > 5:
            risk_score += 0.10 * 0.6
            risk_factors.append("moderate_congestion")
        
        # Trend risk (5% weight) - Reduced from 25%
        if people_trend > 0.5:  # Rapid increase
            risk_score += 0.05 * 0.8
            risk_factors.append("rapid_crowd_growth")
        elif people_trend > 0.2:
            risk_score += 0.05 * 0.4
            risk_factors.append("crowd_growth")
        
        # Cap risk score
        risk_score = min(risk_score, 1.0)
        
        # Calculate prediction confidence based on data quality
        confidence = 0.7 + (len(flow_metrics) / 20) * 0.3  # More timestamps = higher confidence
        confidence = min(confidence, 1.0)
        
        # Calculate time to incident (in seconds)
        if risk_score > 0.7:
            time_to_incident = 120  # 2 minutes for high risk
        elif risk_score > 0.5:
            time_to_incident = 300  # 5 minutes for medium risk
        else:
            time_to_incident = 600  # 10 minutes for low risk
        
        return PredictionResult(
            incident_probability=risk_score,
            prediction_confidence=confidence,
            predicted_incident_type=self._risk_to_incident_type(risk_score),
            time_to_incident_seconds=time_to_incident,
            risk_factors=risk_factors,  # Use calculated risk factors
            recommended_action=self._risk_to_action(risk_score),
            alert_level=self._risk_to_alert_level(risk_score)
        )

    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend slope for a list of values"""
        if len(values) < 2:
            return 0.0
        
        x = list(range(len(values)))
        y = values
        
        # Simple linear regression slope
        n = len(values)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        if n * sum_x2 - sum_x ** 2 == 0:
            return 0.0
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        return slope

    def _upload_to_gcs(self, video_path: str, cctv_id: str) -> str:
        """Upload video to GCS for processing"""
        bucket_name = f"flow-analysis-{self.project_id}".lower()
        try:
            bucket = self.storage_client.bucket(bucket_name)
            if not bucket.exists():
                bucket = self.storage_client.create_bucket(bucket_name, location=self.location)
        except Exception as e:
            print(f"Using existing bucket: {e}")
            bucket = self.storage_client.bucket(bucket_name)
        
        blob_name = f"cctv_{cctv_id}/flow_video.mp4"
        blob = bucket.blob(blob_name)
        
        if not blob.exists():
            blob.upload_from_filename(video_path, timeout=300)
            print(f"Video uploaded to gs://{bucket_name}/{blob_name}")
        
        return f"gs://{bucket_name}/{blob_name}"

    def analyze_and_predict(self, video_path: str, cctv_id: str) -> Dict:
        """Main method to analyze flow and predict incidents using proper forecasting"""
        print(f"\n🔄 Starting Flow Analysis and Prediction for CCTV {cctv_id}")
        
        # Step 1: Analyze video flow (get all historical data)
        flow_metrics = self.analyze_video_flow(video_path, cctv_id)
        
        # Step 2: Generate HYBRID forecast using both rule-based and ML approaches
        print("🔮 Generating hybrid forecast using rule-based + ML analysis...")
        future_forecast = self.enhanced_predict_incidents(flow_metrics, len(flow_metrics)-1, cctv_id)
        
        # Step 3: Build result with historical analysis + future forecast
        predictions = {}
        for timestamp in sorted(flow_metrics.keys()):
            predictions[timestamp] = {
                'flow_metrics': flow_metrics[timestamp].__dict__,
                'prediction': future_forecast.__dict__  # Same forecast for all timestamps
            }
        
        # Step 4: Generate summary
        high_risk_count = 1 if future_forecast.incident_probability > 0.5 else 0
        
        summary = {
            'cctv_id': cctv_id,
            'total_timestamps': len(predictions),
            'high_risk_periods': high_risk_count,
            'analysis_complete': True,
            'predictions': predictions,
            'future_forecast': future_forecast.__dict__,  # Single stable forecast
            'forecast_horizon_minutes': 10
        }
        
        print(f"✅ Flow analysis complete: {len(predictions)} timestamps analyzed")
        print(f"🎯 Stable forecast generated: {future_forecast.incident_probability:.1%} risk in next 10 minutes")
        
        return summary

    def prepare_forecasting_data(self, flow_metrics: Dict[int, FlowMetrics], cctv_id: str) -> pd.DataFrame:
        """Prepare time series data for Vertex AI Forecasting"""
        print(f"Preparing forecasting dataset for CCTV {cctv_id}...")
        
        # Convert flow metrics to time series format
        data_rows = []
        for timestamp, metrics in flow_metrics.items():
            row = {
                'timestamp': pd.Timestamp.now() + pd.Timedelta(seconds=timestamp),
                'cctv_id': cctv_id,
                'people_count': metrics.total_people,
                'density_numeric': self._density_to_numeric(metrics.density_level),
                'average_velocity': metrics.average_velocity,
                'net_flow': metrics.net_flow,
                'inflow_count': metrics.inflow_count,
                'outflow_count': metrics.outflow_count,
                'congestion_points': len(metrics.congestion_points),
                # Target variable for incident prediction
                'incident_risk_score': self._calculate_incident_risk_score(metrics)
            }
            data_rows.append(row)
        
        df = pd.DataFrame(data_rows)
        df = df.sort_values('timestamp')
        
        # Store for model training
        self.time_series_data.extend(data_rows)
        
        print(f"Prepared {len(df)} data points for forecasting")
        return df

    def _calculate_incident_risk_score(self, metrics: FlowMetrics) -> float:
        """Calculate a composite risk score for training the forecasting model"""
        score = 0.0
        
        # Density component (0-0.4)
        density_weights = {'low': 0.1, 'medium': 0.2, 'high': 0.3, 'critical': 0.4}
        score += density_weights.get(metrics.density_level, 0.1)
        
        # Velocity component (0-0.3)
        if metrics.average_velocity > 0.2:  # High velocity
            score += 0.3
        elif metrics.average_velocity > 0.1:
            score += 0.2
        else:
            score += 0.1
        
        # Flow imbalance component (0-0.2)
        if abs(metrics.net_flow) > 10:
            score += 0.2
        elif abs(metrics.net_flow) > 5:
            score += 0.1
        
        # Congestion component (0-0.1)
        score += min(0.1, len(metrics.congestion_points) * 0.02)
        
        return min(1.0, score)

    def train_forecasting_model(self, training_data: pd.DataFrame) -> str:
        """Train Vertex AI Forecasting model for incident prediction"""
        print("🤖 Training Vertex AI Forecasting model...")
        
        try:
            # DISABLED: Upload training data to GCS (only using existing datasets)
            # bucket_name = f"flow-forecasting-{self.project_id}".lower().replace('_', '-')
            # 
            # try:
            #     bucket = self.storage_client.bucket(bucket_name)
            #     if not bucket.exists():
            #         bucket = self.storage_client.create_bucket(bucket_name, location=self.location)
            # except Exception:
            #     bucket = self.storage_client.bucket(bucket_name)
            # 
            # # Save training data to GCS
            # training_file = f"training_data_{int(pd.Timestamp.now().timestamp())}.csv"
            # blob = bucket.blob(f"training/{training_file}")
            # blob.upload_from_string(training_data.to_csv(index=False), content_type='text/csv')
            # 
            # gcs_source = f"gs://{bucket_name}/training/{training_file}"
            # print(f"Training data uploaded to: {gcs_source}")
            
            print("⚠️ GCS upload disabled - using existing datasets only")
            
            # Smart dataset reuse logic - ONLY USE EXISTING DATASETS
            dataset = None
            if hasattr(self, 'cached_dataset_resource') and self.cached_dataset_resource:
                try:
                    print(f"🔄 Attempting to reuse existing dataset: {self.cached_dataset_resource}")
                    dataset = TabularDataset(self.cached_dataset_resource)
                    print("✅ Successfully reusing existing TabularDataset")
                except Exception as e:
                    print(f"⚠️ Could not reuse dataset: {e}")
                    dataset = None
            
            # DISABLED: Create new dataset only if reuse failed
            if dataset is None:
                print("❌ NEW DATASET CREATION DISABLED - Only reusing existing datasets")
                print("⚠️ No available dataset found for reuse")
                return None
                
            # # COMMENTED OUT: New dataset creation code
            # if dataset is None:
            #     print("🎯 Creating new TabularDataset...")
            #     dataset = TabularDataset.create(
            #         display_name=f"flow-prediction-dataset-{int(pd.Timestamp.now().timestamp())}",
            #         gcs_source=gcs_source
            #     )
            #     # Cache the dataset resource for future reuse
            #     self.cached_dataset_resource = dataset.resource_name
            #     print(f"✅ New dataset created and cached: {dataset.resource_name}")
            
            # Create and launch training job (FIXED: parameters moved to run method)
            training_job = AutoMLForecastingTrainingJob(
                display_name=f"flow-incident-forecasting-{int(pd.Timestamp.now().timestamp())}",
                optimization_objective="minimize-rmse",
                column_specs={
                    "timestamp": "timestamp",
                    "cctv_id": "categorical",
                    "incident_risk_score": "numeric"
                }
            )
            
            model = training_job.run(
                dataset=dataset,
                target_column="incident_risk_score",
                time_column="timestamp",
                time_series_identifier_column="cctv_id",
                unavailable_at_forecast_columns=[],
                available_at_forecast_columns=["people_count", "density_numeric", "average_velocity", "net_flow", "congestion_points"],
                forecast_horizon=600,
                data_granularity_unit="second",
                data_granularity_count=1,
                context_window=120,
                training_fraction_split=0.8,
                validation_fraction_split=0.1,
                test_fraction_split=0.1,
                sync=False
            )
            
            # Handle async training result
            print(f"⚠️ ASYNC TRAINING NOTE: Model training initiated but not immediately available")
            print(f"🔄 Training job will run in background for ~15-30 minutes")
            print(f"✅ System will use rule-based prediction until ML model is ready")
            
            # Store training job reference for future model retrieval
            self.forecasting_training_job = training_job
            
            # Try to get the model resource name from the training job
            try:
                if hasattr(training_job, 'resource_name'):
                    training_job_name = training_job.resource_name
                    print(f"📋 Training job resource: {training_job_name}")
                    # Store this for future model availability checking
                    self.forecasting_training_job_resource = training_job_name
                else:
                    training_job_name = f"async-training-{int(pd.Timestamp.now().timestamp())}"
                    print(f"📋 Training job started: {training_job_name}")
                    
                return training_job_name
                
            except Exception as e:
                print(f"⚠️ Could not get training job details: {e}")
                return "async-training-started"
                
        except Exception as e:
            print(f"❌ Error training forecasting model: {e}")
            return None

    def predict_with_vertex_ai(self, recent_flow_data: pd.DataFrame, forecast_horizon: int = 20) -> Dict:
        """Use trained Vertex AI model for incident prediction"""
        print("🔮 Generating Vertex AI forecasting predictions...")
        
        if self.forecasting_model is None:
            print("⚠️ No trained forecasting model available, using rule-based prediction")
            return None
        
        try:
            # Prepare prediction request
            instances = []
            for _, row in recent_flow_data.tail(10).iterrows():  # Use last 10 data points
                instance = {
                    "timestamp": row['timestamp'].isoformat(),
                    "cctv_id": row['cctv_id'],
                    "people_count": float(row['people_count']),
                    "density_numeric": float(row['density_numeric']),
                    "average_velocity": float(row['average_velocity']),
                    "net_flow": float(row['net_flow']),
                    "congestion_points": float(row['congestion_points'])
                }
                instances.append(instance)
            
            # Get predictions
            response = self.forecasting_model.predict(instances=instances)
            
            # Process predictions
            predictions = response.predictions
            
            # Extract the forecast for the next 10 minutes
            future_risk_scores = []
            for pred in predictions:
                if 'value' in pred:
                    future_risk_scores.append(float(pred['value']))
            
            if not future_risk_scores:
                return None
            
            # Calculate incident probability based on forecasted risk scores
            max_risk = max(future_risk_scores)
            avg_risk = np.mean(future_risk_scores)
            
            # Determine time to peak risk
            peak_time = future_risk_scores.index(max_risk) + 1  # +1 for 1-second intervals
            
            result = {
                'incident_probability': max_risk,
                'prediction_confidence': 0.9,  # High confidence from ML model
                'predicted_incident_type': self._risk_to_incident_type(max_risk),
                'time_to_incident_seconds': peak_time,
                'risk_factors': self._risk_to_factors(avg_risk),
                'recommended_action': self._risk_to_action(max_risk),
                'alert_level': self._risk_to_alert_level(max_risk),
                'forecasted_risk_scores': future_risk_scores[:forecast_horizon]
            }
            
            print(f"✅ Vertex AI prediction: {max_risk:.2f} risk, peak at {peak_time}s")
            return result
            
        except Exception as e:
            print(f"❌ Error with Vertex AI prediction: {e}")
            return None

    def _risk_to_incident_type(self, risk_score: float) -> str:
        """Convert risk score to incident type"""
        if risk_score > 0.8:
            return "crowd_crush"
        elif risk_score > 0.6:
            return "panic"
        elif risk_score > 0.4:
            return "crowd_surge"
        elif risk_score > 0.3:
            return "congestion"
        else:
            return "none"

    def _risk_to_factors(self, risk_score: float) -> List[str]:
        """Convert risk score to risk factors"""
        factors = []
        if risk_score > 0.7:
            factors.extend(["critical_density", "rapid_movement", "multiple_congestion_points"])
        elif risk_score > 0.5:
            factors.extend(["high_density", "flow_imbalance"])
        elif risk_score > 0.3:
            factors.append("moderate_congestion")
        return factors

    def _risk_to_action(self, risk_score: float) -> str:
        """Convert risk score to recommended action"""
        if risk_score > 0.8:
            return "immediate_evacuation"
        elif risk_score > 0.6:
            return "crowd_control"
        elif risk_score > 0.4:
            return "security_dispatch"
        elif risk_score > 0.2:
            return "monitor_closely"
        else:
            return "no_action"

    def _risk_to_alert_level(self, risk_score: float) -> str:
        """Convert risk score to alert level"""
        if risk_score > 0.7:
            return "red"
        elif risk_score > 0.5:
            return "orange"
        elif risk_score > 0.3:
            return "yellow"
        else:
            return "green"

    def enhanced_predict_incidents(self, flow_metrics: Dict[int, FlowMetrics], 
                                 current_timestamp: int, cctv_id: str) -> PredictionResult:
        """Hybrid prediction using confidence-based selection between rule-based and ML"""
        print(f"🔮 Hybrid incident prediction for CCTV {cctv_id} - analyzing {len(flow_metrics)} timestamps")
        
        # Generate Rule-Based Prediction (for immediate threats)
        print("🛡️ Generating rule-based prediction (incident triggers)...")
        rule_based_prediction = self.generate_stable_forecast(flow_metrics, cctv_id)
        
        # Check for immediate high-confidence threats
        immediate_threats = self._check_immediate_threats(flow_metrics)
        
        if immediate_threats['has_immediate_threat']:
            # For fire/weapons/violence: Use rule-based with maximum confidence
            print(f"🚨 IMMEDIATE THREAT DETECTED: {immediate_threats['threat_types']}")
            print("✅ Using HIGH-CONFIDENCE rule-based prediction for immediate threat")
            rule_based_prediction.prediction_confidence = 0.95  # High confidence for immediate threats
            return rule_based_prediction
        
        # For complex crowd patterns: Try ML prediction
        print("🤖 Attempting ML-based prediction for crowd patterns...")
        df = self.prepare_forecasting_data(flow_metrics, cctv_id)
        
        # Smart model training logic with improved async handling
        if self.forecasting_model is None and len(df) >= 15:
            # Check if we have a stored model resource from previous training
            if hasattr(self, 'forecasting_model_resource') and self.forecasting_model_resource:
                print(f"🔄 Found existing model resource: {self.forecasting_model_resource}")
                try:
                    # Try to load the existing model
                    self.forecasting_model = aiplatform.Model(self.forecasting_model_resource)
                    print("✅ Successfully loaded existing ML model")
                except Exception as e:
                    print(f"⚠️ Could not load existing model: {e}")
                    self.forecasting_model = None
            
            # Only train new model if we still don't have one
            if self.forecasting_model is None:
                print(f"🎯 Attempting ML model training with {len(df)} data points...")
                training_result = self.train_forecasting_model(df)
                if training_result:
                    print("✅ ML training initiated (async - will be available later)")
                    # Don't try to use the model immediately for async training
                    print("⚠️ Using rule-based prediction while ML model trains")
                else:
                    print("⚠️ ML model training failed - using rule-based prediction")
        elif self.forecasting_model is not None:
            print("✅ Using existing ML model for prediction")
        else:
            print(f"⚠️ Insufficient data for ML training ({len(df)}/15 required) - using rule-based")
        
        vertex_prediction_dict = self.predict_with_vertex_ai(df)
        
        if vertex_prediction_dict and vertex_prediction_dict.get('prediction_confidence', 0) > 0.7:
            # ML has high confidence - use ML prediction
            ml_prediction = PredictionResult(
                incident_probability=vertex_prediction_dict['incident_probability'],
                prediction_confidence=vertex_prediction_dict['prediction_confidence'],
                predicted_incident_type=vertex_prediction_dict['predicted_incident_type'],
                time_to_incident_seconds=vertex_prediction_dict['time_to_incident_seconds'],
                risk_factors=vertex_prediction_dict['risk_factors'],
                recommended_action=vertex_prediction_dict['recommended_action'],
                alert_level=vertex_prediction_dict['alert_level']
            )
            
            print(f"🤖 ML confidence: {ml_prediction.prediction_confidence:.1%}")
            print(f"🛡️ Rule confidence: {rule_based_prediction.prediction_confidence:.1%}")
            
            # Confidence-based selection
            if ml_prediction.prediction_confidence > rule_based_prediction.prediction_confidence:
                print("✅ Using ML prediction (higher confidence)")
                return ml_prediction
            else:
                print("✅ Using rule-based prediction (higher confidence)")
                return rule_based_prediction
        else:
            # ML failed or low confidence - use rule-based
            print("⚠️ ML unavailable/low confidence - using rule-based prediction")
            return rule_based_prediction

    def _check_immediate_threats(self, flow_metrics: Dict[int, FlowMetrics]) -> Dict:
        """Check for immediate high-confidence threats (fire, weapons, violence)"""
        immediate_threats = {
            'has_immediate_threat': False,
            'threat_types': [],
            'confidence': 0.95
        }
        
        # Check all timestamps for immediate threats
        for timestamp, fm in flow_metrics.items():
            if fm.fire_detected:
                immediate_threats['has_immediate_threat'] = True
                immediate_threats['threat_types'].append('fire')
            
            if fm.smoke_detected:
                immediate_threats['has_immediate_threat'] = True
                immediate_threats['threat_types'].append('smoke')
            
            if fm.weapon_detected:
                immediate_threats['has_immediate_threat'] = True
                immediate_threats['threat_types'].extend(['weapons'] + fm.weapon_types)
            
            if fm.violence_detected:
                immediate_threats['has_immediate_threat'] = True
                immediate_threats['threat_types'].append('violence')
            
            if fm.emergency_evacuation:
                immediate_threats['has_immediate_threat'] = True
                immediate_threats['threat_types'].append('emergency_evacuation')
        
        # Remove duplicates
        immediate_threats['threat_types'] = list(set(immediate_threats['threat_types']))
        
        return immediate_threats


# Alias for backward compatibility
VideoFlowPredictor = FlowPredictor
