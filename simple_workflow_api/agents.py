from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from dotenv import load_dotenv
import uuid

load_dotenv()

# =============================================================================
# WORKFLOW 1: Data Processing Pipeline (Extract → Validate → Format)
# =============================================================================

def extract_data(text: str) -> dict:
    """Extracts key information from text."""
    word_count = len(text.split())
    return {
        "status": "success", 
        "extracted_data": text.upper().strip(),
        "word_count": word_count,
        "metadata": {"processed": True}
    }

def validate_data(data: str) -> dict:
    """Validates the extracted data."""
    is_valid = len(data) > 10  # Simple validation rule
    return {
        "status": "success",
        "is_valid": is_valid,
        "data": data,
        "validation_message": "Data passed validation" if is_valid else "Data too short"
    }

def format_output(data: str, is_valid: bool) -> dict:
    """Formats the final output."""
    if is_valid:
        formatted = f"✅ PROCESSED: {data}"
    else:
        formatted = f"❌ INVALID: {data}"
    
    return {
        "status": "success",
        "formatted_result": formatted,
        "timestamp": "2024-01-01T12:00:00Z"
    }

# Individual agents for Workflow 1
extractor_agent = LlmAgent(
    name="data_extractor",
    model="gemini-2.0-flash",
    tools=[extract_data],
    instruction="""You are a data extraction agent. 
    When given input text, call extract_data(text) and return the extraction results.""",
    description="Extracts and processes input data"
)

validator_agent = LlmAgent(
    name="data_validator", 
    model="gemini-2.0-flash",
    tools=[validate_data],
    instruction="""You are a data validation agent.
    Take the extracted_data from the previous step and call validate_data(extracted_data).
    Return the validation results.""",
    description="Validates processed data"
)

formatter_agent = LlmAgent(
    name="output_formatter",
    model="gemini-2.0-flash", 
    tools=[format_output],
    instruction="""You are an output formatting agent.
    Take the data and is_valid from previous steps and call format_output(data, is_valid).
    Return the formatted output.""",
    description="Formats final output"
)

# Sequential Workflow 1
data_processing_workflow = SequentialAgent(
    name="data_processing_pipeline",
    sub_agents=[extractor_agent, validator_agent, formatter_agent],
    description="Sequential data processing: extract → validate → format"
)

# =============================================================================
# WORKFLOW 2: Content Analysis Pipeline (Analyze → Summarize → Score)
# =============================================================================

def analyze_content(text: str) -> dict:
    """Analyzes content characteristics."""
    word_count = len(text.split())
    char_count = len(text)
    has_questions = "?" in text
    
    return {
        "status": "success",
        "word_count": word_count,
        "character_count": char_count,
        "has_questions": has_questions,
        "content_type": "question" if has_questions else "statement"
    }

def summarize_content(text: str, analysis: dict) -> dict:
    """Creates a summary of the content."""
    summary = f"Content summary: {len(text.split())} words, {analysis.get('content_type', 'unknown')} type"
    
    return {
        "status": "success",
        "summary": summary,
        "key_points": [
            f"Length: {analysis.get('word_count', 0)} words",
            f"Type: {analysis.get('content_type', 'unknown')}",
            f"Interactive: {'Yes' if analysis.get('has_questions') else 'No'}"
        ]
    }

def score_content(analysis: dict, summary: dict) -> dict:
    """Scores the content quality."""
    word_count = analysis.get('word_count', 0)
    has_questions = analysis.get('has_questions', False)
    
    score = 0
    if word_count > 50: score += 30
    if word_count > 100: score += 20
    if has_questions: score += 25
    if len(summary.get('summary', '')) > 20: score += 25
    
    return {
        "status": "success",
        "quality_score": score,
        "rating": "High" if score >= 70 else "Medium" if score >= 40 else "Low",
        "recommendations": ["Add more detail", "Include examples"] if score < 70 else ["Great content!"]
    }

# Individual agents for Workflow 2
analyzer_agent = LlmAgent(
    name="content_analyzer",
    model="gemini-2.0-flash",
    tools=[analyze_content],
    instruction="""You are a content analysis agent.
    When given text, call analyze_content(text) and return the analysis results.""",
    description="Analyzes content characteristics"
)

