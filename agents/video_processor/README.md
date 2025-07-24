# Video Processor

This module processes a local video file using Google Vertex AI Vision to detect people and smoke.

## Features

- Analyze a local video file
- Count the number of people in each frame
- Detect the presence of smoke
- Generate detailed analysis reports

## Prerequisites

- Python 3.8+
- Google Cloud account
- Google Cloud project with billing enabled

## Google Cloud Setup

### 1. Create a Google Cloud Project (if you don't have one)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name and click "Create"
5. Make note of your Project ID as you'll need it later

### 2. Enable Required APIs

1. Go to the [API Library](https://console.cloud.google.com/apis/library)
2. Search for and enable the following APIs:
   - Vertex AI API
   - Cloud Storage API
   - Video Intelligence API

### 3. Create a Service Account and Download Credentials

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Enter a service account name and description
4. Click "Create and Continue"
5. Assign the following roles:
   - Vertex AI User
   - Storage Admin
   - Video Intelligence Service Agent
6. Click "Continue" and then "Done"
7. Find your new service account in the list and click on it
8. Go to the "Keys" tab
9. Click "Add Key" > "Create new key"
10. Select JSON and click "Create"
11. The key file will be downloaded to your computer

### 4. Set Up Authentication

You can set up authentication in two ways:

#### Option 1: Using a .env file (Recommended)

Create a `.env` file in the video_processor directory with the following content:

```
# Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-downloaded-key.json"
GOOGLE_CLOUD_PROJECT="your-project-id"

# Optional settings
# VERTEX_AI_LOCATION="us-central1"
```

The code will automatically load these environment variables when it runs.

#### Option 2: Setting environment variables directly

```bash
# Set the environment variable to point to your downloaded key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-downloaded-key.json"

# Set your Google Cloud project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### 5. Install Required Dependencies

```bash
pip install -r requirements.txt
```

## Usage

1. Place your video file named `video.mp4` in the `videos` folder

2. Run the video analyzer:

```bash
python main.py
```

Additional options:

```bash
# Analyze every 10th frame (for faster processing)
python main.py --sample-rate 10

# Save detailed results to a JSON file
python main.py --output results.json

# Specify Google Cloud project ID
python main.py --project-id your-project-id
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Make sure your `GOOGLE_APPLICATION_CREDENTIALS` environment variable is correctly set
   - Verify that the service account key file exists and is valid
   - Check that the service account has the necessary permissions

2. **API Not Enabled**
   - If you get an error about an API not being enabled, go to the Google Cloud Console and enable the required API
   - Sometimes it takes a few minutes for newly enabled APIs to become available

3. **Billing Issues**
   - Ensure your Google Cloud project has billing enabled
   - Check if you've exceeded your quota or budget

4. **Storage Bucket Creation Failures**
   - Verify that your service account has the Storage Admin role
   - Try creating a bucket manually and using that instead

5. **Permission Denied**
   - Check if your service account has all the required roles
   - Try adding the "Owner" role temporarily to debug permission issues

### Checking API Status

You can check if the APIs are properly enabled with this command:

```bash
gcloud services list --enabled
```

### Validating Authentication

Test if your authentication is working correctly:

```bash
gcloud auth application-default print-access-token
```

If this returns a token, your authentication is set up correctly.

## Example Output

```
Created bucket: video-analysis-my-project-12345678
Uploaded video to: gs://video-analysis-my-project-12345678/video.mp4
Starting video analysis...

Analysis Results:
Maximum number of people detected: 3
Smoke detected: No

Detailed results saved to: results.json
```
