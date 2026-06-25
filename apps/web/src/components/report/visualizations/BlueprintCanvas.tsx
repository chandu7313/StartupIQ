"use client";

import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface BlueprintCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export function BlueprintCanvas({ nodes: initialNodes, edges: initialEdges }: BlueprintCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update state if props change (e.g., streaming)
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] bg-[#141517] rounded-xl border border-[#2a2b2f] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
        attributionPosition="bottom-right"
      >
        <Controls className="bg-[#1e1f24] border-[#2a2b2f] fill-white" />
        <MiniMap 
          nodeColor={(n) => {
            return (n.style?.backgroundColor as string) || '#3b82f6';
          }}
          maskColor="rgba(0,0,0,0.5)"
          className="bg-[#141517] border-[#2a2b2f]"
        />
        <Background color="#3f3f46" gap={16} />
      </ReactFlow>
    </div>
  );
}
