import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import styles from "../../assets/styles/pocisiones.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import LocationSelector from "../../components/LocationSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function GuardiasActivos() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [allActiveGuards, setAllActiveGuards] = useState([]);
  const [filteredActiveGuards, setFilteredActiveGuards] = useState([]);

  // Función para obtener TODOS los guardias activos
  const fetchAllActiveGuards = async () => {
    try {
      setLoading(true);

      // Obtener TODAS las entradas activas
      const response = await fetch(`${API_URL}/entrada?status=activo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active guards");
      }

      const data = await response.json();
      setAllActiveGuards(data.entradas || []);
      applyLocationFilter(data.entradas || [], selectedLocation);
    } catch (error) {
      console.log("Error fetching active guards:", error);
      Alert.alert("Error", "No se pudieron cargar los guardias activos");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de ubicación
  const applyLocationFilter = (guards, location) => {
    if (location === "Todos") {
      setFilteredActiveGuards(guards);
    } else {
      const filtered = guards.filter((guard) => guard.locacion === location);
      setFilteredActiveGuards(filtered);
    }
  };

  // Agrupar guardias por ubicación
  const groupGuardsByLocation = (guards) => {
    const grouped = {};
    guards.forEach((guard) => {
      if (!grouped[guard.locacion]) {
        grouped[guard.locacion] = [];
      }
      grouped[guard.locacion].push(guard);
    });
    return grouped;
  };

  useEffect(() => {
    fetchAllActiveGuards();
  }, []);

  useEffect(() => {
    applyLocationFilter(allActiveGuards, selectedLocation);
  }, [selectedLocation, allActiveGuards]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllActiveGuards();
    setRefreshing(false);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation("Todos");
  };

  const formatTime = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Componente para mostrar la lista de guardias activos
  const ActiveGuardsList = () => {
    if (filteredActiveGuards.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>
            {selectedLocation !== "Todos"
              ? `No hay guardias activos en ${selectedLocation}`
              : "No hay guardias activos en este momento"}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedLocation !== "Todos"
              ? "Intenta con otra ubicación o limpia el filtro"
              : "Los guardias aparecerán aquí cuando inicien su turno"}
          </Text>
        </View>
      );
    }

    const groupedGuards = groupGuardsByLocation(filteredActiveGuards);

    return (
      <ScrollView style={styles.activeGuardsScroll} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedGuards).map(([location, guards]) => (
          <View key={location} style={styles.locationGroup}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.locationTitle}>{location}</Text>
              <Text style={styles.guardCount}>
                ({guards.length} guardia{guards.length !== 1 ? "s" : ""})
              </Text>
            </View>

            {guards.map((guard, index) => (
              <View
                key={guard._id}
                style={[
                  styles.activeGuardCard,
                  index === guards.length - 1 && styles.lastGuardCard,
                ]}
              >
                <View style={styles.activeGuardInfoContainer}>
                  <View style={styles.activeGuardInfoRow}>
                    <Ionicons name="person-outline" size={18} color={COLORS.text} />
                    <Text style={styles.activeGuardLabel}>Guardia:</Text>
                    <Text style={styles.activeGuardValue}>{guard.nombre}</Text>
                  </View>
                  {/* 
                  {guard.numero_guardia && (
                    <View style={styles.activeGuardInfoRow}>
                      <Ionicons name="shield-outline" size={18} color={COLORS.text} />
                      <Text style={styles.activeGuardLabel}>Número:</Text>
                      <Text style={styles.activeGuardValue}>#{guard.numero_guardia}</Text>
                    </View>
                  )} */}

                  {/* <View style={styles.activeGuardInfoRow}>
                    <Ionicons name="time-outline" size={18} color={COLORS.text} />
                    <Text style={styles.activeGuardLabel}>Entrada:</Text>
                    <Text style={styles.activeGuardValue}>{formatTime(guard.entrada)}</Text>
                  </View> */}

                  {/* <View style={styles.activeGuardStatus}>
                    <View style={[styles.statusIndicator, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.activeGuardStatusText}>ACTIVO</Text>
                  </View> */}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={() => "dummy"}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* <Text style={styles.screenTitle}>Guardias Activos</Text> */}
            {/* <Text style={styles.screenSubtitle}>Monitoreo en tiempo real</Text> */}

            {/* Componente LocationSelector */}
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              onClearLocation={handleClearLocation}
              placeholder="Seleccionar ubicación"
              label="Filtrar por ubicación:"
            />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={<ActiveGuardsList />}
      />
    </View>
  );
}
