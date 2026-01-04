import React from "react";
import { View, Text } from "react-native";
import {
  Avatar,
  AvatarFallback,
  AvatarFallbackText,
  AvatarImage,
  Button,
  ButtonText,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui-native";


export function SettingsScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="gap-6">
        <View>
          <CardTitle className="text-3xl">Settings</CardTitle>
          <CardDescription>Manage your profile and preferences</CardDescription>
        </View>

        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>
                <AvatarFallbackText>CN</AvatarFallbackText>
              </AvatarFallback>
            </Avatar>
            <View>
              <CardTitle>Jane Doe</CardTitle>
              <CardDescription>jane@example.com</CardDescription>
            </View>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="gap-4 pt-6">
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Display Name</Text>
              <Input placeholder="Enter your name" defaultValue="Jane Doe" />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Email Address</Text>
              <Input placeholder="Enter your email" defaultValue="jane@example.com" keyboardType="email-address" />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Bio</Text>
              <Input placeholder="Tell us about yourself" multiline numberOfLines={3} className="h-24 py-2" />
            </View>
            
            <Button className="mt-2">
              <ButtonText>Save Changes</ButtonText>
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full justify-start">
                    <ButtonText variant="outline">Notifications</ButtonText>
                </Button>
                <View className="h-4" />
                <Button variant="outline" className="w-full justify-start">
                    <ButtonText variant="outline">Privacy</ButtonText>
                </Button>
            </CardContent>
        </Card>

        <Button variant="destructive" className="mt-4">
            <ButtonText>Sign Out</ButtonText>
        </Button>
      </View>
    </View>
  );
}
