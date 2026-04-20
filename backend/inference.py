"""
Inference script for fraud detection on new wallets
"""

import torch
import argparse
import pickle
import numpy as np
from model import create_model
from data_loader import load_preprocessed_data

def load_model(model_path, device='cpu'):
    """Load trained model"""
    checkpoint = torch.load(model_path, map_location=device)
    
    config = checkpoint['config']
    model = create_model(
        num_features=config['num_features'],
        num_nodes=10000,
        hidden_dim=config['hidden_dim'],
        embedding_dim=config['embedding_dim'],
        num_layers=config['num_layers'],
        dropout=config['dropout'],
        device=device
    )
    
    model.load_state_dict(checkpoint['model_state'])
    model.eval()
    
    return model

def predict_wallet_risk(address, model, X_scaled, edge_index, node_mapping, device='cpu'):
    """Predict fraud risk for a wallet"""
    
    if address not in node_mapping['node_to_idx']:
        return None, "Address not found in training data"
    
    node_idx = node_mapping['node_to_idx'][address]
    
    try:
        x = torch.FloatTensor(X_scaled).to(device)
        edge_idx = edge_index.to(device)
        
        with torch.no_grad():
            logits = model(x, edge_idx)
            probs = torch.softmax(logits, dim=1)
            fraud_prob = probs[node_idx, 1].item()
            legit_prob = probs[node_idx, 0].item()
            confidence = max(fraud_prob, legit_prob)
        
        risk_label = "high" if fraud_prob > 0.7 else ("medium" if fraud_prob > 0.3 else "low")
        
        return {
            'address': address,
            'fraud_risk_score': fraud_prob,
            'legitimate_score': legit_prob,
            'risk_label': risk_label,
            'confidence': confidence
        }, None
        
    except Exception as e:
        return None, str(e)

def batch_predict(addresses, model, X_scaled, edge_index, node_mapping, device='cpu'):
    """Predict fraud risk for multiple wallets"""
    
    results = []
    for address in addresses:
        result, error = predict_wallet_risk(address, model, X_scaled, edge_index, node_mapping, device)
        if error:
            results.append({'address': address, 'error': error})
        else:
            results.append(result)
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Fraud Risk Inference')
    parser.add_argument('--address', type=str, help='Wallet address to check')
    parser.add_argument('--addresses_file', type=str, help='File with addresses (one per line)')
    parser.add_argument('--model_path', type=str, default='../models/gnn_model.pt',
                        help='Path to trained model')
    parser.add_argument('--data_dir', type=str, default='../data',
                        help='Directory with preprocessed data')
    
    args = parser.parse_args()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load model and data
    print("Loading model and data...")
    model = load_model(args.model_path, device)
    X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data(args.data_dir)
    
    # Prediction
    if args.address:
        print(f"\nPredicting fraud risk for: {args.address}")
        result, error = predict_wallet_risk(args.address, model, X_scaled, edge_index, node_mapping, device)
        
        if error:
            print(f"Error: {error}")
        else:
            print("="*50)
            print(f"Address: {result['address']}")
            print(f"Fraud Risk Score: {result['fraud_risk_score']:.4f}")
            print(f"Legitimate Score: {result['legitimate_score']:.4f}")
            print(f"Risk Label: {result['risk_label'].upper()}")
            print(f"Confidence: {result['confidence']:.4f}")
            print("="*50)
    
    elif args.addresses_file:
        print(f"\nPredicting fraud risk for addresses in: {args.addresses_file}")
        
        with open(args.addresses_file, 'r') as f:
            addresses = [line.strip() for line in f.readlines()]
        
        results = batch_predict(addresses, model, X_scaled, edge_index, node_mapping, device)
        
        print("\n" + "="*70)
        print(f"{'Address':<45} {'Risk Score':<15} {'Label':<10}")
        print("="*70)
        
        for result in results:
            if 'error' in result:
                print(f"{result['address']:<45} {'ERROR':<15} {'N/A':<10}")
            else:
                score = result['fraud_risk_score']
                label = result['risk_label']
                print(f"{result['address']:<45} {score:<15.4f} {label:<10}")
        
        print("="*70)
    
    else:
        print("Please provide --address or --addresses_file")

if __name__ == "__main__":
    main()
