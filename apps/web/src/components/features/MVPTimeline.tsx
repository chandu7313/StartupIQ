"use client";

import * as React from "react";
import { cn } from "@ventureforge/ui";

export interface Phase {
  title: string;
  duration: string;
  tasks: string[];
}

export interface MVPTimelineProps {
  phases: Phase[];
}

export const MVPTimeline: React.FC<MVPTimelineProps> = ({ phases }) => {
  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-2 space-y-8">
      {phases.map((phase, idx) => (
        <div key={phase.title} className="relative pl-8">
          <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-600 bg-background dark:border-indigo-500" />
          
          <div className="mb-1 flex items-center gap-3">
            <h4 className="text-lg font-bold text-foreground">Phase {idx + 1}: {phase.title}</h4>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {phase.duration}
            </span>
          </div>
          
          <ul className="mt-3 space-y-2">
            {phase.tasks.map((task, taskIdx) => (
              <li key={taskIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
