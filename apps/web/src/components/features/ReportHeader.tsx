"use client";

import * as React from "react";
import { Download, Share2 } from "lucide-react";
import { IdeaStrengthBadge, type IdeaStrength } from "@startupiq/ui";
import { toast } from "sonner";

export interface ReportHeaderProps {
  name: string;
  industry: string;
  date: string;
  strength: IdeaStrength;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ name, industry, date, strength }) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Report link copied to clipboard!");
  };

  const handleDownload = () => {
    toast.info("Generating PDF... this might take a moment.");
    // PDF generation logic would go here
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{name}</h1>
          <IdeaStrengthBadge strength={strength} />
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <span className="font-medium text-foreground">{industry}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          Analyzed on {new Date(date).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
};
