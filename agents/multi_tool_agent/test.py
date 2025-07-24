import asyncio
from orchestrator import WorkflowOrchestrator

async def test_system():
    orchestrator = WorkflowOrchestrator()
    
    test_cases = [
        ("How can I learn Python?", "intent_analysis"),
        ("Fire emergency in building A!", "incident_response"),
        ("Compare React vs Vue", "intent_analysis"),
        ("Medical emergency: unconscious person", "incident_response")
    ]
    
    print("🧪 TESTING MULTI-AGENT SYSTEM")
    print("=" * 50)
    
    for i, (input_text, expected) in enumerate(test_cases, 1):
        print(f"\n🧪 TEST {i}: {input_text}")
        detected = orchestrator.detect_workflow(input_text)
        print(f"🎯 Expected: {expected}")
        print(f"🤖 Detected: {detected}")
        print(f"✅ Result: {'PASS' if detected == expected else 'FAIL'}")
        
        result = await orchestrator.process_input(input_text)
        print(f"📊 Status: {result['result']['status']}")
    
    print(f"\n🔄 TESTING COMPARISON MODE")
    comparison = await orchestrator.compare_workflows("Help me understand AI")
    print(f"📊 Comparison status: {comparison['orchestrator_status']}")
    print(f"✅ Intent analysis: {comparison['workflows']['intent_analysis']['status']}")
    print(f"✅ Incident response: {comparison['workflows']['incident_response']['status']}")
    
    print(f"\n🎉 TESTING COMPLETE!")

if __name__ == "__main__":
    asyncio.run(test_system())
