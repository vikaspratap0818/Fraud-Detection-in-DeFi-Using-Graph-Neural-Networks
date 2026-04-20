
import torch
import torch.nn as nn
import argparse
from datetime import datetime
import os

from data_loader import DeFiTransactionDataLoader, load_preprocessed_data
from model import create_model, FraudDetectionTrainer

def main():
    parser = argparse.ArgumentParser(description='Train DeFi Fraud Detection Model')
    parser.add_argument('--epochs', type=int, default=100, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--hidden_dim', type=int, default=64, help='Hidden dimension')
    parser.add_argument('--embedding_dim', type=int, default=32, help='Embedding dimension')
    parser.add_argument('--num_layers', type=int, default=3, help='Number of GNN layers')
    parser.add_argument('--dropout', type=float, default=0.3, help='Dropout rate')
    parser.add_argument('--weight_decay', type=float, default=1e-4, help='Weight decay')
    parser.add_argument('--data_path', type=str, default='../data/transaction_dataset.csv',
                        help='Path to dataset')
    parser.add_argument('--save_dir', type=str, default='../models', help='Directory to save model')
    parser.add_argument('--preprocess', action='store_true', help='Force preprocessing of data')
    
    args = parser.parse_args()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # ===================== Data Loading =====================
    data_dir = '../data'
    
    # Check if preprocessed data exists
    if args.preprocess or not os.path.exists(f'{data_dir}/X_scaled.npy'):
        print("Preprocessing dataset...")
        loader = DeFiTransactionDataLoader(args.data_path)
        
        # Load and preprocess
        df = loader.load_dataset()
        X_scaled, feature_cols = loader.preprocess_features()
        y = loader.extract_labels()
        edge_index = loader.build_transaction_graph()
        
        # Split data
        train_data, val_data, test_data = loader.prepare_train_val_test_split(X_scaled, y)
        
        # Save preprocessed data
        loader.save_preprocessed_data(X_scaled, y, edge_index)
        
        print("Dataset preprocessed and saved!")
        
    else:
        print("Loading preprocessed data...")
        X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data(data_dir)
        
        # Resplit data
        from data_loader import DeFiTransactionDataLoader
        loader = DeFiTransactionDataLoader()
        train_data, val_data, test_data = loader.prepare_train_val_test_split(X_scaled, y)
    
    # ===================== Model Creation =====================
    print("\nCreating model...")
    model = create_model(
        num_features=X_scaled.shape[1],
        num_nodes=X_scaled.shape[0],
        hidden_dim=args.hidden_dim,
        embedding_dim=args.embedding_dim,
        num_layers=args.num_layers,
        dropout=args.dropout,
        device=device
    )
    
    num_params = sum(p.numel() for p in model.parameters())
    print(f"Model created with {num_params} parameters")
    
    # ===================== Training =====================
    print("\nStarting training...")
    
    # Prepare data dicts
    train_dict = {
        'X': train_data[0],
        'y': train_data[1],
        'edge_index': edge_index
    }
    
    val_dict = {
        'X': val_data[0],
        'y': val_data[1],
        'edge_index': edge_index
    }
    
    test_dict = {
        'X': test_data[0],
        'y': test_data[1],
        'edge_index': edge_index
    }
    
    # Train model
    trainer = FraudDetectionTrainer(model, device=device)
    trainer.train(
        train_dict,
        val_dict,
        epochs=args.epochs,
        lr=args.lr,
        weight_decay=args.weight_decay
    )
    
    # ===================== Evaluation =====================
    print("\nEvaluating on test set...")
    criterion = nn.CrossEntropyLoss()
    metrics, preds, preds_class = trainer.evaluate(test_dict, criterion)
    
    print("\n" + "="*50)
    print("TEST METRICS")
    print("="*50)
    if metrics['loss'] is not None:
        print(f"Loss: {metrics['loss']:.4f}")
    print(f"AUC: {metrics['auc']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1-Score: {metrics['f1']:.4f}")
    print(f"Confusion Matrix:\n{metrics['confusion_matrix']}")
    print("="*50 + "\n")
    
    # ===================== Model Saving =====================
    os.makedirs(args.save_dir, exist_ok=True)
    model_path = os.path.join(args.save_dir, 'gnn_model.pt')
    
    torch.save({
        'model_state': model.state_dict(),
        'config': {
            'num_features': X_scaled.shape[1],
            'hidden_dim': args.hidden_dim,
            'embedding_dim': args.embedding_dim,
            'num_layers': args.num_layers,
            'dropout': args.dropout,
        },
        'metrics': metrics,
        'timestamp': datetime.now().isoformat()
    }, model_path)
    
    print(f"Model saved to {model_path}")
    
    # Save training config
    config_path = os.path.join(args.save_dir, 'training_config.txt')
    with open(config_path, 'w') as f:
        f.write("DeFi Fraud Detection Model Training Config\n")
        f.write("="*50 + "\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Device: {device}\n")
        f.write(f"\nArchitecture:\n")
        f.write(f"  Input Features: {X_scaled.shape[1]}\n")
        f.write(f"  Hidden Dimension: {args.hidden_dim}\n")
        f.write(f"  Embedding Dimension: {args.embedding_dim}\n")
        f.write(f"  Number of Layers: {args.num_layers}\n")
        f.write(f"  Dropout: {args.dropout}\n")
        f.write(f"\nTraining:\n")
        f.write(f"  Epochs: {args.epochs}\n")
        f.write(f"  Learning Rate: {args.lr}\n")
        f.write(f"  Weight Decay: {args.weight_decay}\n")
        f.write(f"\nData:\n")
        f.write(f"  Total Samples: {len(y)}\n")
        f.write(f"  Fraud Cases: {sum(y==1)}\n")
        f.write(f"  Legitimate Cases: {sum(y==0)}\n")
        f.write(f"\nTest Metrics:\n")
        f.write(f"  AUC: {metrics['auc']:.4f}\n")
        f.write(f"  Precision: {metrics['precision']:.4f}\n")
        f.write(f"  Recall: {metrics['recall']:.4f}\n")
        f.write(f"  F1-Score: {metrics['f1']:.4f}\n")
    
    print(f"Config saved to {config_path}")
    print("\n✓ Training completed successfully!")

if __name__ == "__main__":
    main()
