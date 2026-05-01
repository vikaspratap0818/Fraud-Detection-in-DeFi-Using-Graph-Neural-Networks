# Fraud Detection System - Setup & Running Guide

## Overview
This application consists of:
- **Frontend**: Next.js React application (port 3000)
- **Backend**: FastAPI Python application (port 8000)  
- **Database**: MongoDB for user authentication
- **ML Model**: Graph Neural Network (GNN) for fraud detection

## Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud instance)

## Quick Start

### 1. Backend Setup

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Start the Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will:
- Automatically preprocess the dataset on first run (loads `data/transaction_dataset.csv`)
- Load the GNN model from `models/gnn_model.pt`
- Start the API server at `http://localhost:8000`

You should see output like:
```
Using device: cuda (or cpu)
Uvicorn running on http://0.0.0.0:8000
```

### 2. Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Configure Environment
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Step 3: Start the Development Server
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

## Accessing the Application

1. Open your browser to `http://localhost:3000`
2. Sign up or login with your Google account
3. Navigate to the Dashboard
4. You should see the **Fraud Detection Statistics** chart displaying:
   - Non-Fraudulent records (green)
   - Fraudulent records (red)
   - Distribution in both Pie and Bar chart formats

## API Endpoints

### Backend Endpoints (FastAPI):
- `GET /health` - Health check
- `GET /stats` - Dataset statistics
- `GET /fraud-stats` - Fraud statistics (returns JSON for visualization)
- `POST /risk` - Assess fraud risk for a wallet address
- `POST /train` - Start GNN model training

### Frontend API Routes (Next.js):
- `GET /api/fraud-stats` - Proxies to backend fraud statistics
- `POST /api/risk` - Proxies wallet risk assessment

## Troubleshooting

### 502 Error: Backend Connection Failed
**Solution**: Ensure:
1. Backend server is running on port 8000
2. Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local` is correct
3. Verify CORS is enabled (should be automatic)

### Spinner Shows But No Data Loads
**Solution**: 
1. Check backend console for errors running `load_model_and_data()`
2. Verify dataset file exists at `data/transaction_dataset.csv`
3. Check Python dependencies are installed

### Model Loading Errors
**Solution**:
1. Backend automatically preprocesses data on first run
2. If still failing, check `models/gnn_model.pt` exists
3. Verify CUDA/PyTorch installation if using GPU

## Data Flow

```
Transaction Dataset (CSV)
    ↓
Data Preprocessing (Normalization, Feature Selection)
    ↓
Graph Construction (Node Mapping, Edge Building)
    ↓
GNN Model Inference
    ↓
Fraud Risk Scores (0-1)
    ↓
Frontend Visualization (Charts, Statistics)
```

## Production Deployment

For production:
1. Set `NEXT_PUBLIC_BACKEND_URL` to your production backend URL
2. Update `NEXTAUTH_URL` to your frontend domain
3. Update CORS origins in backend `main.py`
4. Use environment variables for sensitive data (API keys, secrets)
5. Deploy frontend to Vercel or similar
6. Deploy backend to AWS, GCP, Azure, or similar

## Statistics Displayed

The dashboard shows:
- **Total Records**: Count of all addresses in dataset
- **Legitimate Records**: Non-fraudulent addresses (FLAG=0)
- **Fraudulent Records**: Suspicious addresses (FLAG=1)
- **Fraud Rate**: Percentage of fraudulent addresses
- **Pie Chart**: Visual distribution
- **Bar Chart**: Comparison view

## Model Information

- **Input Features**: 48+ blockchain transaction features
- **Model Type**: Graph Neural Network (GNN)
- **Training Framework**: PyTorch Geometric
- **Output**: Fraud probability (0-1) per address

---

**Last Updated**: May 2026
