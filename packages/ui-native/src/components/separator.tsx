import * as React from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "../lib/utils";

export interface SeparatorProps extends ViewProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<
  React.ElementRef<typeof View>,
  SeparatorProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "bg-gray-200",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
