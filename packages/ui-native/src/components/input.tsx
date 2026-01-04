import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";

import { cn } from "../lib/utils";

export interface InputProps extends TextInputProps {
  className?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, editable = true, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        editable={editable}
        className={cn(
          "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400",
          !editable && "opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
