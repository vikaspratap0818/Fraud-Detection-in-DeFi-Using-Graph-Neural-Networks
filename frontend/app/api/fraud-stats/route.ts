export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/fraud-stats`, {
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
    return Response.json(data);
  } catch (error) {
    console.error('Failed to fetch fraud stats:', error);
    return Response.json(
      { error: 'Failed to fetch fraud statistics from backend' },
      { status: 502 }
    );
  }
}
