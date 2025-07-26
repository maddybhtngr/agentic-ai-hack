#!/usr/bin/env python3

import os
import json
import time
import asyncio
from pathlib import Path
from flask import Flask, render_template_string
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)

# Enhanced HTML template with Flow Prediction UI
ENHANCED_FLOW_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Enhanced CCTV Flow Prediction Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/heatmap.js@2.0.5/build/heatmap.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 10px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            background: rgba(0,0,0,0.2);
            padding: 15px;
            border-radius: 10px;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 5px;
            background: linear-gradient(45deg, #00d2ff, #3a7bd5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .cctv-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(650px, 1fr));
            gap: 20px;
            max-width: 1600px;
            margin: 0 auto;
        }
        
        .cctv-card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .heatmap-title {
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .status-light {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #ff4444;
            transition: background 0.3s;
            animation: pulse 2s infinite;
        }
        
        .status-light.connected { 
            background: #44ff44; 
            animation: none;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .heatmap-container {
            width: 100%;
            height: 350px;
            background: #000;
            border-radius: 10px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.1);
        }
        
        .info-panel {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 20px;
        }
        
        .info-tabs {
            display: flex;
            margin-bottom: 20px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            padding: 5px;
        }
        
        .tab-button {
            flex: 1;
            padding: 12px;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            font-size: 0.9em;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .tab-button.active {
            background: linear-gradient(45deg, #00d2ff, #3a7bd5);
            font-weight: bold;
            transform: translateY(-2px);
        }
        
        .tab-button:hover:not(.active) {
            background: rgba(255,255,255,0.1);
        }
        
        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease-in;
        }
        
        .tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .info-section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-weight: bold;
            color: #00d2ff;
            margin-bottom: 12px;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .info-label {
            font-weight: 500;
            color: rgba(255,255,255,0.8);
        }
        
        .info-value {
            font-weight: bold;
            color: #fff;
        }
        
        .flag {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .flag.true { 
            background: linear-gradient(45deg, #e63946, #dc2626); 
            color: white; 
            animation: alertPulse 1s infinite;
        }
        .flag.false { 
            background: linear-gradient(45deg, #2d5016, #16a34a); 
            color: #90ee90; 
        }
        
        @keyframes alertPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        /* Flow-specific styles */
        .flow-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .flow-item {
            text-align: center;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .flow-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #00d2ff;
            margin-bottom: 5px;
        }
        
        .flow-label {
            font-size: 0.9em;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .flow-positive { color: #4ade80; }
        .flow-negative { color: #f87171; }
        .flow-neutral { color: #94a3b8; }
        
        .alert-level {
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            font-size: 1.1em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .alert-level.green { 
            background: linear-gradient(45deg, #2d5016, #16a34a); 
            color: #90ee90; 
        }
        .alert-level.yellow { 
            background: linear-gradient(45deg, #8b4513, #f59e0b); 
            color: #fbbf24; 
        }
        .alert-level.orange { 
            background: linear-gradient(45deg, #b8860b, #ea580c); 
            color: #fb923c; 
        }
        .alert-level.red { 
            background: linear-gradient(45deg, #8b0000, #dc2626); 
            color: #fca5a5; 
            animation: criticalPulse 1.5s infinite;
        }
        
        @keyframes criticalPulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
            50% { opacity: 0.8; box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        }
        
        .prediction-details {
            background: rgba(0,0,0,0.4);
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .risk-factors {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }
        
        .risk-tag {
            background: linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,0,0,0.2));
            color: #ff6b6b;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            border: 1px solid rgba(255,0,0,0.5);
            font-weight: 500;
        }
        
        .movement-patterns {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .pattern-tag {
            background: linear-gradient(45deg, rgba(0,210,255,0.3), rgba(58,123,213,0.2));
            color: #00d2ff;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75em;
        }
        
        .timestamp-display {
            background: rgba(0,0,0,0.8);
            color: #00ff88;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 0.8em;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .movement-pattern {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(45deg, rgba(0,210,255,0.3), rgba(58,123,213,0.2));
            color: #00d2ff;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75em;
            border: 1px solid rgba(0,210,255,0.5);
        }
        
        .pattern-arrow {
            font-size: 1.2em;
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .pattern-magnitude {
            font-weight: 500;
        }
        
        .no-movement {
            color: #666;
            font-style: italic;
            font-size: 0.8em;
        }
        
        .congestion-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .congestion-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Enhanced CCTV Flow Prediction Dashboard</h1>
        <p>🎯 Real-time Flow Analysis | 🤖 Vertex AI Forecasting | ⚡ 10min Incident Prediction</p>
    </div>
    
    <div class="cctv-grid" id="cctv-grid">
        <!-- CCTV cards will be generated here -->
    </div>

    <script>
        const cctvData = {}; // Store data for each CCTV
        const heatmapInstances = {}; // Store heatmap instances
        
        // Initialize CCTV cards
        function initializeCCTVs() {
            const cctvIds = ['cctv_1', 'cctv_2', 'cctv_3', 'cctv_4', 'cctv_5', 'cctv_6'];
            const grid = document.getElementById('cctv-grid');
            
            cctvIds.forEach(cctvId => {
                const card = createEnhancedFlowCard(cctvId);
                grid.appendChild(card.container);
                setupDataDisplay(cctvId, card);
            });
        }
        
        function createEnhancedFlowCard(cctvId) {
            const card = document.createElement('div');
            card.className = 'cctv-card';
            card.id = `card-${cctvId}`;
            
            const title = document.createElement('div');
            title.className = 'heatmap-title';
            title.innerHTML = `${cctvId.replace(/_/g, ' ').toUpperCase()} <span class="timestamp-display" id="timestamp-${cctvId}">t=0s</span> <div class="status-light" id="status-${cctvId}"></div>`;
            
            const container = document.createElement('div');
            container.className = 'heatmap-container';
            container.id = `heatmap-${cctvId}`;
            
            const infoPanel = document.createElement('div');
            infoPanel.className = 'info-panel';
            infoPanel.innerHTML = `
                <div class="info-tabs">
                    <button class="tab-button active" onclick="showTab('flow', '${cctvId}')">Flow Analysis</button>
                    <button class="tab-button" onclick="showTab('prediction', '${cctvId}')">Prediction</button>
                    <button class="tab-button" onclick="showTab('overview', '${cctvId}')">Overview</button>
                    <button class="tab-button" onclick="showTab('details', '${cctvId}')">Details</button>
                </div>
                
                <div id="flow-${cctvId}" class="tab-content active">
                    <div class="info-section">
                        <div class="section-title">🔄 Real-time Flow Metrics</div>
                        <div class="flow-metrics">
                            <div class="flow-item">
                                <div class="flow-value" id="inflow-${cctvId}">0</div>
                                <div class="flow-label">Inflow</div>
                            </div>
                            <div class="flow-item">
                                <div class="flow-value" id="outflow-${cctvId}">0</div>
                                <div class="flow-label">Outflow</div>
                            </div>
                            <div class="flow-item">
                                <div class="flow-value" id="net-flow-${cctvId}">0</div>
                                <div class="flow-label">Net Flow</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📊 People Count:</span>
                            <span class="info-value" id="people-count-${cctvId}">0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🏃‍♂️ Avg Velocity:</span>
                            <span class="info-value" id="velocity-${cctvId}">0.0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🚧 Congestion Points:</span>
                            <span class="info-value" id="congestion-count-${cctvId}">0</span>
                        </div>
                    </div>
                </div>
                
                <div id="prediction-${cctvId}" class="tab-content">
                    <div class="info-section">
                        <div class="section-title">🔮 Incident Prediction</div>
                        <div class="alert-level green" id="alert-level-${cctvId}">LOW RISK</div>
                        <div class="info-item">
                            <span class="info-label">⚠️ Incident Probability:</span>
                            <span class="info-value" id="incident-prob-${cctvId}">0%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🎯 Prediction Confidence:</span>
                            <span class="info-value" id="pred-confidence-${cctvId}">0%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">⏱️ Time to Incident:</span>
                            <span class="info-value" id="time-to-incident-${cctvId}">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🚨 Predicted Type:</span>
                            <span class="info-value" id="incident-type-${cctvId}">None</span>
                        </div>
                        <div class="prediction-details" id="prediction-details-${cctvId}">
                            <div style="font-weight: bold; margin-bottom: 8px;">🔍 Risk Factors:</div>
                            <div class="risk-factors" id="risk-factors-${cctvId}"></div>
                        </div>
                    </div>
                </div>
                
                <div id="overview-${cctvId}" class="tab-content">
                    <div class="info-section">
                        <div class="section-title">📊 Current Status</div>
                        <div class="info-item">
                            <span class="info-label">Crowd Density:</span>
                            <span class="crowd-density low" id="crowd-density-${cctvId}">LOW</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Movement Patterns:</span>
                            <div class="movement-patterns" id="movement-patterns-${cctvId}"></div>
                        </div>
                    </div>
                    <div class="info-section">
                        <div class="section-title">🚨 Emergency Alerts</div>
                        <div class="info-item">
                            <span class="info-label">Violence:</span>
                            <span class="flag false" id="violence-flag-${cctvId}">NO</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fire:</span>
                            <span class="flag false" id="fire-flag-${cctvId}">NO</span>
                        </div>
                    </div>
                </div>
                
                <div id="details-${cctvId}" class="tab-content">
                    <div class="info-section">
                        <div class="section-title">🔧 Technical Details</div>
                        <div class="info-item">
                            <span class="info-label">Analysis Engine:</span>
                            <span class="info-value">Gemini 2.5 Pro</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Prediction Model:</span>
                            <span class="info-value">Vertex AI Forecasting</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Update Frequency:</span>
                            <span class="info-value">Real-time</span>
                        </div>
                    </div>
                </div>
            `;
            
            card.appendChild(title);
            card.appendChild(container);
            card.appendChild(infoPanel);
            
            return { container: card, statusLight: title.querySelector('.status-light'), infoPanel };
        }
        
        window.showTab = function(tabName, cctvId) {
            // Hide all tab contents for this CCTV
            const allTabs = document.querySelectorAll(`#card-${cctvId} .tab-content`);
            allTabs.forEach(tab => tab.classList.remove('active'));
            
            // Remove active class from all tab buttons
            const allButtons = document.querySelectorAll(`#card-${cctvId} .tab-button`);
            allButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab and activate button
            document.getElementById(`${tabName}-${cctvId}`).classList.add('active');
            event.target.classList.add('active');
        }
        
        function setupDataDisplay(cctvId, { container, statusLight, infoPanel }) {
            // Create heatmap instance
            const heatmapContainer = container.querySelector(`#heatmap-${cctvId}`);
            const heatmapInstance = h337.create({ 
                container: heatmapContainer, 
                radius: 30, 
                maxOpacity: 0.8, 
                minOpacity: 0.1, 
                blur: 0.95 
            });
            
            heatmapInstances[cctvId] = heatmapInstance;
            
            // Load and display flow analysis data
            loadFlowData(cctvId);
            
            // Set status as connected (static data)
            statusLight.classList.add('connected');
        }
        
        function loadFlowData(cctvId) {
            // Load flow analysis data from the JSON file generated by the preprocessor
            fetch(`/flow_data/${cctvId}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.predictions) {
                        updateFlowDisplay(cctvId, data);
                    }
                })
                .catch(error => {
                    console.log(`No flow data available for ${cctvId}: ${error.message}`);
                    // Set default values
                    updateFlowDisplay(cctvId, getDefaultFlowData());
                });
        }
        
        function updateFlowDisplay(cctvId, flowData) {
            if (!flowData.predictions) return;
            
            // Get all timestamps and start cycling through them
            const timestamps = Object.keys(flowData.predictions).sort((a, b) => parseInt(a) - parseInt(b));
            if (timestamps.length === 0) return;
            
            // Store data for cycling
            window.cctvDataStore = window.cctvDataStore || {};
            window.cctvDataStore[cctvId] = {
                timestamps: timestamps,
                data: flowData.predictions,
                currentIndex: 0
            };
            
            // Start cycling through timestamps
            startDataCycle(cctvId);
        }
        
        function startDataCycle(cctvId) {
            const dataStore = window.cctvDataStore[cctvId];
            if (!dataStore) return;
            
            function updateToCurrentTimestamp() {
                const timestamp = dataStore.timestamps[dataStore.currentIndex];
                const currentData = dataStore.data[timestamp];
                
                if (!currentData) return;
                
                const flow = currentData.flow_metrics;
                const prediction = currentData.prediction;
                
                // Update timestamp display
                document.getElementById(`timestamp-${cctvId}`).textContent = `t=${timestamp}s`;
                
                displayFlowData(cctvId, flow, prediction);
                
                // Move to next timestamp
                dataStore.currentIndex = (dataStore.currentIndex + 1) % dataStore.timestamps.length;
            }
            
            // Update immediately
            updateToCurrentTimestamp();
            
            // Set up interval for cycling (every 2 seconds)
            setInterval(updateToCurrentTimestamp, 2000);
        }
        
        function displayFlowData(cctvId, flow, prediction) {
            
            // Update flow metrics
            document.getElementById(`inflow-${cctvId}`).textContent = flow.inflow_count || 0;
            document.getElementById(`outflow-${cctvId}`).textContent = flow.outflow_count || 0;
            
            const netFlow = flow.net_flow || 0;
            const netFlowElement = document.getElementById(`net-flow-${cctvId}`);
            netFlowElement.textContent = netFlow;
            netFlowElement.className = `flow-value ${netFlow > 0 ? 'flow-positive' : netFlow < 0 ? 'flow-negative' : 'flow-neutral'}`;
            
            document.getElementById(`people-count-${cctvId}`).textContent = flow.total_people || 0;
            document.getElementById(`velocity-${cctvId}`).textContent = (flow.average_velocity || 0).toFixed(2);
            document.getElementById(`congestion-count-${cctvId}`).textContent = flow.congestion_points?.length || 0;
            
            // Update prediction
            const incidentProb = (prediction.incident_probability * 100).toFixed(1);
            const predConfidence = (prediction.prediction_confidence * 100).toFixed(1);
            
            document.getElementById(`incident-prob-${cctvId}`).textContent = `${incidentProb}%`;
            document.getElementById(`pred-confidence-${cctvId}`).textContent = `${predConfidence}%`;
            document.getElementById(`time-to-incident-${cctvId}`).textContent = `${prediction.time_to_incident_seconds}s`;
            document.getElementById(`incident-type-${cctvId}`).textContent = prediction.predicted_incident_type || 'None';
            
            // Update alert level
            const alertElement = document.getElementById(`alert-level-${cctvId}`);
            alertElement.className = `alert-level ${prediction.alert_level}`;
            alertElement.textContent = `${prediction.alert_level.toUpperCase()} RISK`;
            
            // Update risk factors
            const riskContainer = document.getElementById(`risk-factors-${cctvId}`);
            riskContainer.innerHTML = '';
            (prediction.risk_factors || []).forEach(factor => {
                const tag = document.createElement('span');
                tag.className = 'risk-tag';
                tag.textContent = factor.replace('_', ' ').toUpperCase();
                riskContainer.appendChild(tag);
            });
            
            // Update crowd density
            const densityElement = document.getElementById(`crowd-density-${cctvId}`);
            densityElement.className = `crowd-density ${flow.density_level}`;
            densityElement.textContent = (flow.density_level || 'low').toUpperCase();
            
            // Update movement patterns
            const movementContainer = document.getElementById(`movement-patterns-${cctvId}`);
            if (flow.movement_vectors && flow.movement_vectors.length > 0) {
                movementContainer.innerHTML = '';
                flow.movement_vectors.forEach((vector, index) => {
                    const [vx, vy] = vector;
                    const magnitude = Math.sqrt(vx*vx + vy*vy);
                    const direction = Math.atan2(vy, vx) * 180 / Math.PI;
                    
                    const patternTag = document.createElement('div');
                    patternTag.className = 'movement-pattern';
                    patternTag.innerHTML = `
                        <span class="pattern-arrow" style="transform: rotate(${direction}deg)">→</span>
                        <span class="pattern-magnitude">${magnitude.toFixed(2)}</span>
                    `;
                    movementContainer.appendChild(patternTag);
                });
            } else {
                movementContainer.innerHTML = '<span class="no-movement">No movement detected</span>';
            }
            
            // Generate heatmap data from flow metrics
            if (flow.congestion_points && flow.congestion_points.length > 0) {
                const w = 400; // heatmap container width
                const h = 350; // heatmap container height
                
                const heatmapData = flow.congestion_points.map(point => ({
                    x: Math.round(point[0] * w),
                    y: Math.round(point[1] * h),
                    value: 90 + Math.random() * 10 // Random intensity 90-100
                }));
                
                heatmapInstances[cctvId].setData({ max: 100, data: heatmapData });
            }
        }
        
        function getDefaultFlowData() {
            return {
                predictions: {
                    "0": {
                        flow_metrics: {
                            inflow_count: 0,
                            outflow_count: 0,
                            net_flow: 0,
                            total_people: 0,
                            density_level: "low",
                            average_velocity: 0.0,
                            congestion_points: []
                        },
                        prediction: {
                            risk_score: 0.1,
                            alert_level: "low",
                            confidence: 50,
                            time_to_incident: null,
                            predicted_incident_type: "none",
                            risk_factors: []
                        }
                    }
                }
            };
        }
        
        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeCCTVs();
        });
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    return render_template_string(ENHANCED_FLOW_TEMPLATE)

@app.route('/flow_data/<cctv_id>')
def get_flow_data(cctv_id):
    """Serve flow analysis data for a specific CCTV"""
    try:
        # Look for flow analysis file
        flow_file = Path(__file__).parent.parent / "videos" / "static_video" / cctv_id / f"{cctv_id}_flow_analysis.json"
        
        if flow_file.exists():
            with open(flow_file, 'r') as f:
                return json.load(f)
        else:
            # Return default data if no flow analysis available
            return {
                "cctv_id": cctv_id,
                "total_timestamps": 0,
                "predictions": {}
            }
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    print("🚀 Starting Enhanced Flow Prediction Dashboard...")
    print("🎯 Features: Real-time Flow Analysis + Vertex AI Forecasting")
    print("📊 URL: http://localhost:5001")
    print("💡 Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
