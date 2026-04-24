"""
Model evaluation and visualization script
"""

import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (
    roc_curve, auc, confusion_matrix, 
    precision_recall_curve, roc_auc_score
)
import argparse
import os

from model import create_model, FraudDetectionTrainer
from data_loader import load_preprocessed_data

def plot_roc_curve(y_true, y_pred, save_path='../results/roc_curve.png'):
    """Plot ROC curve"""
    fpr, tpr, _ = roc_curve(y_true, y_pred)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random Classifier')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('ROC Curve - Fraud Detection', fontsize=14)
    plt.legend(loc="lower right", fontsize=11)
    plt.grid(alpha=0.3)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"ROC curve saved to {save_path}")
    plt.close()  # Clean up figure to prevent memory leaks
    

def plot_precision_recall_curve(y_true, y_pred, save_path='../results/pr_curve.png'):
    """Plot Precision-Recall curve"""
    precision, recall, _ = precision_recall_curve(y_true, y_pred)
    pr_auc = auc(recall, precision)
    
    plt.figure(figsize=(8, 6))
    plt.plot(recall, precision, color='blue', lw=2, label=f'PR curve (AUC = {pr_auc:.3f})')
    plt.xlabel('Recall', fontsize=12)
    plt.ylabel('Precision', fontsize=12)
    plt.title('Precision-Recall Curve - Fraud Detection', fontsize=14)
    plt.legend(loc="best", fontsize=11)
    plt.grid(alpha=0.3)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"PR curve saved to {save_path}")
    plt.close()  # Clean up figure to prevent memory leaks

def plot_confusion_matrix(y_true, y_pred, save_path='../results/confusion_matrix.png'):
    """Plot confusion matrix"""
    cm = confusion_matrix(y_true, y_pred)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    
    classes = ['Legitimate', 'Fraudulent']
    tick_marks = np.arange(len(classes))
    ax.set_xticks(tick_marks)
    ax.set_yticks(tick_marks)
    ax.set_xticklabels(classes, fontsize=11)
    ax.set_yticklabels(classes, fontsize=11)
    
    # Add text annotations
    np.set_printoptions(precision=2)
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, str(cm[i, j]), fontsize=14, ha='center', va='center',
                   color='white' if cm[i, j] > cm.max() / 2 else 'black')
    
    ax.set_ylabel('True Label', fontsize=12)
    ax.set_xlabel('Predicted Label', fontsize=12)
    ax.set_title('Confusion Matrix - Fraud Detection', fontsize=14)
    
    fig.colorbar(im, ax=ax)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Confusion matrix saved to {save_path}")
    plt.close()  # Clean up figure to prevent memory leaks

