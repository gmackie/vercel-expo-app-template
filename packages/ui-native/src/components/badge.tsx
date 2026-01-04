import * as React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "flex-row items-center rounded-md px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-blue-600",
        secondary: "bg-gray-200",
        destructive: "bg-red-600",
        outline: "border border-gray-300 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-gray-900",
      destructive: "text-white",
      outline: "text-gray-900",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  className?: string;
}

export interface BadgeTextProps
  extends TextProps,
    VariantProps<typeof badgeTextVariants> {
  className?: string;
}

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

const BadgeText = React.forwardRef<
  React.ElementRef<typeof Text>,
  BadgeTextProps
>(({ className, variant, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn(badgeTextVariants({ variant }), className)}
      {...props}
    />
  );
});
BadgeText.displayName = "BadgeText";

export { Badge, BadgeText, badgeVariants, badgeTextVariants };
