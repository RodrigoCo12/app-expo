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
          title: "Registro Asistencia",
          // title: "Registro Asistencia",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Asistencia",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-outline" size={size} color={color} />
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
      <Tabs.Screen
        name="create_report_incident"
        options={{
          title: "Incidente",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create_report_status"
        options={{
          title: "Reporte",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="incidentsUser"
        options={{
          title: "Incidentes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function getHeaderTitle(route) {
  switch (route.name) {
    case "index":
      return "Registro de Asistencia";
    case "create":
      return "Registrar Asistencia";
    case "profile":
      return "Mi Perfil";
    case "create_report_incident":
      return "Reportar Incidente";
    case "incidentsUser":
      return "Incidentes Reportados";
    default:
      return "";
  }
}