def plot_score_distribution(y_true, y_pred, save_path='../results/score_distribution.png'):
    """Plot prediction score distribution"""
    fraud_scores = y_pred[y_true == 1]
    legit_scores = y_pred[y_true == 0]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.hist(legit_scores, bins=50, alpha=0.7, label='Legitimate', color='green', edgecolor='black')
    ax.hist(fraud_scores, bins=50, alpha=0.7, label='Fraudulent', color='red', edgecolor='black')
    
    ax.set_xlabel('Fraud Risk Score', fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.set_title('Prediction Score Distribution', fontsize=14)
    ax.legend(fontsize=11)
    ax.grid(alpha=0.3, axis='y')
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tigh')
    plt.close()  # Clean up figure to prevent memory leakst')
    print(f"Score distribution saved to {save_path}")

def evaluate_and_visualize(model_path, data_dir='../data', results_dir='../results'):
    """Complete evaluation pipeline"""
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load data
    print("\nLoading preprocessed data...")
    X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data(data_dir)
    
    # Load model (use safe weights_only loading if available, else warn user)
    print("Loading model...")
    try:
        checkpoint = torch.load(model_path, map_location=device, weights_only=True)
    except (RuntimeError, TypeError):
        # weights_only not supported in older PyTorch versions
        print("Warning: Loading with weights_only=True failed. Using standard load (PyTorch < 2.0).")
        checkpoint = torch.load(model_path, map_location=device)
    config = checkpoint['config']
    
    model = create_model(
        num_features=config['num_features'],
        num_nodes=X_scaled.shape[0],
        hidden_dim=config['hidden_dim'],
        embedding_dim=config['embedding_dim'],
        num_layers=config['num_layers'],
        dropout=config['dropout'],
        device=device
    )
    
    model.load_state_dict(checkpoint['model_state'])
    model.eval()
    
    # Get predictions
    print("Generating predictions...")
    x = torch.FloatTensor(X_scaled).to(device)
    edge_idx = edge_index.to(device)
    
    with torch.no_grad():
        logits = model(x, edge_idx)
        probs = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
    
    preds_class = (probs > 0.5).astype(int)
    
    # Print metrics
    print("\n" + "="*60)
    print("EVALUATION METRICS")
    print("="*60)
    
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score,
        f1_score, roc_auc_score, matthews_corrcoef
    )
    
    accuracy = accuracy_score(y, preds_class)
    precision = precision_score(y, preds_class, zero_division=0)
    recall = recall_score(y, preds_class, zero_division=0)
    f1 = f1_score(y, preds_class, zero_division=0)
    auc_score = roc_auc_score(y, probs) if len(np.unique(y)) > 1 else 0
    mcc = matthews_corrcoef(y, preds_class)
    
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"AUC-ROC:   {auc_score:.4f}")
    print(f"MCC:       {mcc:.4f}")
    
    cm = confusion_matrix(y, preds_class)
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives:  {cm[0,0]}")
    print(f"  False Positives: {cm[0,1]}")
    print(f"  False Negatives: {cm[1,0]}")
    print(f"  True Positives:  {cm[1,1]}")
    
    specificity = cm[0,0] / (cm[0,0] + cm[0,1]) if (cm[0,0] + cm[0,1]) > 0 else 0
    sensitivity = cm[1,1] / (cm[1,1] + cm[1,0]) if (cm[1,1] + cm[1,0]) > 0 else 0
    
    print(f"\nSensitivity: {sensitivity:.4f}")
    print(f"Specificity: {specificity:.4f}")
    print("="*60 + "\n")
    
    # Generate visualizations only if both classes are present
    print("Generating visualizations...")
    os.makedirs(results_dir, exist_ok=True)
    
    if len(np.unique(y)) > 1:
        plot_roc_curve(y, probs, f'{results_dir}/roc_curve.png')
        plot_precision_recall_curve(y, probs, f'{results_dir}/pr_curve.png')
        plot_confusion_matrix(y, preds_class, f'{results_dir}/confusion_matrix.png')
    else:
        print(f"Warning: Only one class present in data ({np.unique(y)[0]}), skipping ROC/PR/confusion matrix plots.")
    
    # Always plot score distribution
    plot_score_distribution(y, probs, f'{results_dir}/score_distribution.png')
    
    # Save summary report
    report_path = f'{results_dir}/evaluation_report.txt'
    with open(report_path, 'w') as f:
        f.write("DeFi Fraud Detection Model - Evaluation Report\n")
        f.write("="*60 + "\n\n")
        f.write(f"Model Path: {model_path}\n")
        f.write(f"Device: {device}\n\n")
        f.write("Model Configuration:\n")
        f.write(f"  Num Features: {config['num_features']}\n")
        f.write(f"  Hidden Dim: {config['hidden_dim']}\n")
        f.write(f"  Embedding Dim: {config['embedding_dim']}\n")
        f.write(f"  Num Layers: {config['num_layers']}\n")
        f.write(f"  Dropout: {config['dropout']}\n\n")
        
        f.write("Dataset Statistics:\n")
        f.write(f"  Total Samples: {len(y)}\n")
        f.write(f"  Fraudulent: {np.sum(y==1)} ({np.sum(y==1)/len(y)*100:.2f}%)\n")
        f.write(f"  Legitimate: {np.sum(y==0)} ({np.sum(y==0)/len(y)*100:.2f}%)\n\n")
        
        f.write("Evaluation Metrics:\n")
        f.write(f"  Accuracy:  {accuracy:.4f}\n")
        f.write(f"  Precision: {precision:.4f}\n")
        f.write(f"  Recall:    {recall:.4f}\n")
        f.write(f"  F1-Score:  {f1:.4f}\n")
        f.write(f"  AUC-ROC:   {auc_score:.4f}\n")
        f.write(f"  MCC:       {mcc:.4f}\n")
        f.write(f"  Sensitivity: {sensitivity:.4f}\n")
        f.write(f"  Specificity: {specificity:.4f}\n\n")
        
        f.write("Confusion Matrix:\n")
        f.write(f"  True Negatives:  {cm[0,0]}\n")
        f.write(f"  False Positives: {cm[0,1]}\n")
        f.write(f"  False Negatives: {cm[1,0]}\n")
        f.write(f"  True Positives:  {cm[1,1]}\n\n")
        
        f.write("Generated Visualizations:\n")
        f.write("  - roc_curve.png\n")
        f.write("  - pr_curve.png\n")
        f.write("  - confusion_matrix.png\n")
        f.write("  - score_distribution.png\n")
    
    print(f"Report saved to {report_path}")
    print("\nEvaluation complete!")

def main():
    parser = argparse.ArgumentParser(description='Model Evaluation and Visualization')
    parser.add_argument('--model_path', type=str, default='../models/gnn_model.pt',
                        help='Path to trained model')
    parser.add_argument('--data_dir', type=str, default='../data',
                        help='Directory with preprocessed data')
    parser.add_argument('--results_dir', type=str, default='../results',
                        help='Directory to save results')
    
    args = parser.parse_args()
    
    evaluate_and_visualize(args.model_path, args.data_dir, args.results_dir)

if __name__ == "__main__":
    main()
