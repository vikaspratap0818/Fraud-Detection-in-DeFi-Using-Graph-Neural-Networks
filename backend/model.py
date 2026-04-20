import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, GraphConv, global_mean_pool
from torch_geometric.data import Data, DataLoader
import numpy as np
import copy
from sklearn.metrics import roc_auc_score, precision_recall_fscore_support, confusion_matrix
import numpy as np

class DeFiFraudGNN(nn.Module):
    """
    Graph Neural Network for DeFi fraud detection with graph embeddings.
    
    Architecture:
    - Input features: preprocessed transaction patterns
    - Graph convolution layers with embeddings
    - Output: fraud probability
    """
    
import copy

    def __init__(self, num_features, num_nodes=10000, hidden_dim=64, embedding_dim=32, num_layers=3, dropout=0.3):
        super(DeFiFraudGNN, self).__init__()
        
        self.num_features = num_features
        self.num_nodes = num_nodes  # Store for potential use
        self.hidden_dim = hidden_dim
        self.embedding_dim = embedding_dim
        self.num_layers = num_layers
        self.dropout_rate = dropout
        
        # Input projection layer
        self.input_projection = nn.Linear(num_features, hidden_dim)
        
        # Node embedding layer with variable size based on actual number of nodes
        self.node_embedding = nn.Embedding(num_nodes, embedding_dim)  # Use num_nodes parameter
        
        # GCN layers for feature propagation
        self.gcn_layers = nn.ModuleList()
        for i in range(num_layers):
            in_channels = hidden_dim + embedding_dim if i == 0 else hidden_dim
            self.gcn_layers.append(GraphConv(in_channels, hidden_dim))
        
        # Batch normalization layers
        self.batch_norms = nn.ModuleList([
            nn.BatchNorm1d(hidden_dim) for _ in range(num_layers)
        ])
        
        # Output layers for binary classification
        self.fc1 = nn.Linear(hidden_dim, hidden_dim // 2)
        self.fc2 = nn.Linear(hidden_dim // 2, 32)
        self.fc_out = nn.Linear(32, 2)
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, edge_index, node_idx=None):
        """
        Forward pass through the GNN
        
        Args:
            x: Node features [num_nodes, num_features]
            edge_index: Edge indices [2, num_edges]
            node_idx: Optional node indices for embedding
            
        Returns:
            out: Classification logits [num_nodes, 2]
        """
        # Project input features
        x = self.input_projection(x)
        
        # Add node embeddings if node indices provided
        if node_idx is not None:
            node_embeddings = self.node_embedding(node_idx)
            x = torch.cat([x, node_embeddings], dim=1)
        else:
            # Create default node indices if not provided
            device = x.device
            node_idx = torch.arange(x.shape[0], device=device)
            node_embeddings = self.node_embedding(node_idx)
            x = torch.cat([x, node_embeddings], dim=1)
        
        for i, (gcn, bn) in enumerate(zip(self.gcn_layers, self.batch_norms)):
            x = gcn(x, edge_index)
            x = bn(x)
            x = F.relu(x)
            x = self.dropout(x)
        
        # Classification head
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        out = self.fc_out(x)
        
        return out
    
    def get_embeddings(self, x, edge_index, node_idx=None):
        """Extract intermediate embeddings for visualization/analysis"""
        x = self.input_projection(x)
        
        if node_idx is not None:
            node_embeddings = self.node_embedding(node_idx)
            x = torch.cat([x, node_embeddings], dim=1)
        else:
            device = x.device
            node_idx = torch.arange(x.shape[0], device=device)
            node_embeddings = self.node_embedding(node_idx)
            x = torch.cat([x, node_embeddings], dim=1)
        
        for gcn, bn in zip(self.gcn_layers[:-1], self.batch_norms[:-1]):
            x = gcn(x, edge_index)
            x = bn(x)
            x = F.relu(x)
        
        return x

class FraudDetectionTrainer:
    """Trainer for DeFi fraud detection model"""
    
    def __init__(self, model, device='cpu'):
        self.model = model.to(device)
        self.device = device
        self.best_val_auc = 0
        self.best_model_state = None
        
    def train_epoch(self, data, optimizer, criterion):
        """Train for one epoch"""
        self.model.train()
        
        x = torch.FloatTensor(data['X']).to(self.device)
        y = torch.LongTensor(data['y']).to(self.device)
        edge_index = data['edge_index'].to(self.device)
        
        optimizer.zero_grad()
        
        # Forward pass
        logits = self.model(x, edge_index)
        loss = criterion(logits, y)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        return loss.item()
    
    def validate(self, data, criterion):
        """Validate model"""
        self.model.eval()
        
        x = torch.FloatTensor(data['X']).to(self.device)
        y = torch.LongTensor(data['y']).to(self.device)
        edge_index = data['edge_index'].to(self.device)
        
        with torch.no_grad():
            logits = self.model(x, edge_index)
            loss = criterion(logits, y)
            
            # Get predictions
            preds = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
            y_true = y.cpu().numpy()
            
            # Calculate metrics
            auc = roc_auc_score(y_true, preds) if len(np.unique(y_true)) > 1 else 0
            
        return loss.item(), auc, preds
    
    def train(self, train_data, val_data, epochs=100, lr=0.001, weight_decay=1e-4):
        """Full training loop"""
        optimizer = torch.optim.Adam(
            self.model.parameters(),
            lr=lr,
            weight_decay=weight_decay
        )
        
        # Weighted loss for imbalanced data
        y = train_data['y']
        pos_count = max(1, np.sum(y == 1))  # Guard against zero positives
        class_weights = torch.FloatTensor([
            1.0,
            len(y) / (2 * pos_count)  # Safe from division by zero
        ]).to(self.device)
        
        criterion = nn.CrossEntropyLoss(weight=class_weights)
        
        print("Starting training...")
        
        for epoch in range(epochs):
            train_loss = self.train_epoch(train_data, optimizer, criterion)
            val_loss, val_auc, _ = self.validate(val_data, criterion)
            
            if val_auc > self.best_val_auc:
                self.best_val_auc = val_auc
                # Deep copy the state dict to avoid tensor reference changes during training
                self.best_model_state = copy.deepcopy(self.model.state_dict())
            
            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs} | "
                      f"Train Loss: {train_loss:.4f} | "
                      f"Val Loss: {val_loss:.4f} | "
                      f"Val AUC: {val_auc:.4f}")
        
        # Load best model
        if self.best_model_state is not None:
            self.model.load_state_dict(self.best_model_state)
            print(f"Loaded best model with Val AUC: {self.best_val_auc:.4f}")
    
    def evaluate(self, test_data, criterion=None):
        """Evaluate on test set"""
        self.model.eval()
        
        x = torch.FloatTensor(test_data['X']).to(self.device)
        y = torch.LongTensor(test_data['y']).to(self.device)
        edge_index = test_data['edge_index'].to(self.device)
        
        with torch.no_grad():
            logits = self.model(x, edge_index)
            
            if criterion is not None:
                loss = criterion(logits, y).item()
            else:
                loss = None
            
            # Get predictions
            preds = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
            preds_class = (preds > 0.5).astype(int)
            y_true = y.cpu().numpy()
            
            # Calculate metrics
            auc = roc_auc_score(y_true, preds) if len(np.unique(y_true)) > 1 else 0
            precision, recall, f1, _ = precision_recall_fscore_support(
                y_true, preds_class, average='weighted'
            )
            cm = confusion_matrix(y_true, preds_class)
            
            metrics = {
                'loss': loss,
                'auc': auc,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'confusion_matrix': cm
            }
            
        return metrics, preds, preds_class

def create_model(num_features, num_nodes=10000, hidden_dim=64, embedding_dim=32, 
                 num_layers=3, dropout=0.3, device='cpu'):
    """Factory function to create GNN model and move to device"""
    model = DeFiFraudGNN(
        num_features=num_features,
        num_nodes=num_nodes,  # Pass num_nodes to model
        hidden_dim=hidden_dim,
        embedding_dim=embedding_dim,
        num_layers=num_layers,
        dropout=dropout
    )
    # Ensure model is on the correct device
    if not isinstance(device, torch.device):
        device = torch.device(device)
    model = model.to(device)
    return model

if __name__ == "__main__":
    # Example usage
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Create model
    model = create_model(
        num_features=51,
        hidden_dim=64,
        embedding_dim=32,
        device=device
    )
    
    print(f"Model created with {sum(p.numel() for p in model.parameters())} parameters")

    torch.save(model.state_dict(), '../models/gnn_model.pt')
    print("Model saved")