summarizer_agent = LlmAgent(
    name="content_summarizer",
    model="gemini-2.0-flash", 
    tools=[summarize_content],
    instruction="""You are a content summarization agent.
    Take the text and analysis from previous steps and call summarize_content(text, analysis).
    Return the summary results.""",
    description="Creates content summaries"
)

scorer_agent = LlmAgent(
    name="content_scorer",
    model="gemini-2.0-flash",
    tools=[score_content], 
    instruction="""You are a content scoring agent.
    Take the analysis and summary from previous steps and call score_content(analysis, summary).
    Return the scoring results.""",
    description="Scores content quality"
)

# Sequential Workflow 2  
content_analysis_workflow = SequentialAgent(
    name="content_analysis_pipeline",
    sub_agents=[analyzer_agent, summarizer_agent, scorer_agent],
    description="Sequential content analysis: analyze → summarize → score"
)

# =============================================================================
# WORKFLOW 3: Crowd Monitoring Pipeline (Analyze Crowd → Incident Decision)
# =============================================================================

def analyze_crowd_data(crowd_data: dict) -> dict:
    """Analyzes crowd data and determines incident risk."""
    crowd_level = crowd_data.get("crowd", "").upper()
    
    # Determine incident risk based on crowd level
    if crowd_level in ["LOW", "MODERATE"]:
        incident_risk = False
        risk_assessment = f"Crowd level is {crowd_level} - within normal parameters"
        recommendation = "Continue monitoring"
    elif crowd_level == "HIGH":
        incident_risk = True
        risk_assessment = f"Crowd level is {crowd_level} - potential incident risk detected"
        recommendation = "Immediate attention required"
    else:
        incident_risk = False
        risk_assessment = f"Unknown crowd level: {crowd_level}"
        recommendation = "Data validation needed"
    
    return {
        "status": "success",
        "crowd_level": crowd_level,
        "incident": incident_risk,
        "risk_assessment": risk_assessment,
        "recommendation": recommendation,
        "timestamp": "2024-01-01T12:00:00Z"
    }

def make_incident_decision(analysis_data: dict) -> dict:
    """Makes the final incident notification decision."""
    incident_flag = analysis_data.get("incident", False)
    crowd_level = analysis_data.get("crowd_level", "UNKNOWN")
    
    if incident_flag:
        decision = "Should Notify"
        action = "IMMEDIATE_NOTIFICATION"
        priority = "HIGH"
        message = f"Alert: High crowd density detected ({crowd_level}). Immediate intervention recommended."
    else:
        decision = "Don't Notify"
        action = "CONTINUE_MONITORING"
        priority = "LOW"
        message = f"Normal operations: Crowd level ({crowd_level}) is within acceptable limits."
    
    return {
        "status": "success",
        "decision": decision,
        "action": action,
        "priority": priority,
        "notification_message": message,
        "requires_human_intervention": incident_flag
    }

# Individual agents for Workflow 3
crowd_analyzer_agent = LlmAgent(
    name="crowd_data_analyzer",
    model="gemini-2.0-flash",
    tools=[analyze_crowd_data],
    instruction="""You are a crowd data analysis agent for safety monitoring.
    When given crowd data, call analyze_crowd_data(crowd_data) to assess incident risk.
    Focus on crowd density levels and safety implications.
    Return the complete analysis including incident risk assessment.""",
    description="Analyzes crowd density data and assesses incident risk"
)

incident_notifier_agent = LlmAgent(
    name="incident_notifier",
    model="gemini-2.0-flash",
    tools=[make_incident_decision],
    instruction="""You are an incident notification decision agent.
    Take the analysis_data from the crowd analyzer and call make_incident_decision(analysis_data).
    Your role is to make the final decision on whether emergency notifications are needed.
    Return the notification decision and required actions.""",
    description="Makes incident notification decisions based on crowd analysis"
)

# Sequential Workflow 3
crowd_monitoring_workflow = SequentialAgent(
    name="crowd_monitoring_pipeline",
    sub_agents=[crowd_analyzer_agent, incident_notifier_agent],
    description="Sequential crowd monitoring: analyze crowd data → incident notification decision"
)

