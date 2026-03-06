import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming" | "error";
  date?: string;
}

interface StatusTrackerProps {
  steps: Step[];
  className?: string;
}

export function StatusTracker({ steps, className }: StatusTrackerProps) {
  return (
    <TooltipProvider>
      <div className={cn("w-full", className)}>
        <div className="relative flex items-center justify-between w-full">
          {/* Connecting Line */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-10" />
          
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isFirst = index === 0;

            return (
              <div key={step.id} className="flex flex-col items-center relative group">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-200 cursor-default",
                        step.status === "completed" && "border-emerald-500 bg-emerald-500 text-white",
                        step.status === "current" && "border-blue-500 text-blue-500",
                        step.status === "upcoming" && "border-slate-300 text-slate-300",
                        step.status === "error" && "border-red-500 bg-red-500 text-white"
                      )}
                    >
                      {step.status === "completed" ? (
                        <Check className="w-4 h-4" />
                      ) : step.status === "error" ? (
                        <span className="text-xs font-bold">!</span>
                      ) : step.status === "current" ? (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-slate-400 capitalize">{step.status}</p>
                    {step.date && <p className="text-xs text-slate-400">{step.date}</p>}
                  </TooltipContent>
                </Tooltip>
                
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    step.status === "completed" && "text-emerald-600",
                    step.status === "current" && "text-blue-600",
                    step.status === "upcoming" && "text-slate-500",
                    step.status === "error" && "text-red-600"
                  )}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.date}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
