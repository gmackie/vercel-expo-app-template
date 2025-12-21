import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vercel App</Text>
      <Text style={styles.subtitle}>Expo + tRPC</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <HomeScreen />
      </TRPCProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
