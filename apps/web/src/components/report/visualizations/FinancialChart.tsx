"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface FinancialChartProps {
  option: any;
  height?: string | number;
}

export function FinancialChart({ option, height = 400 }: FinancialChartProps) {
  return (
    <div className="w-full rounded-xl bg-[#141517] p-4 border border-[#2a2b2f]">
      <ReactECharts 
        option={option} 
        style={{ height, width: '100%' }}
        theme="dark"
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
