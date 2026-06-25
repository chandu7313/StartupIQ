"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id: string;
}

export function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgStr, setSvgStr] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif',
        });
        
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        
        if (isMounted) {
          setSvgStr(svg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    };

    if (chart && id) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[300px] flex items-center justify-center overflow-auto rounded-lg bg-[#141517] p-4"
      dangerouslySetInnerHTML={{ __html: svgStr || 'Loading diagram...' }}
    />
  );
}
