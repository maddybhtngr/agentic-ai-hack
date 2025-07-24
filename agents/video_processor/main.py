"""
Main script to demonstrate the video analyzer functionality.
"""

import os
import argparse
import json
from video_analyzer import VideoAnalyzer

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Analyze video for people and smoke detection")
    parser.add_argument("--sample-rate", "-s", type=int, default=30, 
                        help="Sample rate (analyze every nth frame)")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    parser.add_argument("--project-id", "-p", help="Google Cloud Project ID")
    return parser.parse_args()

def main():
    """Main function to run the video analyzer."""
    args = parse_arguments()
    
    # Fixed video file path
    video_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos", "crowd_fire.mp4")
    
    # Check if video file exists
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        print("Please upload a video file named 'video.mp4' to the 'videos' folder.")
        return 1
    
    try:
        # Initialize the video analyzer
        analyzer = VideoAnalyzer(project_id=args.project_id)
        
        print(f"Analyzing video: {video_path}")
        print(f"Sampling every {args.sample_rate} frames")
        
        # Comprehensive analysis
        results = analyzer.analyze_video_comprehensive(video_path)
        print("\nTimestamp-wise Analysis Results:")
        print(json.dumps(results, indent=2))
        
        # Save detailed results to file if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"\nDetailed results saved to: {args.output}")
        
        return 0
        
    except Exception as e:
        print(f"Error analyzing video: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
