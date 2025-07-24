import asyncio
from workflows import run_intent_analysis_workflow, run_incident_response_workflow

EMERGENCY_KEYWORDS = [
    'fire', 'emergency', 'help', 'urgent', 'alarm', 'smoke', 'medical',
    'unconscious', 'bleeding', 'injury', 'accident', 'security', 'threat',
    'violence', 'weapon', 'stampede', 'crowd', 'panic', 'crush', 'evacuation',
    'structural', 'collapse', 'damage', 'break-in', 'theft'
]

class WorkflowOrchestrator:
    def __init__(self):
        self.available_workflows = {
            "intent_analysis": {
                "function": run_intent_analysis_workflow,
                "description": "Analyzes user queries",
                "use_cases": ["questions", "task requests", "problem solving"]
            },
            "incident_response": {
                "function": run_incident_response_workflow,
                "description": "Processes emergency reports",
                "use_cases": ["emergencies", "incidents", "safety threats"]
            }
        }

    def detect_workflow(self, user_input: str) -> str:
        user_input_lower = user_input.lower()
        emergency_detected = []
        
        for keyword in EMERGENCY_KEYWORDS:
            if keyword in user_input_lower:
                emergency_detected.append(keyword)
        
        if emergency_detected:
            return "incident_response"
        else:
            return "intent_analysis"

    async def process_input(self, user_input: str, force_workflow: str = None):
        if force_workflow and force_workflow in self.available_workflows:
            workflow = force_workflow
        else:
            workflow = self.detect_workflow(user_input)
        
        workflow_function = self.available_workflows[workflow]["function"]
        result = await workflow_function(user_input)
        
        return {
            "workflow_used": workflow,
            "result": result,
            "orchestrator_status": "success"
        }

    async def compare_workflows(self, user_input: str):
        results = {
            "workflows": {},
            "orchestrator_status": "success"
        }
        
        try:
            intent_task = asyncio.create_task(run_intent_analysis_workflow(user_input))
            incident_task = asyncio.create_task(run_incident_response_workflow(user_input))
            
            intent_result, incident_result = await asyncio.gather(
                intent_task, incident_task, return_exceptions=True)
            
            results["workflows"]["intent_analysis"] = intent_result
            results["workflows"]["incident_response"] = incident_result
            
        except Exception as e:
            results["orchestrator_status"] = "failed"
            results["error"] = str(e)
        
        return results

    def get_workflow_info(self):
        return {"available_workflows": self.available_workflows}
