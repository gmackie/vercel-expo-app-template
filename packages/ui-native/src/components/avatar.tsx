import * as React from "react";
import { View, Image, Text, type ViewProps, type ImageProps, type TextProps } from "react-native";

import { cn } from "../lib/utils";

export interface AvatarProps extends ViewProps {
  className?: string;
}

export interface AvatarImageProps extends Omit<ImageProps, "source"> {
  className?: string;
  src?: string;
}

export interface AvatarFallbackProps extends ViewProps {
  className?: string;
}

export interface AvatarFallbackTextProps extends TextProps {
  className?: string;
}

const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "relative h-10 w-10 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Image>,
  AvatarImageProps
>(({ className, src, ...props }, ref) => {
  if (!src) return null;
  
  return (
    <Image
      ref={ref}
      source={{ uri: src }}
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof View>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-200",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

const AvatarFallbackText = React.forwardRef<
  React.ElementRef<typeof Text>,
  AvatarFallbackTextProps
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-sm font-medium text-gray-600", className)}
    {...props}
  />
));
AvatarFallbackText.displayName = "AvatarFallbackText";

export { Avatar, AvatarImage, AvatarFallback, AvatarFallbackText };
