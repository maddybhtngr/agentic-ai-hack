from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import os
import json
import glob
from typing import Dict, List, Any, Optional

router = APIRouter(prefix="/cctv", tags=["cctv"])

# Path to the CCTV analysis data
CCTV_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'videos')

def load_cctv_analysis_data() -> Dict[str, Any]:
    """Load all CCTV analysis data from JSON files"""
    all_data = {}
    try:
        analysis_files = glob.glob(os.path.join(CCTV_DATA_DIR, 'cctv_*', '*_analysis.json'))
        for file_path in sorted(analysis_files):
            cctv_id = os.path.basename(os.path.dirname(file_path))
            with open(file_path, 'r') as f:
                all_data[cctv_id] = json.load(f)
    except Exception as e:
        print(f"Error loading CCTV data: {e}")
    return all_data

def get_latest_analysis(cctv_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get the latest timestamp data from CCTV analysis"""
    if not cctv_data:
        return {}
    
    # Get the latest timestamp
    timestamps = sorted([int(k) for k in cctv_data.keys() if k.isdigit()])
    if not timestamps:
        return {}
    
    latest_timestamp = str(timestamps[-1])
    return cctv_data.get(latest_timestamp, {})

def get_timestamp_analysis(cctv_data: Dict[str, Any], timestamp_index: int) -> Dict[str, Any]:
    """Get analysis data for a specific timestamp index"""
    if not cctv_data:
        return {}
    
    # Get sorted timestamps
    timestamps = sorted([int(k) for k in cctv_data.keys() if k.isdigit()])
    if not timestamps:
        return {}
    
    # Use modulo to cycle through timestamps
    actual_index = timestamp_index % len(timestamps)
    timestamp_key = str(timestamps[actual_index])
    
    analysis_data = cctv_data.get(timestamp_key, {})
    # Add metadata about the cycling
    analysis_data['timestamp_info'] = {
        'current_index': actual_index,
        'total_timestamps': len(timestamps),
        'timestamp_key': timestamp_key,
        'progress_percentage': round((actual_index / len(timestamps)) * 100, 1)
    }
    
    return analysis_data

def get_summary_stats(cctv_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate summary statistics from all timestamps"""
    if not cctv_data:
        return {
            "avg_people_count": 0,
            "max_people_count": 0,
            "total_timestamps": 0,
            "high_density_periods": 0,
            "security_alerts": 0
        }
    
    people_counts = []
    high_density_count = 0
    security_alerts = 0
    
    for timestamp_data in cctv_data.values():
        if isinstance(timestamp_data, dict):
            people_count = timestamp_data.get('people_count', 0)
            people_counts.append(people_count)
            
            density = timestamp_data.get('crowd_density', 'low')
            if density in ['high', 'very_high']:
                high_density_count += 1
            
            # Check for security alerts
            if (timestamp_data.get('violence_flag', False) or 
                timestamp_data.get('weapon_detected', False) or
                timestamp_data.get('fire_flag', False) or
                timestamp_data.get('smoke_flag', False)):
                security_alerts += 1
    
    return {
        "avg_people_count": round(sum(people_counts) / len(people_counts), 1) if people_counts else 0,
        "max_people_count": max(people_counts) if people_counts else 0,
        "total_timestamps": len(people_counts),
        "high_density_periods": high_density_count,
        "security_alerts": security_alerts
    }

@router.get("/feeds")
async def get_cctv_feeds():
    """Get list of available CCTV feeds"""
    try:
        all_data = load_cctv_analysis_data()
        feeds = []
        for cctv_id in sorted(all_data.keys()):
            camera_num = cctv_id.replace('cctv_', '')
            # Get timeline info for each camera
            timestamps = sorted([int(k) for k in all_data[cctv_id].keys() if k.isdigit()])
            feeds.append({
                "id": cctv_id,
                "name": f"Camera {camera_num}",
                "status": "active" if all_data[cctv_id] else "inactive",
                "total_timestamps": len(timestamps),
                "duration_seconds": len(timestamps) * 2  # 2 seconds per timestamp
            })
        return {"feeds": feeds, "total": len(feeds)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching CCTV feeds: {str(e)}")

@router.get("/feeds/{cctv_id}")
async def get_cctv_feed_data(cctv_id: str, timestamp_index: Optional[int] = None):
    """Get current analysis data for a specific CCTV feed at a specific timestamp index"""
    try:
        all_data = load_cctv_analysis_data()
        cctv_data = all_data.get(cctv_id)
        
        if not cctv_data:
            raise HTTPException(status_code=404, detail=f"CCTV feed {cctv_id} not found")
        
        # If timestamp_index is provided, get that specific timestamp, otherwise get latest
        if timestamp_index is not None:
            current_data = get_timestamp_analysis(cctv_data, timestamp_index)
        else:
            current_data = get_latest_analysis(cctv_data)
            
        summary_stats = get_summary_stats(cctv_data)
        
        return {
            "cctv_id": cctv_id,
            "name": f"Camera {cctv_id.replace('cctv_', '')}",
            "current_analysis": current_data,
            "summary_stats": summary_stats,
            "last_updated": current_data.get('timestamp', 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {cctv_id}: {str(e)}")

@router.get("/feeds/{cctv_id}/next")
async def get_next_cctv_timestamp(cctv_id: str, current_index: int = 0):
    """Get the next timestamp data for cycling through CCTV analysis"""
    try:
        all_data = load_cctv_analysis_data()
        cctv_data = all_data.get(cctv_id)
        
        if not cctv_data:
            raise HTTPException(status_code=404, detail=f"CCTV feed {cctv_id} not found")
        
        # Get the next timestamp index
        next_index = current_index + 1
        current_data = get_timestamp_analysis(cctv_data, next_index)
        
        return {
            "cctv_id": cctv_id,
            "name": f"Camera {cctv_id.replace('cctv_', '')}",
            "current_analysis": current_data,
            "next_index": next_index % len([k for k in cctv_data.keys() if k.isdigit()])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching next timestamp for {cctv_id}: {str(e)}")

@router.get("/feeds/{cctv_id}/timeline")
async def get_cctv_timeline(cctv_id: str, limit: Optional[int] = 100):
    """Get timeline data for a specific CCTV feed"""
    try:
        all_data = load_cctv_analysis_data()
        cctv_data = all_data.get(cctv_id)
        
        if not cctv_data:
            raise HTTPException(status_code=404, detail=f"CCTV feed {cctv_id} not found")
        
        # Get sorted timestamps
        timestamps = sorted([int(k) for k in cctv_data.keys() if k.isdigit()])
        
        # Limit the results
        if limit and len(timestamps) > limit:
            timestamps = timestamps[-limit:]
        
        timeline_data = []
        for i, timestamp in enumerate(timestamps):
            data = cctv_data[str(timestamp)]
            timeline_data.append({
                "index": i,
                "timestamp": timestamp,
                "people_count": data.get('people_count', 0),
                "crowd_density": data.get('crowd_density', 'low'),
                "security_alerts": {
                    "violence": data.get('violence_flag', False),
                    "weapon": data.get('weapon_detected', False),
                    "fire": data.get('fire_flag', False),
                    "smoke": data.get('smoke_flag', False)
                },
                "demographics": data.get('demographics', {}),
                "sentiment": data.get('sentiment_analysis', {}),
                "heatmap_points": data.get('heatmap_points', [])
            })
        
        return {
            "cctv_id": cctv_id,
            "timeline": timeline_data,
            "total_points": len(timeline_data)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching timeline for {cctv_id}: {str(e)}")

@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics across all CCTV feeds"""
    try:
        all_data = load_cctv_analysis_data()
        
        total_cameras = len(all_data)
        total_people = 0
        active_alerts = 0
        high_density_cameras = 0
        
        camera_summaries = []
        
        for cctv_id, cctv_data in all_data.items():
            latest_data = get_latest_analysis(cctv_data)
            summary_stats = get_summary_stats(cctv_data)
            
            people_count = latest_data.get('people_count', 0)
            total_people += people_count
            
            # Check for active alerts
            has_alerts = (latest_data.get('violence_flag', False) or 
                         latest_data.get('weapon_detected', False) or
                         latest_data.get('fire_flag', False) or
                         latest_data.get('smoke_flag', False))
            
            if has_alerts:
                active_alerts += 1
            
            # Check density
            density = latest_data.get('crowd_density', 'low')
            if density in ['high', 'very_high']:
                high_density_cameras += 1
            
            camera_summaries.append({
                "cctv_id": cctv_id,
                "name": f"Camera {cctv_id.replace('cctv_', '')}",
                "people_count": people_count,
                "density": density,
                "has_alerts": has_alerts,
                "summary_stats": summary_stats
            })
        
        return {
            "overview": {
                "total_cameras": total_cameras,
                "total_people": total_people,
                "active_alerts": active_alerts,
                "high_density_cameras": high_density_cameras
            },
            "cameras": camera_summaries
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics overview: {str(e)}") 