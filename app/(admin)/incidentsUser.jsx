import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import styles from "../../assets/styles/incidents.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import DateSelector from "../../components/DateSelector";
import LocationSelector from "../../components/LocationSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Incidentes() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [fechaFiltro, setFechaFiltro] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState(false);

  const fetchIncidentes = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/incidente?page=${pageNum}&limit=10`;

      // Filtrar por ubicación si está seleccionada y no es "Todos"
      if (selectedLocation && selectedLocation !== "Todos") {
        url += `&location=${selectedLocation}`;
      }

      // Filtrar por fecha si está seleccionada
      if (fechaFiltro) {
        const fechaInicio = new Date(fechaFiltro);
        fechaInicio.setHours(0, 0, 0, 0);

        const fechaFin = new Date(fechaFiltro);
        fechaFin.setHours(23, 59, 59, 999);

        url += `&date=${fechaInicio.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch incidentes");
      }

      const data = await response.json();

      const uniqueIncidentes =
        refresh || pageNum === 1
          ? data.incidentes
          : Array.from(
              new Set([...incidentes, ...data.incidentes].map((incidente) => incidente._id))
            ).map((id) =>
              [...incidentes, ...data.incidentes].find((incidente) => incidente._id === id)
            );

      setIncidentes(uniqueIncidentes);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching incidentes:", error);
      Alert.alert("Error", "No se pudieron cargar los incidentes");
    } finally {
      if (refresh) {
        await sleep(800);
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchIncidentes();
  }, []);

  useEffect(() => {
    fetchIncidentes(1, true);
    setFiltroActivo(selectedLocation !== "Todos" || fechaFiltro !== null);
  }, [selectedLocation, fechaFiltro]);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchIncidentes(page + 1);
    }
  };

  const handleCreateIncidente = () => {
    router.push("/reporte");
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDateChange = (date) => {
    setFechaFiltro(date);
  };

  const handleClearDate = () => {
    setFechaFiltro(null);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation("Todos");
  };

  const limpiarTodosFiltros = () => {
    setSelectedLocation("Todos");
    setFechaFiltro(null);
    setFiltroActivo(false);
  };

  const formatTime = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.guardia}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
            <Text style={styles.statusText}>INCIDENTE</Text>
          </View>
        </View>
        <Ionicons
          name={expandedId === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
        <Text style={[styles.infoText, { fontWeight: "bold" }]}>{item.title}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{item.location}</Text>
      </View>

      {item.numero_guardia && (
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Guardia #{item.numero_guardia}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>
          Reportado: {formatDate(item.createdAt)} {formatTime(item.createdAt)}
        </Text>
      </View>

      {expandedId === item._id && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTitle}>Descripción del incidente:</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>

            {item.image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID del reporte:</Text>
              <Text style={styles.detailValue}>{item._id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ubicación:</Text>
              <Text style={styles.detailValue}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guardia:</Text>
              <Text style={styles.detailValue}>{item.guardia}</Text>
            </View>
            {item.numero_guardia && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Número de guardia:</Text>
                <Text style={styles.detailValue}>#{item.numero_guardia}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={incidentes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchIncidentes(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Reportes de Incidentes</Text>

            {/* Componente DateSelector */}
            <DateSelector
              selectedDate={fechaFiltro}
              onDateChange={handleDateChange}
              onClearDate={handleClearDate}
              placeholder="Seleccionar fecha"
              label="Filtrar por fecha:"
            />

            {/* Componente LocationSelector */}
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              onClearLocation={handleClearLocation}
              placeholder="Seleccionar ubicación"
              label="Filtrar por ubicación:"
            />

            {/* Limpiar Filtros */}
            {filtroActivo && (
              <TouchableOpacity style={styles.limpiarFiltrosButton} onPress={limpiarTodosFiltros}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.limpiarFiltrosText}>Limpiar todos los filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          hasMore && incidentes.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="warning-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {filtroActivo
                ? "No hay incidentes con los filtros aplicados"
                : "No hay incidentes reportados"}
            </Text>
            <Text style={styles.emptySubtext}>
              {filtroActivo
                ? "Intenta con otros filtros o limpia los actuales"
                : "Comienza reportando un nuevo incidente"}
            </Text>
            {filtroActivo ? (
              <TouchableOpacity style={styles.button} onPress={limpiarTodosFiltros}>
                <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Limpiar Filtros</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleCreateIncidente}>
                <Ionicons name="warning-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Reportar Incidente</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
