// import { Stack, useRouter, useSegments, Redirect } from "expo-router";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import SafeScreen from "../components/SafeScreen";
// import { StatusBar } from "expo-status-bar";
// import { useAuthStore } from "../store/authStore";
// import { useEffect, useState } from "react";
// import Loader from "../components/Loader";
// import COLORS from "@/constants/colors";

// export default function RootLayout() {
//   const router = useRouter();
//   const segments = useSegments();
//   const [isReady, setIsReady] = useState(false);
//   // const [inhome, setInhome] = useState(false);
//   const { checkAuth, user, token } = useAuthStore();

//   // Estado para controlar la redirección
//   const [shouldRedirect, setShouldRedirect] = useState(null);
//   console.log(user.admin);
//   console.log(shouldRedirect);
//   useEffect(() => {
//     checkAuth().finally(() => setIsReady(true));
//   }, []);

//   useEffect(() => {
//     if (!isReady) return;
//     const inAuthScreen = segments[0] === "(auth)";
//     const isSignedIn = !!user && !!token;
//     if (!isSignedIn && !inAuthScreen) {
//       setShouldRedirect("/(auth)");
//     } else if (isSignedIn && inAuthScreen) {
//       setShouldRedirect("/(tabs)");
//     }
//   }, [user, token, segments, isReady]);

//   if (!isReady) {
//     return <Loader />;
//   }

//   if (shouldRedirect) {
//     return <Redirect href={shouldRedirect} />;
//   }

//   return (
//     <SafeAreaProvider>
//       <SafeScreen
//         ceb={token ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.background }}
//       >
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="(tabs)" />
//           <Stack.Screen name="(admin)" />
//           <Stack.Screen name="(auth)" />
//         </Stack>
//       </SafeScreen>
//       <StatusBar style="light" />
//     </SafeAreaProvider>
//   );
// }
import { Stack, useRouter, useSegments, Redirect } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import COLORS from "@/constants/colors";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const { checkAuth, user, token } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    checkAuth().finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthScreen = segments[0] === "(auth)";
    const inAdminScreen = segments[0] === "(admin)";
    const inTabsScreen = segments[0] === "(tabs)";
    const isSignedIn = !!user && !!token;
    const isAdmin = user?.admin === "valido";

    if (!isSignedIn && !inAuthScreen) {
      // Usuario no autenticado, redirigir a auth
      setShouldRedirect("/(auth)");
    } else if (isSignedIn) {
      if (inAuthScreen) {
        // Usuario autenticado pero en auth, redirigir según rol
        setShouldRedirect(isAdmin ? "/(admin)" : "/(tabs)");
      } else if (isAdmin && !inAdminScreen) {
        // Usuario es admin pero no está en admin, redirigir a admin
        setShouldRedirect("/(admin)");
      } else if (!isAdmin && !inTabsScreen) {
        // Usuario no es admin pero no está en tabs, redirigir a tabs
        setShouldRedirect("/(tabs)");
      }
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
      <SafeScreen
        ceb={token ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.background }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style={token ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
