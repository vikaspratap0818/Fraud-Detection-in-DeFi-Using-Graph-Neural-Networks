import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Safely parse JSON
    const { wallet } = await request.json();
    
    // Validate wallet input
    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet parameter' }, { status: 400 });
    }
    
    if (wallet.trim().length === 0) {
      return NextResponse.json({ error: 'Wallet address cannot be empty' }, { status: 400 });
    }
  } catch (error) {
    console.error('JSON parse error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { wallet } = await request.json();
  
  // Get backend URL from environment, fallback to localhost
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  // Create abort controller for request timeout (5 seconds)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // Call Python API with timeout
    const response = await fetch(`${backendUrl}/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: wallet }),  // Backend expects 'address', not 'wallet'
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: 'Backend error', status: response.status }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeout);
    console.error('Backend request failed:', error);
    
    // Log for monitoring
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timeout to backend');
    }
    
    // Return 502 (Bad Gateway) for backend errors, rather than 200 with mock data
    return NextResponse.json(
      { error: 'Backend service unavailable', fallback: true },
      { status: 502 }
    );
  }
}