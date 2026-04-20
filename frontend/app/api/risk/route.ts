import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { wallet } = await request.json();

  try {
    // Call Python API
    const response = await fetch('http://localhost:8000/risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn('Python backend unreachable. Falling back to mock data.', error);
    
    // Fallback Mock Graph Data for demonstration purposes
    const mockGraphData = {
      nodes: [
        { id: '0x1a2...3c4d', group: 1, risk: 1 },
        { id: '0x5e6...7f8g', group: 1, risk: 1 },
        { id: '0x9h0...1i2j', group: 2, risk: 0 },
        { id: '0x3k4...5l6m', group: 2, risk: 0 },
        { id: '0x7n8...9o0p', group: 3, risk: 0 },
        { id: '0x1q2...3r4s', group: 1, risk: 1 },
        { id: 'Central Exchange', group: 4, risk: 0 }
      ],
      links: [
        { source: '0x1a2...3c4d', target: '0x5e6...7f8g', value: 1 },
        { source: '0x1a2...3c4d', target: '0x9h0...1i2j', value: 1 },
        { source: '0x5e6...7f8g', target: '0x3k4...5l6m', value: 1 },
        { source: '0x3k4...5l6m', target: '0x7n8...9o0p', value: 1 },
        { source: '0x5e6...7f8g', target: '0x1q2...3r4s', value: 1 },
        { source: '0x1q2...3r4s', target: '0x1a2...3c4d', value: 1 }, // cycle
        { source: '0x7n8...9o0p', target: 'Central Exchange', value: 2 },
        { source: '0x9h0...1i2j', target: 'Central Exchange', value: 1 }
      ]
    };

    return NextResponse.json({ subgraph: mockGraphData }, { status: 200 });
  }
}