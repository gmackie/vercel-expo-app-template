import React from "react";
import { ScrollView, View } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-native";


export function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="mb-4">
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>Overview of your metrics</CardDescription>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-4xl">$45,231.89</CardTitle>
            <CardDescription className="text-green-600">+20.1% from last month</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Current online users</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-4xl">+2350</CardTitle>
            <CardDescription className="text-green-600">+180.1% from last month</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>Items sold today</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-4xl">+12,234</CardTitle>
            <CardDescription className="text-green-600">+19% from last month</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Now</CardTitle>
            <CardDescription>Real-time usage</CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-4xl">+573</CardTitle>
            <CardDescription className="text-green-600">+201 since last hour</CardDescription>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