# =============================================================================
# Workflow Runner Functions
# =============================================================================

async def run_data_processing_workflow(input_text: str) -> dict:
    """Runs the data processing workflow."""
    session_service = InMemorySessionService()
    session_id = str(uuid.uuid4())
    session = await session_service.create_session(
        app_name="data_processing_app",
        user_id="user_123", 
        session_id=session_id
    )
    
    runner = Runner(
        agent=data_processing_workflow,
        app_name="data_processing_app",
        session_service=session_service
    )
    
    content = types.Content(
        role="user",
        parts=[types.Part(text=input_text)]
    )
    
    results = []
    agent_responses = {}  # Track latest response per agent
    
    for event in runner.run(
        user_id="user_123",
        session_id=session_id,
        new_message=content
    ):
        if event.content and event.content.parts and event.content.parts[0].text:
            # Only capture non-empty responses and keep the latest for each agent
            agent_responses[event.author] = {
                "agent": event.author,
                "response": event.content.parts[0].text.strip()
            }
    
    # Convert to ordered list based on workflow sequence  
    agent_order = ["data_extractor", "data_validator", "output_formatter"]
    for agent_name in agent_order:
        if agent_name in agent_responses:
            results.append(agent_responses[agent_name])
    
    return {
        "workflow": "data_processing",
        "input": input_text,
        "results": results,
        "status": "completed"
    }

async def run_content_analysis_workflow(input_text: str) -> dict:
    """Runs the content analysis workflow."""
    session_service = InMemorySessionService()
    session_id = str(uuid.uuid4())
    session = await session_service.create_session(
        app_name="content_analysis_app", 
        user_id="user_456",
        session_id=session_id
    )
    
    runner = Runner(
        agent=content_analysis_workflow,
        app_name="content_analysis_app",
        session_service=session_service
    )
    
    content = types.Content(
        role="user",
        parts=[types.Part(text=input_text)]
    )
    
    results = []
    agent_responses = {}  # Track latest response per agent
    
    for event in runner.run(
        user_id="user_456",
        session_id=session_id, 
        new_message=content
    ):
        if event.content and event.content.parts and event.content.parts[0].text:
            # Only capture non-empty responses and keep the latest for each agent
            agent_responses[event.author] = {
                "agent": event.author,
                "response": event.content.parts[0].text.strip()
            }
    
    # Convert to ordered list based on workflow sequence
    agent_order = ["content_analyzer", "content_summarizer", "content_scorer"]
    for agent_name in agent_order:
        if agent_name in agent_responses:
            results.append(agent_responses[agent_name])
    
    return {
        "workflow": "content_analysis",
        "input": input_text,
        "results": results,
        "status": "completed"
    }

async def run_crowd_monitoring_workflow(crowd_data: dict) -> dict:
    """Runs the crowd monitoring workflow."""
    session_service = InMemorySessionService()
    session_id = str(uuid.uuid4())
    session = await session_service.create_session(
        app_name="crowd_monitoring_app",
        user_id="user_789",
        session_id=session_id
    )
    
    runner = Runner(
        agent=crowd_monitoring_workflow,
        app_name="crowd_monitoring_app",
        session_service=session_service
    )
    
    # Convert crowd data to text format for the agent
    input_text = f"Analyze this crowd data: {crowd_data}"
    content = types.Content(
        role="user",
        parts=[types.Part(text=input_text)]
    )
    
    results = []
    agent_responses = {}  # Track latest response per agent
    
    for event in runner.run(
        user_id="user_789",
        session_id=session_id,
        new_message=content
    ):
        if event.content and event.content.parts and event.content.parts[0].text:
            # Only capture non-empty responses and keep the latest for each agent
            agent_responses[event.author] = {
                "agent": event.author,
                "response": event.content.parts[0].text.strip()
            }
    
    # Convert to ordered list based on workflow sequence
    agent_order = ["crowd_data_analyzer", "incident_notifier"]
    for agent_name in agent_order:
        if agent_name in agent_responses:
            results.append(agent_responses[agent_name])
    
    return {
        "workflow": "crowd_monitoring",
        "input": crowd_data,
        "results": results,
        "status": "completed"
    } 