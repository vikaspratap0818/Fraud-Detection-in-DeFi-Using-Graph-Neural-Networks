'use client';

import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface Node {
  id: string;
  risk: number;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface GraphVisualizationProps {
  data: GraphData;
}

export default function GraphVisualization({ data }: GraphVisualizationProps) {
  return (
    <div className="w-full h-96">
      <ForceGraph2D
        graphData={data}
        nodeColor={(node: any) => node.risk === 1 ? 'red' : 'green'}
        nodeLabel={(node: any) => `Wallet: ${node.id}, Risk: ${node.risk}`}
      />
    </div>
  );
}
