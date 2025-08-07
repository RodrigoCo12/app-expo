import { Stack, useRouter, useSegments, Redirect } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const { checkAuth, user, token } = useAuthStore();

  // Estado para controlar la redirección
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    checkAuth().finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!user && !!token;

    if (!isSignedIn && !inAuthScreen) {
      setShouldRedirect("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      setShouldRedirect("/(tabs)");
    }
  }, [user, token, segments, isReady]);

  if (!isReady) {
    return <Loader />;
  }

  if (shouldRedirect) {
    return <Redirect href={shouldRedirect} />;
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
