from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from google.genai import types
from dotenv import load_dotenv
import uuid
import datetime

load_dotenv()
GEMINI_MODEL = "gemini-2.0-flash"

#========== Intent Analysis Workflow ==========
intent_analyzer_agent = LlmAgent(
    name="IntentAnalyzerAgent",
    model=GEMINI_MODEL,
    description="Analyzes user queries to identify intentions.",
    instruction="""
    Analyze query and provide:
    - Primary Intent: information_seeking, task_execution, problem_solving, comparison, recommendation
    - Confidence: 0-100%
    - Key Indicators: words/phrases
    - Domain: technical, business, personal, etc.
    
    Format: **INTENT ANALYSIS**
    - Primary Intent: [category]
    - Confidence: [score]%
    - Key Indicators: [list]
    - Domain: [domain]
    """,
    output_key="intent_analysis_result"
)

intent_summary_agent = LlmAgent(
    name="IntentSummaryAgent",
    model=GEMINI_MODEL,
    description="Creates actionable summaries.",
    instruction="""
    Based on: {intent_analysis_result}
    
    Format: **INTENT SUMMARY**
    - Executive Summary: [sentence]
    - Priority: [High/Medium/Low]
    - Recommended Actions: • [Action 1] • [Action 2] • [Action 3]
    - Success Metrics: [metrics]
    - Next Steps: [actions]
    """,
    output_key="intent_summary_result"
)

intent_workflow_agent = SequentialAgent(
    name="IntentAnalysisWorkflow",
    description="Intent analysis pipeline",
    sub_agents=[intent_analyzer_agent, intent_summary_agent]
)


#========== Incident Response Workflow ==========
incident_classifier_agent = LlmAgent(
    name="IncidentClassifierAgent",
    model=GEMINI_MODEL,
    description="Classifies incident reports.",
    instruction="""
    Classify into: FIRE, MEDICAL, SECURITY, STAMPEDE, STRUCTURAL, EVACUATION
    Severity: CRITICAL, HIGH, MEDIUM
    
    Format: **INCIDENT CLASSIFICATION**
    - Type: [category]
    - Severity: [level]
    - Location: [details or "Not specified"]
    - Risk Factors: [dangers]
    - Urgency: [time factors]
    - Resources Needed: [resources]
    """,
    output_key="incident_classification_result"
)

alert_generation_agent = LlmAgent(
    name="AlertGenerationAgent",
    model=GEMINI_MODEL,
    description="Generates emergency alerts.",
    instruction="""
    Based on: {incident_classification_result}
    
    Generate: **🚨 EMERGENCY ALERT 🚨**
    **[TYPE] - [SEVERITY]**
    
    **IMMEDIATE ACTIONS:**
    1. [Action - Who - When]
    2. [Action - Who - When]
    3. [Action - Who - When]
    
    **RESOURCES:** Emergency Services, Personnel, Equipment
    **COMMUNICATIONS:** Notify who, how, frequency
    **SAFETY:** Immediate steps, area control, monitoring
    **DETAILS:** Location, time, risks
    """,
    output_key="alert_generation_result"
)

incident_workflow_agent = SequentialAgent(
    name="IncidentResponseWorkflow",
    description="Incident response pipeline",
    sub_agents=[incident_classifier_agent, alert_generation_agent]
)

APP_NAME = "multi-agent-system"
DATABASE_URL = "sqlite:///./multi_agent_data.db"
_session_service = None

async def get_session_service() -> DatabaseSessionService:
    global _session_service
    if _session_service is None:
        _session_service = DatabaseSessionService(db_url=DATABASE_URL)
    return _session_service

async def run_intent_analysis_workflow(user_query: str) -> dict:
    try:
        unique_id = str(uuid.uuid4())
        session_service = await get_session_service()
        
        current_session = None
        try:
            current_session = await session_service.get_session(
                app_name=APP_NAME, user_id=unique_id, session_id=unique_id)
        except Exception:
            pass
        
        if current_session is None:
            current_session = await session_service.create_session(
                app_name=APP_NAME, user_id=unique_id, session_id=unique_id)
        
        runner = Runner(
            app_name=APP_NAME,
            agent=intent_workflow_agent,
            session_service=session_service,
        )
        
        user_message = types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_query)]
        )
        
        events = runner.run_async(
            user_id=unique_id,
            session_id=unique_id,
            new_message=user_message,
        )
        
        final_response = None
        async for event in events:
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_response = event.content.parts[0].text
        
        if final_response is None:
            return {"status": "error", "workflow": "intent_analysis", "error": "No response"}
        
        return {
            "status": "success",
            "workflow": "intent_analysis",
            "user_query": user_query,
            "analysis": final_response,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "workflow": "intent_analysis",
            "user_query": user_query,
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }

async def run_incident_response_workflow(incident_report: str) -> dict:
    try:
        unique_id = str(uuid.uuid4())
        session_service = await get_session_service()
        
        current_session = None
        try:
            current_session = await session_service.get_session(
                app_name=APP_NAME, user_id=unique_id, session_id=unique_id)
        except Exception:
            pass
        
        if current_session is None:
            current_session = await session_service.create_session(
                app_name=APP_NAME, user_id=unique_id, session_id=unique_id)
        
        runner = Runner(
            app_name=APP_NAME,
            agent=incident_workflow_agent,
            session_service=session_service,
        )
        
        user_message = types.Content(
            role="user",
            parts=[types.Part.from_text(text=incident_report)]
        )
        
        events = runner.run_async(
            user_id=unique_id,
            session_id=unique_id,
            new_message=user_message,
        )
        
        final_response = None
        async for event in events:
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_response = event.content.parts[0].text
        
        if final_response is None:
            return {"status": "error", "workflow": "incident_response", "error": "No response"}
        
        return {
            "status": "success",
            "workflow": "incident_response",
            "incident_report": incident_report,
            "classification": final_response,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "workflow": "incident_response",
            "incident_report": incident_report,
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }
