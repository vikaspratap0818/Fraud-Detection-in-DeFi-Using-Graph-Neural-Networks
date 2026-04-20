import pandas as pd
import numpy as np
import torch
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

class DeFiTransactionDataLoader:
    """Load and preprocess DeFi transaction dataset for fraud detection"""
    
    def __init__(self, data_path='../data/transaction_dataset.csv'):
        self.data_path = data_path
        self.df = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.node_to_idx = None
        self.idx_to_node = None
        
    def load_dataset(self):
        """Load the CSV dataset"""
        print(f"Loading dataset from {self.data_path}...")
        self.df = pd.read_csv(self.data_path)
        print(f"Dataset shape: {self.df.shape}")
        print(f"Columns: {list(self.df.columns)[:10]}...")  # First 10 columns
        return self.df
    
    def preprocess_features(self):
        """Select and normalize numerical features"""
        # Select numerical features (exclude Address, Index, and non-numeric columns)
        exclude_cols = ['Index', 'Address', 'FLAG']
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        self.feature_columns = [col for col in numeric_cols if col not in exclude_cols]
        
        print(f"Selected {len(self.feature_columns)} features for training")
        
        # Replace inf and -inf with 0
        X = self.df[self.feature_columns].copy()
        X = X.replace([np.inf, -np.inf], 0)
        X = X.fillna(0)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, self.feature_columns
    
    def extract_labels(self):
        """Extract fraud labels (FLAG column)"""
        y = self.df['FLAG'].values
        print(f"Fraud distribution: {np.sum(y==0)} legitimate, {np.sum(y==1)} fraudulent")
        return y
    
    def build_transaction_graph(self):
        """Build directed graph from transaction data"""
        # Create node mapping for addresses
        addresses = pd.concat([
            self.df['Address'].astype(str)
        ]).unique()
        
        self.node_to_idx = {addr: idx for idx, addr in enumerate(addresses)}
        self.idx_to_node = {idx: addr for addr, idx in self.node_to_idx.items()}
        
        print(f"Created graph with {len(addresses)} unique addresses")
        
        # For DeFi fraud detection, we create edges based on transaction patterns
        # Each row represents a wallet's activity patterns
        edge_index = self._create_graph_edges()
        
        return edge_index
    
    def _create_graph_edges(self):
        """Create edge indices for graph construction"""
        # Create edges based on transaction similarity and patterns
        n_nodes = len(self.node_to_idx)
        
        edges = []
        
        # Start with identity edges (self-loops) - important for GNN message passing
        for i in range(n_nodes):
            edges.append([i, i])
        
        # Add inter-node edges based on feature similarity (k-NN approach)
        # This creates meaningful connections between similar wallet behaviors
        if hasattr(self, 'node_features') and self.node_features is not None:
            # Compute cosine similarity between node features
            from sklearn.metrics.pairwise import cosine_similarity
            similarity_matrix = cosine_similarity(self.node_features)
            
            # Add edges to top-k most similar nodes (excluding self)
            k = min(5, n_nodes - 1)  # Connect to 5 nearest neighbors
            for i in range(n_nodes):
                # Get indices of k most similar nodes (sorted by similarity)
                similar_indices = np.argsort(similarity_matrix[i])[-k-1:-1][::-1]
                for j in similar_indices:
                    if i != j:
                        # Add bidirectional edges for undirected graph
                        edges.append([i, j])
                        edges.append([j, i])
        
        # Remove duplicates while preserving edge direction
        edges = list(set(map(tuple, edges)))
        edges = [list(edge) for edge in edges]
        
        # Convert to tensor
        edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
        
        return edge_index
    
    def prepare_train_val_test_split(self, X_scaled, y, test_size=0.2, val_size=0.1):
        """Split data into train, validation, and test sets"""
        # First split: test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X_scaled, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Second split: validation set from remaining
        val_ratio = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_ratio, random_state=42, stratify=y_temp
        )
        
        print(f"Train set: {X_train.shape[0]}")
        print(f"Val set: {X_val.shape[0]}")
        print(f"Test set: {X_test.shape[0]}")
        
        return (X_train, y_train), (X_val, y_val), (X_test, y_test)
    
    def save_preprocessed_data(self, X_scaled, y, edge_index, train_test_split=None, save_dir='../data'):
        """Save preprocessed data and splits for training"""
        os.makedirs(save_dir, exist_ok=True)
        
        np.save(f'{save_dir}/X_scaled.npy', X_scaled)
        np.save(f'{save_dir}/y.npy', y)
        np.save(f'{save_dir}/edge_index.npy', edge_index.numpy())
        
        # Save train/val/test split indices if provided
        if train_test_split is not None:
            (X_train, y_train), (X_val, y_val), (X_test, y_test) = train_test_split
            np.save(f'{save_dir}/X_train.npy', X_train)
            np.save(f'{save_dir}/y_train.npy', y_train)
            np.save(f'{save_dir}/X_val.npy', X_val)
            np.save(f'{save_dir}/y_val.npy', y_val)
            np.save(f'{save_dir}/X_test.npy', X_test)
            np.save(f'{save_dir}/y_test.npy', y_test)
        
        # Save mappings
        with open(f'{save_dir}/node_mapping.pkl', 'wb') as f:
            pickle.dump({
                'node_to_idx': self.node_to_idx,
                'idx_to_node': self.idx_to_node
            }, f)
        
        # Save scaler
        with open(f'{save_dir}/scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)
        
        print(f"Preprocessed data saved to {save_dir}")

def load_preprocessed_data(save_dir='../data'):
    """Load preprocessed data and mappings"""
    X_scaled = np.load(f'{save_dir}/X_scaled.npy')
    y = np.load(f'{save_dir}/y.npy')
    edge_index = torch.tensor(
        np.load(f'{save_dir}/edge_index.npy'),
        dtype=torch.long
    )
    
    with open(f'{save_dir}/node_mapping.pkl', 'rb') as f:
        mapping = pickle.load(f)
    
    with open(f'{save_dir}/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    return X_scaled, y, edge_index, mapping, scaler

if __name__ == "__main__":
    # Initialize loader
    loader = DeFiTransactionDataLoader()
    
    # Load and preprocess
    df = loader.load_dataset()
    X_scaled, feature_cols = loader.preprocess_features()
    y = loader.extract_labels()
    edge_index = loader.build_transaction_graph()
    
    # Split data
    train, val, test = loader.prepare_train_val_test_split(X_scaled, y)
    
    # Save
    loader.save_preprocessed_data(X_scaled, y, edge_index)