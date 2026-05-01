export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '100';
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/graph-data?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Backend error! status: ${response.status}`);
      return Response.json(
        { error: `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Strict validation of graph data
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid nodes data structure');
    }
    if (!data.links || !Array.isArray(data.links)) {
      throw new Error('Invalid links data structure');
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return Response.json(
      { error: 'Failed to fetch graph data from backend', details: String(error) },
      { status: 502 }
    );
  }
}
