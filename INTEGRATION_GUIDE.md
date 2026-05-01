# Backend-Frontend Integration Guide

## Strict Integration Architecture

This document outlines the complete backend-frontend integration for the Fraud Detection Dashboard with proper data validation, error handling, and visualization.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                    http://localhost:3000                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────────┐
        │            │            │                │
    ┌───▼──┐    ┌───▼──┐    ┌───▼──┐      ┌─────▼──┐
    │/api/ │    │/api/ │    │/api/ │      │/api/   │
    │fraud-│    │graph-│    │risk  │      │validate│
    │stats │    │data  │    │      │      │-data   │
    └───┬──┘    └───┬──┘    └───┬──┘      └─────┬──┘
        │           │            │              │
        └───────────┼────────────┼──────────────┘
                    │
        ┌───────────▼────────────────────────┐
        │  Backend (FastAPI)                 │
        │  http://localhost:8000             │
        └───────────┬────────────────────────┘
                    │
        ┌───────────┼──────────────────────┐
        │           │                      │
    ┌───▼──┐   ┌───▼──┐           ┌──────▼──┐
    │/fraud-│   │/graph│           │/validate│
    │stats  │   │-data │           │-data    │
    └───┬──┘   └───┬──┘           └──────┬──┘
        │          │                     │
        └──────┬───┴─────────────────────┘
               │
        ┌──────▼──────────────┐
        │ Data & Model Layer  │
        │ (GNN Processing)    │
        └─────────────────────┘
```

## API Endpoints

### 1. Fraud Statistics Endpoint

**Backend**: `GET /fraud-stats`
```bash
curl http://localhost:8000/fraud-stats
```

**Response**:
```json
{
  "labels": ["Non-Fraudulent", "Fraudulent"],
  "data": [8000, 2000],
  "percentages": [80.0, 20.0],
  "total": 10000,
  "fraud_rate": 20.0,
  "subgraph": {
    "nodes": [...],
    "links": []
  }
}
```

**Frontend Proxy**: `GET /api/fraud-stats`
- Proxies to backend fraud stats endpoint
- Used by: `FraudStatsChart` component
- Strict validation: Ensures labels, data, percentages arrays match

### 2. Graph Data Endpoint

**Backend**: `GET /graph-data?limit=100`
```bash
curl "http://localhost:8000/graph-data?limit=100"
```

**Response**:
```json
{
  "nodes": [
    {
      "id": "addr_0",
      "label": "0x0000...",
      "address": "0x000...",
      "fraud_probability": 0.87,
      "is_fraud": 1,
      "risk": 1,
      "val": 18.05,
      "color": "#ff6b6b"
    }
  ],
  "links": [
    {
      "source": "addr_0",
      "target": "addr_1"
    }
  ],
  "metadata": {
    "total_nodes": 10000,
    "visualized_nodes": 100,
    "total_edges": 245,
    "fraud_nodes": 23,
    "legitimate_nodes": 77
  }
}
```

**Frontend Proxy**: `GET /api/graph-data?limit=100`
- Query Parameters:
  - `limit`: Number of nodes to return (default: 100)
- Strict Validation:
  - Validates nodes array exists and has proper structure
  - Validates links array exists
  - Checks all required node properties

### 3. Data Validation Endpoint

**Backend**: `GET /validate-data`
```bash
curl http://localhost:8000/validate-data
```

**Response**:
```json
{
  "status": "ok|warning|error",
  "errors": [],
  "warnings": [],
  "data_integrity": {
    "X_scaled_shape": [10000, 48],
    "y_shape": [10000],
    "edge_index_shape": [2, 15000],
    "num_nodes_mapped": 10000
  },
  "model_info": {
    "num_parameters": 125000,
    "device": "cuda"
  }
}
```

**Use Cases**:
- Health check before rendering visualizations
- Debugging data loading issues
- Verifying data integrity after preprocessing

## Frontend Components Integration

### FraudStatsChart Component
```typescript
// Displays fraud statistics with pie/bar charts
interface FraudStatsProps {
  data: {
    labels: string[];
    data: number[];
    percentages: number[];
    total: number;
  }
}
```

### GraphVisualizer Component
```typescript
// Displays network graph using react-force-graph-2d
interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    fraud_probability: number;
    is_fraud: number;
    val: number;
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}
```

## Dashboard Data Flow

### 1. Initial Load

```javascript
// dashboard/page.tsx useEffect on mount
1. Status check (authenticated)
2. Fetch fraud-stats via /api/fraud-stats
   - Display in FraudStatsChart
   - Error handling if fails
3. Fetch graph-data via /api/graph-data?limit=100
   - Display in GraphVisualizer
   - Error handling if fails
4. Both requests run in parallel with Promise.all
5. Loading states managed separately
```

### 2. Error Recovery

```
Fraud Stats Fail:
  ├─ Show error card
  ├─ Log error to console
  └─ Block chart display

Graph Data Fail:
  ├─ Show warning but continue
  ├─ Log error to console
  └─ Attempt reload on user action
