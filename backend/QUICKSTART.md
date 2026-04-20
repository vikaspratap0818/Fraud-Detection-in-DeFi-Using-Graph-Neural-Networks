# Quick Start Guide - DeFi Fraud Detection

Complete step-by-step guide to set up and use the fraud detection backend.

## Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Verify installation:**
```bash
python -c "import torch, torch_geometric; print('✓ Packages installed')"
```

---

## Step 2: Prepare Your Dataset

Your dataset file should be at: `../data/transaction_dataset.csv`

**Required Format:**
- CSV file with headers
- Column `Address`: Ethereum wallet addresses
- Column `FLAG`: Binary fraud labels (0 = legitimate, 1 = fraudulent)
- Numerical feature columns (51 features expected)

**Dataset Statistics Check:**
```bash
python -c "
import pandas as pd
df = pd.read_csv('../data/transaction_dataset.csv')
print(f'Dataset shape: {df.shape}')
print(f'Fraud cases: {(df.FLAG==1).sum()}')
print(f'Legitimate cases: {(df.FLAG==0).sum()}')
"
```

---

## Step 3: Train the Model

### Option A: Quick Training (Default Parameters)
```bash
python train.py
```

This will:
1. Load and preprocess the dataset
2. Normalize features
3. Split into train/val/test sets
4. Train a 3-layer GNN with 64 hidden dimensions
5. Save the trained model to `../models/gnn_model.pt`

### Option B: Custom Hyperparameters
```bash
python train.py \
  --epochs 200 \
  --hidden_dim 128 \
  --embedding_dim 64 \
  --num_layers 4 \
  --lr 0.0005 \
  --dropout 0.2
```

### Option C: Force Data Preprocessing
If you've updated the dataset and want to reprocess:
```bash
python train.py --preprocess
```

**Expected Output:**
```
Using device: cuda
Loading dataset from ../data/transaction_dataset.csv...
Dataset shape: (9625, 51)
Selected 51 features for training
Train set: 6737
Val set: 962
Test set: 1926

Creating model...
Model created with 150420 parameters

Starting training...
Epoch 10/100 | Train Loss: 0.4521 | Val Loss: 0.3892 | Val AUC: 0.82

================================================
TEST METRICS
================================================
AUC: 0.92
Precision: 0.89
Recall: 0.87
F1-Score: 0.88
================================================

Model saved to ../models/gnn_model.pt
```

---

## Step 4: Evaluate Model Performance

Generate visualizations and detailed metrics:

```bash
python evaluate.py
```

This creates:
- `../results/roc_curve.png` - ROC curve with AUC score
- `../results/pr_curve.png` - Precision-Recall curve
- `../results/confusion_matrix.png` - Confusion matrix heatmap
- `../results/score_distribution.png` - Prediction score distribution
- `../results/evaluation_report.txt` - Detailed metrics report

---

## Step 5: Run the API Server

Start the FastAPI server:

```bash
python main.py
```

Or with auto-reload for development:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API Documentation available at:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Step 6: Make Predictions

### Option A: Check Single Address

Using Python inference script:
```bash
python inference.py --address "0x00009277775ac7d0d59eaad8fee3d10ac6c805e8"
```

Output:
```
Address: 0x00009277775ac7d0d59eaad8fee3d10ac6c805e8
Fraud Risk Score: 0.2312
Legitimate Score: 0.7688
Risk Label: LOW
Confidence: 0.7688
```

### Option B: Batch Process Multiple Addresses

Create file `addresses.txt`:
```
0x00009277775ac7d0d59eaad8fee3d10ac6c805e8
0x0002b44ddb1476db43c868bd494422ee4c136fed
0x0002bda54cb772d040f779e88eb453cac0daa244
```

Then process:
```bash
python inference.py --addresses_file addresses.txt
```

### Option C: API Call (Python)

```python
import requests

response = requests.post('http://localhost:8000/risk', json={
    'address': '0x00009277775ac7d0d59eaad8fee3d10ac6c805e8',
    'top_k': 5
})

result = response.json()
print(f"Risk Score: {result['fraud_risk_score']:.4f}")
print(f"Risk Label: {result['fraud_risk_label'].upper()}")
print(f"Connected Wallets: {result['connected_wallets']}")
```

### Option D: cURL Request

```bash
curl -X POST "http://localhost:8000/risk" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x00009277775ac7d0d59eaad8fee3d10ac6c805e8",
    "top_k": 5
  }'
```

---

## API Endpoints Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check API status |
| POST | `/risk` | Single wallet risk assessment |
| POST | `/batch-risk` | Multiple wallet assessment |
| POST | `/train` | Start model training |
| GET | `/stats` | Dataset statistics |
| GET | `/embeddings/{address}` | Get node embeddings |

