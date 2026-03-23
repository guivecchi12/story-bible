"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Props {
  isOverridden?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TimelineField({ isOverridden, children, className }: Props) {
  if (!isOverridden) return <>{children}</>;
  return (
    <div className={cn("relative border-l-2 border-primary pl-3", className)}>
      <span className="absolute -top-0.5 left-2 text-[10px] text-primary font-medium flex items-center gap-0.5">
        <Clock className="h-2.5 w-2.5" /> Timeline Override
      </span>
      <div className="pt-3">{children}</div>
    </div>
  );
}
