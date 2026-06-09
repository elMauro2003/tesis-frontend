import { ComponentProps } from "react";
import { cn } from "@/utils/helpers/shadcn/index";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-container-high", className)}
      {...props}
    />
  );
}

export { Skeleton };