---

## Common Tasks

### Task 1: Retrain Model with Updated Data

```bash
# Update the dataset at ../data/transaction_dataset.csv

# Option 1: Using training script
python train.py --epochs 150 --preprocess

# Option 2: Using API
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "epochs": 150,
    "hidden_dim": 64,
    "learning_rate": 0.001
  }'
```

### Task 2: Monitor High-Risk Addresses

```python
import requests

high_risk_addresses = []

# Get dataset statistics
stats = requests.get('http://localhost:8000/stats').json()

# Check a sample of addresses
for i in range(100):
    address = f"0x0000{i:08d}..."  # Your addresses
    response = requests.post('http://localhost:8000/risk', 
                            json={'address': address})
    
    if response.status_code == 200:
        result = response.json()
        if result['fraud_risk_score'] > 0.7:
            high_risk_addresses.append(result)
```

### Task 3: Extract Embeddings for Visualization

```python
import requests
import json

# Get embeddings for an address
response = requests.get(
    'http://localhost:8000/embeddings/0x00009277775ac7d0d59eaad8fee3d10ac6c805e8'
)

embedding = response.json()['embedding']

# Use for visualization/clustering
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
reduced = pca.fit_transform([embedding])
plt.scatter(reduced[:, 0], reduced[:, 1])
plt.show()
```

---

## Troubleshooting

### Issue: "Address not found in training data"

**Solution:** The address must be in your training dataset.

```bash
# Check if address exists
grep "0xYOUR_ADDRESS" ../data/transaction_dataset.csv

# If not, the address needs to be added to dataset
```

### Issue: "CUDA out of memory"

**Solution:** Reduce model size for inference

```bash
# During training, use smaller model
python train.py --hidden_dim 32 --embedding_dim 16 --num_layers 2

# Or reduce batch processing
```

### Issue: "Model loaded but poor performance"

**Solution:** Retrain with better hyperparameters

```bash
# Check current metrics
python evaluate.py

# If AUC < 0.85, retrain with:
python train.py --epochs 200 --hidden_dim 128 --num_layers 4 --lr 0.0005
```

### Issue: "Preprocessed data not found"

**Solution:** Run preprocessing explicitly

```bash
python train.py --preprocess
```

---

## Performance Tips

### For Production Deployment

1. **Use GPU**
   - NVIDIA CUDA 11.8+
   - `torch.cuda.is_available()` returns True

2. **Batch Processing**
   ```bash
   # Process 1000 addresses efficiently
   python inference.py --addresses_file addresses_1000.txt
   ```

3. **API Caching**
   - Cache embeddings for frequently checked addresses
   - Cache risk scores for recent assessments

4. **Model Optimization**
   ```python
   # Use quantization for inference
   import torch.quantization
   model_int8 = torch.quantization.quantize_dynamic(
       model, {torch.nn.Linear}, dtype=torch.qint8
   )
   ```

### For Better Accuracy

1. **More Training Data**: Increases generalization
2. **Class Balancing**: Handle imbalanced fraud/legitimate ratio
3. **Feature Engineering**: Add domain-specific features
4. **Ensemble Methods**: Combine multiple models

---

## Integration with Frontend

### Example: React Component

```javascript
async function checkFraudRisk(address) {
  const response = await fetch('http://localhost:8000/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: address,
      top_k: 5
    })
  });
  
  return response.json();
}

// Usage
const result = await checkFraudRisk('0x...');
console.log(`Risk: ${result.fraud_risk_score}`);
console.log(`Label: ${result.fraud_risk_label}`);
```

---

## File Structure Summary

```
SGU 2.0/
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── model.py                   # GNN model
│   ├── data_loader.py             # Data preprocessing
│   ├── train.py                   # Training script
│   ├── inference.py               # Inference script
│   ├── evaluate.py                # Evaluation script
│   ├── config.ini                 # Configuration
│   ├── requirements.txt           # Dependencies
│   └── README.md                  # Full documentation
├── models/
│   └── gnn_model.pt               # Trained weights
├── data/
│   ├── transaction_dataset.csv    # Input data
│   └── (preprocessed files)       # Cached data
└── results/
    ├── roc_curve.png
    ├── pr_curve.png
    ├── confusion_matrix.png
    └── score_distribution.png
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Prepare dataset
3. ✅ Train model
4. ✅ Evaluate performance
5. ✅ Run API server
6. 🔄 **Integrate with frontend**
7. 🔄 **Deploy to production**
8. 🔄 **Monitor predictions**

For detailed API documentation, check `/backend/README.md`
