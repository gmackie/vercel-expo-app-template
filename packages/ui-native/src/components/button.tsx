import * as React from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type TextProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-blue-600 active:bg-blue-700",
        destructive: "bg-red-600 active:bg-red-700",
        outline: "border border-gray-300 bg-transparent active:bg-gray-100",
        secondary: "bg-gray-200 active:bg-gray-300",
        ghost: "bg-transparent active:bg-gray-100",
        link: "bg-transparent",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-gray-900",
      secondary: "text-gray-900",
      ghost: "text-gray-900",
      link: "text-blue-600 underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

export interface ButtonTextProps
  extends TextProps,
    VariantProps<typeof buttonTextVariants> {
  className?: string;
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, disabled, ...props }, ref) => {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50",
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});
Button.displayName = "Button";

const ButtonText = React.forwardRef<
  React.ElementRef<typeof Text>,
  ButtonTextProps
>(({ className, variant, ...props }, ref) => {
  return (
    <Text
      className={cn(buttonTextVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});
ButtonText.displayName = "ButtonText";

export { Button, ButtonText, buttonVariants, buttonTextVariants };