```

### 3. Strict Data Validation

All API responses validated:
```javascript
// Frontend validation (route.ts)
if (!data.nodes || !Array.isArray(data.nodes)) {
  throw new Error('Invalid nodes data structure');
}
if (!data.links || !Array.isArray(data.links)) {
  throw new Error('Invalid links data structure');
}
```

## Backend Data Processing Pipeline

### 1. Data Loading with Auto-Preprocessing

```python
def load_model_and_data():
    # Auto-preprocess if files missing
    if not os.path.exists(f'{data_dir}/X_scaled.npy'):
        loader = DeFiTransactionDataLoader()
        df = loader.load_dataset()
        X_scaled, features = loader.preprocess_features()
        y = loader.extract_labels()
        edge_index = loader.build_transaction_graph()
        loader.save_preprocessed_data(X_scaled, y, edge_index)
    
    # Load preprocessed data
    X_scaled, y, edge_index, node_mapping, scaler = load_preprocessed_data(data_dir)
    
    # Create model
    model = create_model(...)
    
    # Load trained weights
    checkpoint = torch.load('../models/gnn_model.pt')
    model.load_state_dict(checkpoint['model_state'])
    
    return True
```

### 2. Fraud Statistics Computation

```python
@app.get("/fraud-stats")
async def get_fraud_statistics():
    fraud_count = int(np.sum(y == 1))
    legitimate_count = int(np.sum(y == 0))
    total_count = len(y)
    fraud_percentage = float(fraud_count / max(1, total_count) * 100)
    
    return {
        "labels": ["Non-Fraudulent", "Fraudulent"],
        "data": [legitimate_count, fraud_count],
        "percentages": [100 - fraud_percentage, fraud_percentage],
        "total": total_count,
        "fraud_rate": fraud_percentage
    }
```

### 3. Graph Data Generation

```python
@app.get("/graph-data")
async def get_graph_data(limit: int = 100):
    # Get model predictions
    with torch.no_grad():
        logits = model(x, edge_idx)
        probs = torch.softmax(logits, dim=1)
        fraud_probs = probs[:, 1].cpu().numpy()
    
    # Create nodes with strict validation
    nodes = []
    for idx in range(sample_size):
        fraud_prob = float(fraud_probs[idx])
        # Strict bounds checking
        if not (0 <= fraud_prob <= 1):
            fraud_prob = max(0, min(1, fraud_prob))
        
        node = {
            "id": f"addr_{idx}",
            "fraud_probability": fraud_prob,
            "is_fraud": int(y[idx]),
            "color": "#ff6b6b" if y[idx] else "#00ffb4"
        }
        nodes.append(node)
    
    # Build edges
    links = []
    for src, dst in edge_connections:
        if src in sample and dst in sample:
            links.append({"source": ..., "target": ...})
    
    return {"nodes": nodes, "links": links, "metadata": {...}}
```

## Integration Testing Checklist

- [ ] Backend starts without errors
- [ ] `/health` endpoint returns status ok
- [ ] `/validate-data` returns valid structure
- [ ] `/fraud-stats` returns correct totals
- [ ] `/graph-data?limit=50` returns 50 or fewer nodes
- [ ] Frontend can fetch `/api/fraud-stats`
- [ ] Frontend can fetch `/api/graph-data`
- [ ] FraudStatsChart renders with data
- [ ] GraphVisualizer renders with network
- [ ] Zoom buttons work in graph
- [ ] Error handling displays properly
- [ ] Loading states appear correctly
- [ ] No console errors in browser
- [ ] Dashboard responsive on mobile view

## Troubleshooting Guide

### Issue: 502 Bad Gateway

**Solution**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Check environment variable: `echo $NEXT_PUBLIC_BACKEND_URL`
3. Check CORS settings in backend main.py
4. Check network availability between containers

### Issue: "Model not loaded"

**Solution**:
1. Check `models/gnn_model.pt` exists
2. Run `/validate-data` to check data state
3. Check backend logs for preprocessing errors
4. Verify dataset file at `data/transaction_dataset.csv`

### Issue: Graph shows no edges

**Solution**:
1. Check edge_index is built correctly in data_loader
2. Verify limit parameter is not too small
3. Check that nodes actually have connections
4. Run `/graph-data?limit=1000` to test with more nodes

### Issue: Charts not updating

**Solution**:
1. Check browser Network tab for API calls
2. Verify response structure matches expected schema
3. Check for validation errors in API responses
4. Clear browser cache and reload

## Performance Metrics

- Graph rendering: < 2 seconds for 100 nodes
- Fraud stats fetch: < 500ms
- Complete dashboard load: < 3 seconds
- Network graph interaction: 60 FPS

## Security Considerations

1. **Input Validation**: All query parameters validated
2. **Error Messages**: Never expose system paths in errors
3. **Rate Limiting**: Consider adding for production
4. **Authentication**: Check session before serving data
5. **CORS**: Whitelist specific origins in production

## Future Enhancements

- [ ] Real-time data updates with WebSockets
- [ ] Data export functionality (CSV, JSON)
- [ ] Advanced graph filtering and search
- [ ] Custom model retraining via API
- [ ] Batch risk assessment for multiple addresses
- [ ] Historical data tracking and trends
