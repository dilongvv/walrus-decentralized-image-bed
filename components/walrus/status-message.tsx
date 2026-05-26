"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusMessage({
  type,
  message
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 text-sm",
        type === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive-foreground"
          : "border-primary/40 bg-primary/10 text-foreground"
      )}
    >
      {type === "error" ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      )}
      <span>{message}</span>
    </div>
  );
}
