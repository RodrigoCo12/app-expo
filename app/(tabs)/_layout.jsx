import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomHeader from "../../components/CustomHeader";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: ({ route }) => <CustomHeader title={getHeaderTitle(route)} />,
        tabBarActiveTintColor: COLORS.primary,
        // tabBarStyle: {
        //   backgroundColor: COLORS.cardBackground,
        //   borderTopWidth: 1,
        //   borderTopColor: COLORS.border,
        //   height: 60,
        // },
        // headerShown: false,
        // tabBarActiveTintColor: COLORS.primary,
        headerShadowVisible: true,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 13, // Tamaño más pequeño
        },
        tabBarLabelStyle: {
          flexWrap: "wrap",
          textAlign: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Asistencia",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-in-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportarse"
        options={{
          title: "Reportarse",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reportar_incidente"
        options={{
          title: "Incidente",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function getHeaderTitle(route) {
  switch (route.name) {
    case "index":
      return "Registrar Asistencia";
    case "reportarse":
      return "Reporte de Horario";
    case "profile":
      return "Mi Perfil";
    case "reportar_incidente":
      return "Reportar Incidente";
    default:
      return "";
  }
}
