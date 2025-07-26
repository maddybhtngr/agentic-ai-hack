#!/usr/bin/env python3

import os
import sys
import json
import concurrent.futures
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flow_predictor import FlowPredictor



def analyze_flow_for_cctv(cctv_id: int, predictor: FlowPredictor):
    """Analyze flow patterns and predict incidents for a single CCTV"""
    print(f"\n=== Flow Analysis for CCTV {cctv_id} ===")
    
    try:
        # Construct video path dynamically
        base_path = Path(__file__).parent.parent / "videos" / "static_video"
        cctv_dir = base_path / f"cctv_{cctv_id}"
        
        # Find first .mp4 file in the CCTV directory
        import glob
        mp4_files = list(cctv_dir.glob("*.mp4"))
        
        if not cctv_dir.exists():
            print(f"❌ CCTV directory not found: {cctv_dir}")
            return {'cctv_id': cctv_id, 'status': 'error', 'error': 'CCTV directory not found'}
        
        if not mp4_files:
            print(f"❌ No MP4 files found in: {cctv_dir}")
            return {'cctv_id': cctv_id, 'status': 'error', 'error': 'No MP4 files found'}
        
        video_path = mp4_files[0]  # Use first MP4 file found
        print(f"📹 Found video file: {video_path.name}")
        
        print(f"📹 Processing video: {video_path}")
        
        # Run flow analysis and prediction
        results = predictor.analyze_and_predict(str(video_path), str(cctv_id))
        
        # Save results to JSON file
        output_dir = base_path / f"cctv_{cctv_id}"
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / f"cctv_{cctv_id}_flow_analysis.json"
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"✅ CCTV {cctv_id}: Flow analysis saved to {output_file}")
        
        # Generate summary statistics
        predictions = results['predictions']
        total_timestamps = len(predictions)
        
        # Count alerts by level
        alert_counts = {'green': 0, 'yellow': 0, 'orange': 0, 'red': 0}
        high_risk_timestamps = []
        
        for timestamp, data in predictions.items():
            alert_level = data['prediction']['alert_level']
            alert_counts[alert_level] += 1
            
            if data['prediction']['incident_probability'] > 0.5:
                high_risk_timestamps.append({
                    'timestamp': timestamp,
                    'probability': data['prediction']['incident_probability'],
                    'type': data['prediction']['predicted_incident_type'],
                    'time_to_incident': data['prediction']['time_to_incident_seconds']
                })
        
        # Calculate flow statistics
        total_inflow = sum(data['flow_metrics']['inflow_count'] for data in predictions.values())
        total_outflow = sum(data['flow_metrics']['outflow_count'] for data in predictions.values())
        avg_people = sum(data['flow_metrics']['total_people'] for data in predictions.values()) / total_timestamps if total_timestamps > 0 else 0
        
        summary_stats = {
            'total_timestamps': total_timestamps,
            'alert_distribution': alert_counts,
            'high_risk_periods': len(high_risk_timestamps),
            'high_risk_details': high_risk_timestamps[:5],  # Top 5 high-risk periods
            'flow_statistics': {
                'total_inflow': total_inflow,
                'total_outflow': total_outflow,
                'net_flow': total_inflow - total_outflow,
                'average_people_count': round(avg_people, 1)
            }
        }
        
        print(f"\n📊 CCTV {cctv_id} Flow Analysis Summary:")
        print(f"   • Total Timestamps: {total_timestamps}")
        print(f"   • Alert Distribution: 🟢{alert_counts['green']} 🟡{alert_counts['yellow']} 🟠{alert_counts['orange']} 🔴{alert_counts['red']}")
        print(f"   • High Risk Periods: {len(high_risk_timestamps)}")
        print(f"   • Average People Count: {avg_people:.1f}")
        print(f"   • Net Flow: {total_inflow - total_outflow} (In: {total_inflow}, Out: {total_outflow})")
        
        return {
            'cctv_id': cctv_id,
            'status': 'success',
            'output_file': str(output_file),
            'summary': summary_stats
        }
        
    except Exception as e:
        print(f"❌ Error processing CCTV {cctv_id}: {e}")
        import traceback
        traceback.print_exc()
        return {'cctv_id': cctv_id, 'status': 'error', 'error': str(e)}


def main():
    """Main function to run flow analysis for all CCTVs"""
    print("🚀 Initializing Flow Predictor...")
    
    try:
        predictor = FlowPredictor()
    except Exception as e:
        print(f"❌ Failed to initialize FlowPredictor: {e}")
        return
    
    print("\n🔄 Starting Flow Analysis for All CCTV Cameras...")
    
    # Process all CCTVs for comprehensive flow analysis
    cctv_ids = [1, 2, 3, 4, 5, 6]  # All CCTV cameras
    results = {}
    
    # Sequential processing to avoid API rate limits
    for cctv_id in cctv_ids:
        result = analyze_flow_for_cctv(cctv_id, predictor)
        results[f'cctv_{cctv_id}'] = result
    
    print("\n" + "="*60)
    print("📈 FLOW ANALYSIS COMPLETE - SUMMARY REPORT")
    print("="*60)
    
    success_count = 0
    total_high_risk = 0
    
    for cctv_key, result in results.items():
        if result['status'] == 'success':
            success_count += 1
            summary = result['summary']
            high_risk_count = summary['high_risk_periods']
            total_high_risk += high_risk_count
            
            print(f"\n🎯 {cctv_key.upper()}: {result['status'].upper()}")
            print(f"   📊 Alerts: 🟢{summary['alert_distribution']['green']} 🟡{summary['alert_distribution']['yellow']} 🟠{summary['alert_distribution']['orange']} 🔴{summary['alert_distribution']['red']}")
            print(f"   ⚠️  High Risk Periods: {high_risk_count}")
            print(f"   👥 Avg People: {summary['flow_statistics']['average_people_count']}")
            print(f"   🔄 Net Flow: {summary['flow_statistics']['net_flow']}")
            
            # Show top high-risk incidents
            if summary['high_risk_details']:
                print(f"   🚨 Top Risks:")
                for risk in summary['high_risk_details'][:3]:
                    print(f"      • T{risk['timestamp']}: {risk['probability']:.2f} prob, {risk['type']}, {risk['time_to_incident']}s")
        else:
            print(f"\n❌ {cctv_key.upper()}: {result['status'].upper()} - {result.get('error', 'Unknown error')}")
    
    print(f"\n🎉 Processing Complete: {success_count}/{len(cctv_ids)} CCTVs analyzed successfully")
    print(f"🚨 Total High-Risk Periods Detected: {total_high_risk}")
    print("\n💡 Next Steps:")
    print("   1. Start the enhanced heatmap server to visualize flow data")
    print("   2. Monitor real-time predictions and alerts")
    print("   3. Integrate with security response systems")


if __name__ == "__main__":
    main()
