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
          // title: "Registro Asistencia",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="posicion_trabajadores"
        options={{
          title: "Pocisiones",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reportes"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes_list"
        options={{
          title: "Lista",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Incidentes"
        options={{
          title: "Incidentes",
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
      return "Registro de Asistencia";
    case "profile":
      return "Mi Perfil";
    case "reportes":
      return "Reportes de Guardias";
    case "Incidentes":
      return "Incidentes Reportados";
    case "posicion_trabajadores":
      return "Guardias Activos";
    case "reportes_list":
      return "Lista Reportes";
    default:
      return "";
  }
}
