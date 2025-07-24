import re
from google.cloud import language_v1  # Import Google Cloud Natural Language API client
import os

# Initialize Google Cloud Natural Language client
# This assumes GOOGLE_APPLICATION_CREDENTIALS environment variable is set
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '../home/key.json'
try:
    nlp_client = language_v1.LanguageServiceClient()
    print("Google Cloud Natural Language client initialized.")
except Exception as e:
    nlp_client = None
    print(f"Error initializing Google Cloud Natural Language client: {e}")
    print(
        "Please ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set and points to a valid service account key.")


def analyze_sentiment(text: str) -> dict:
    """
    Performs sentiment analysis on the given text using Google Cloud Natural Language API.
    Returns polarity (score) and magnitude.
    Score ranges from -1 (negative) to +1 (positive).
    Magnitude indicates the strength of the sentiment (0 to infinity).
    """
    if nlp_client is None:
        return {
            "polarity": 0.0,
            "subjectivity": 0.0,  # N/A for Google NLP directly, often inferred from magnitude/score
            "label": "Analysis Skipped (NLP client not initialized)"
        }

    document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)

    try:
        sentiment = nlp_client.analyze_sentiment(request={'document': document}).document_sentiment

        # Google NLP provides 'score' and 'magnitude'
        # Score: -1.0 to 1.0, indicating the overall emotion (negative to positive)
        # Magnitude: 0.0 to +inf, indicating the strength of the emotion, regardless of polarity.
        #            Longer, more emotional texts will have higher magnitudes.

        sentiment_label = "Neutral"
        if sentiment.score > 0.2:  # Threshold for positive
            sentiment_label = "Positive"
        elif sentiment.score < -0.2:  # Threshold for negative
            sentiment_label = "Negative"
        # If score is between -0.2 and 0.2, it's considered neutral

        return {
            "polarity": sentiment.score,
            "magnitude": sentiment.magnitude,
            "label": sentiment_label
        }
    except Exception as e:
        print(f"Error analyzing sentiment with Google NLP: {e}")
        return {
            "polarity": 0.0,
            "magnitude": 0.0,
            "label": f"Error: {e}"
        }


def detect_emergency(text: str) -> bool:
    """
    Detects potential emergency situations based on keywords in the text.
    This is a simplified rule-based approach. A real system would use ML models.
    """
    text_lower = text.lower()
    emergency_keywords = [
        "emergency", "help", "fire", "panic", "stampede", "crush", "injured",
        "stuck", "can't breathe", "medical", "ambulance", "police", "crowd surge",
        "danger", "unsafe", "urgent", "chaos", "overwhelmed", "loud bang", "explosion",
        "collapse", "trapped", "screaming", "mob", "riot"
    ]

    for keyword in emergency_keywords:
        if keyword in text_lower:
            return True
    return False


def clean_text(text: str) -> str:
    """
    Simple text cleaning function to remove URLs, mentions, and hashtags.
    """
    text = re.sub(r'http\S+|www.\S+', '', text)  # Remove URLs
    text = re.sub(r'@\w+', '', text)  # Remove mentions
    text = re.sub(r'#\w+', '', text)  # Remove hashtags
    text = text.strip()  # Remove leading/trailing whitespace
    return text


def analyze_social_media_posts(posts: list[dict]):
    """
    Analyzes a list of social media posts for sentiment and emergency situations.
    """
    print("--- Analyzing Social Media Posts ---")
    for i, post in enumerate(posts):
        caption = post.get("caption", "")
        geolocation = post.get("geolocation", "N/A")
        post_id = post.get("id", f"Post_{i + 1}")

        cleaned_caption = clean_text(caption)
        sentiment_result = analyze_sentiment(cleaned_caption)
        is_emergency = detect_emergency(cleaned_caption)

        print(f"\n--- {post_id} ---")
        print(f"Original Caption: \"{caption}\"")
        print(f"Cleaned Caption:  \"{cleaned_caption}\"")
        print(f"Geolocation: {geolocation}")
        print(
            f"Sentiment: {sentiment_result['label']} (Score: {sentiment_result['polarity']:.2f}, Magnitude: {sentiment_result['magnitude']:.2f})")
        print(f"Emergency Alert: {'YES' if is_emergency else 'NO'}")

        if is_emergency:
            print(
                f"  ACTION REQUIRED: This post indicates a potential emergency at {geolocation}. Consider sending emergency response.")
        elif sentiment_result['label'] == "Negative" and sentiment_result['polarity'] < -0.3 and sentiment_result[
            'magnitude'] > 0.5:
            print(
                f"  ATTENTION: Strong negative sentiment detected at {geolocation}. Investigate crowd dissatisfaction.")
        elif sentiment_result['label'] == "Positive" and sentiment_result['polarity'] > 0.5 and sentiment_result[
            'magnitude'] > 0.5:
            print(
                f"  INSIGHT: Very strong positive sentiment detected at {geolocation}. People are thoroughly enjoying it!")


# --- Mock Social Media Post Data ---
# In a real system, this data would come from a social media API or a database.
# Geolocation would ideally be precise lat/lng.
mock_posts = [
    {
        "id": "ConcertPost1",
        "caption": "This concert is absolutely amazing! The energy is insane! #bestconcertever #music",
        "geolocation": {"lat": 34.052, "lon": -118.243}
    },
    {
        "id": "ConcertPost2",
        "caption": "Too crowded here, can't even move. Feeling a bit crushed. #concertproblems #packed",
        "geolocation": {"lat": 34.0525, "lon": -118.2425}
    },
    {
        "id": "EmergencyPost1",
        "caption": "OMG there's a fire near the stage! Need help immediately! #fire #emergency",
        "geolocation": {"lat": 34.0518, "lon": -118.2432}
    },
    {
        "id": "ConcertPost3",
        "caption": "Great vibes, but the sound system needs work. A bit muddy. #concert #feedback",
        "geolocation": {"lat": 34.0521, "lon": -118.2435}
    },
    {
        "id": "EmergencyPost2",
        "caption": "Huge crowd surge near the entrance, people are falling! Send police/medical assistance NOW! #panic #crowdsafety",
        "geolocation": {"lat": 34.0530, "lon": -118.2410}
    },
    {
        "id": "ConcertPost4",
        "caption": "Just chilling with friends, loving the atmosphere. So much fun! 🎉",
        "geolocation": {"lat": 34.0528, "lon": -118.2428}
    },
    {
        "id": "NeutralPost1",
        "caption": "It's raining. Guess I'll put on my poncho. #weather",
        "geolocation": {"lat": 34.0523, "lon": -118.2430}
    },
    {
        "id": "EmergencyPost3",
        "caption": "Heard a loud bang, everyone is screaming and running! Trapped near exit!",
        "geolocation": {"lat": 34.0520, "lon": -118.2420}
    }
]

# --- Run the analysis ---
if __name__ == "__main__":
    analyze_social_media_posts(mock_posts)
