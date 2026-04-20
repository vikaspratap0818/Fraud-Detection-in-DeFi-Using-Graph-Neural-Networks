from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import torch
import torch.nn as nn
import numpy as np
import pickle
import os
import json
from datetime import datetime

from model import DeFiFraudGNN, FraudDetectionTrainer, create_model
from data_loader import DeFiTransactionDataLoader, load_preprocessed_data

# Initialize FastAPI app
app = FastAPI(
    title="DeFi Fraud Detection API",
    description="Graph Neural Network-based fraud detection for DeFi transactions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
scaler = None
node_mapping = None
edge_index = None
X_scaled = None
y = None

print(f"Using device: {device}")

# ==================== Request/Response Models ====================

class WalletRequest(BaseModel):
    """Request for fraud risk assessment"""
    address: str = Field(..., description="Wallet address")
    top_k: int = Field(5, description="Number of top connected wallets to return")

class RiskResponse(BaseModel):
    """Risk assessment response"""
    address: str
    fraud_risk_score: float = Field(..., description="Risk score 0-1")
    fraud_risk_label: str = Field(..., description="'low', 'medium', or 'high'")
    confidence: float = Field(..., description="Model confidence 0-1")
    connected_wallets: List[Dict] = Field(..., description="Top connected suspicious wallets")
    timestamp: str

class TrainingRequest(BaseModel):
    """Request to train the model"""
    epochs: int = Field(100, description="Number of training epochs")
    learning_rate: float = Field(0.001, description="Learning rate")
    hidden_dim: int = Field(64, description="Hidden dimension")
    embedding_dim: int = Field(32, description="Embedding dimension")
    num_layers: int = Field(3, description="Number of GNN layers")
    dropout: float = Field(0.3, description="Dropout rate")

class TrainingResponse(BaseModel):
    """Training result response"""
    status: str
    metrics: Dict
    model_path: str
    timestamp: str

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    device: str
    num_parameters: Optional[int] = None

# ==================== Helper Functions ====================

def load_model_and_data():
    """Load pretrained model and preprocessed data"""
    global model, scaler, node_mapping, edge_index, X_scaled, y
    
    if model is not None:
        return True
    
    try:
        data_dir = '../data'
        
        # Load preprocessed data
        if os.path.exists(f'{data_dir}/X_scaled.npy'):
            X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data(data_dir)
            
            # Create and load model
            model = create_model(
                num_features=X_scaled.shape[1],
                num_nodes=X_scaled.shape[0],
                device=device
            )
            
            # Load weights if available
            model_path = '../models/gnn_model.pt'
            if os.path.exists(model_path):
                checkpoint = torch.load(model_path, map_location=device)
                if isinstance(checkpoint, dict) and 'model_state' in checkpoint:
                    model.load_state_dict(checkpoint['model_state'])
                else:
                    model.load_state_dict(checkpoint)
                print(f"Model loaded from {model_path}")
            
            model.eval()
            return True
        else:
            print("Preprocessed data not found. Run training first.")
            return False
            
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def get_risk_label(score: float) -> str:
    """Convert risk score to label"""
    if score < 0.3:
        return "low"
    elif score < 0.7:
        return "medium"
    else:
        return "high"

def get_connected_wallets(address: str, top_k: int = 5) -> List[Dict]:
    """Get top connected wallets with risk scores"""
    if node_mapping is None or address not in node_mapping['node_to_idx']:
        return []
    
    node_idx = node_mapping['node_to_idx'][address]
    
    # Get risk scores for all nodes
    with torch.no_grad():
        x = torch.FloatTensor(X_scaled).to(device)
        edge_idx = edge_index.to(device)
        logits = model(x, edge_idx)
        risk_scores = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
    
    # Find connected nodes
    connected = set()
    edges = edge_index.numpy()
    connected.update(edges[1, edges[0] == node_idx])  # Incoming edges
    connected.update(edges[0, edges[1] == node_idx])  # Outgoing edges
    
    # Sort by risk score
    connected_risks = [
        {
            'address': node_mapping['idx_to_node'][idx],
            'risk_score': float(risk_scores[idx]),
            'risk_label': get_risk_label(risk_scores[idx])
        }
        for idx in list(connected)[:top_k]
    ]
    
    connected_risks.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return connected_risks[:top_k]

# ==================== API Endpoints ====================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    model_ready = load_model_and_data()
    num_params = sum(p.numel() for p in model.parameters()) if model is not None else None
    
    return HealthResponse(
        status="ok",
        model_loaded=model_ready,
        device=str(device),
        num_parameters=num_params
    )

@app.post("/risk", response_model=RiskResponse)
async def assess_risk(request: WalletRequest):
    """Assess fraud risk for a wallet"""
    
    # Load model if needed
    if not load_model_and_data():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if node_mapping is None or request.address not in node_mapping['node_to_idx']:
        raise HTTPException(
            status_code=404,
            detail=f"Address {request.address} not found in dataset"
        )
    
    try:
        node_idx = node_mapping['node_to_idx'][request.address]
        
        # Get model prediction
        with torch.no_grad():
            x = torch.FloatTensor(X_scaled).to(device)
            edge_idx = edge_index.to(device)
            logits = model(x, edge_idx)
            probs = torch.softmax(logits, dim=1)
            fraud_prob = probs[node_idx, 1].item()
            confidence = probs[node_idx].max().item()
        
        # Get connected wallets
        connected = get_connected_wallets(request.address, request.top_k)
        
        return RiskResponse(
            address=request.address,
            fraud_risk_score=fraud_prob,
            fraud_risk_label=get_risk_label(fraud_prob),
            confidence=confidence,
            connected_wallets=connected,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train", response_model=TrainingResponse)
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train the fraud detection model"""
    
    def training_job():
        """Background training job"""
        print("Starting model training...")
        
        try:
            # Load and preprocess data
            loader = DeFiTransactionDataLoader()
            df = loader.load_dataset()
            X_scaled_local, features = loader.preprocess_features()
            y_local = loader.extract_labels()
            edge_index_local = loader.build_transaction_graph()
            
            # Split data
            train_data, val_data, test_data = loader.prepare_train_val_test_split(
                X_scaled_local, y_local
            )
            
            # Save preprocessed data
            loader.save_preprocessed_data(X_scaled_local, y_local, edge_index_local)
            
            # Create model
            train_model_obj = create_model(
                num_features=X_scaled_local.shape[1],
                num_nodes=X_scaled_local.shape[0],
                hidden_dim=request.hidden_dim,
                embedding_dim=request.embedding_dim,
                num_layers=request.num_layers,
                dropout=request.dropout,
                device=device
            )
            
            # Prepare training data
            train_dict = {
                'X': train_data[0],
                'y': train_data[1],
                'edge_index': edge_index_local
            }
            
            val_dict = {
                'X': val_data[0],
                'y': val_data[1],
                'edge_index': edge_index_local
            }
            
            test_dict = {
                'X': test_data[0],
                'y': test_data[1],
                'edge_index': edge_index_local
            }
            
            # Train
            trainer = FraudDetectionTrainer(train_model_obj, device=device)
            trainer.train(
                train_dict,
                val_dict,
                epochs=request.epochs,
                lr=request.learning_rate
            )
            
            # Evaluate
            criterion = nn.CrossEntropyLoss()
            metrics, _, _ = trainer.evaluate(test_dict, criterion)
            
            # Save model
            os.makedirs('../models', exist_ok=True)
            torch.save({
                'model_state': train_model_obj.state_dict(),
                'config': {
                    'num_features': X_scaled_local.shape[1],
                    'hidden_dim': request.hidden_dim,
                    'embedding_dim': request.embedding_dim,
                    'num_layers': request.num_layers,
                    'dropout': request.dropout
                }
            }, '../models/gnn_model.pt')
            
            # Reload global model
            global model, scaler, node_mapping, edge_index, X_scaled, y
            X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data()
            model = train_model_obj
            model.eval()
            
            print("Training completed successfully!")
            print(f"Metrics: {metrics}")
            
        except Exception as e:
            print(f"Training failed: {e}")
    
    # Start background training
    background_tasks.add_task(training_job)
    
    return TrainingResponse(
        status="training_started",
        metrics={},
        model_path="../models/gnn_model.pt",
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/batch-risk")
async def batch_assess_risk(addresses: List[str]):
    """Assess fraud risk for multiple wallets"""
    
    if not load_model_and_data():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    results = []
    for address in addresses:
        try:
            request = WalletRequest(address=address)
            result = await assess_risk(request)
            results.append(result)
        except Exception as e:
            results.append({
                "address": address,
                "error": str(e)
            })
    
    return results

@app.get("/stats")
async def get_statistics():
    """Get dataset and model statistics"""
    
    if X_scaled is None:
        raise HTTPException(status_code=503, detail="Data not loaded")
    
    return {
        "num_addresses": X_scaled.shape[0],
        "num_features": X_scaled.shape[1],
        "fraud_cases": int(np.sum(y == 1)),
        "legitimate_cases": int(np.sum(y == 0)),
        "fraud_percentage": float(np.sum(y == 1) / len(y) * 100),
        "edges": edge_index.shape[1] if edge_index is not None else 0,
        "device": str(device)
    }

@app.get("/embeddings/{address}")
async def get_node_embeddings(address: str):
    """Get graph embeddings for a specific address"""
    
    if not load_model_and_data():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if node_mapping is None or address not in node_mapping['node_to_idx']:
        raise HTTPException(status_code=404, detail=f"Address not found")
    
    try:
        node_idx = node_mapping['node_to_idx'][address]
        
        with torch.no_grad():
            x = torch.FloatTensor(X_scaled).to(device)
            edge_idx = edge_index.to(device)
            embeddings = model.get_embeddings(x, edge_idx)
            node_embedding = embeddings[node_idx].cpu().numpy()
        
        return {
            "address": address,
            "embedding": node_embedding.tolist(),
            "embedding_dim": len(node_embedding)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Startup Event ====================

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    print("Loading model and data...")
    load_model_and_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)