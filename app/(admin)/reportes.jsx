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
import styles from "../../assets/styles/reportes.style";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import DateSelector from "../../components/DateSelector";
import LocationSelector from "../../components/LocationSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Reportes() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Todos");
  const [fechaFiltro, setFechaFiltro] = useState(null);

  // Calcular filtroActivo directamente
  const filtroActivo = selectedLocation !== "Todos" || fechaFiltro !== null;

  const fetchReportes = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/reporte?page=${pageNum}&limit=10`;

      // Filtrar por ubicación
      if (selectedLocation && selectedLocation !== "Todos") {
        url += `&location=${encodeURIComponent(selectedLocation)}`;
      }

      // Filtrar por fecha
      if (fechaFiltro) {
        const fecha = new Date(fechaFiltro);
        if (!isNaN(fecha.getTime())) {
          const fechaInicio = new Date(fecha);
          fechaInicio.setHours(0, 0, 0, 0);

          const fechaFin = new Date(fecha);
          fechaFin.setHours(23, 59, 59, 999);

          url += `&fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
        } else {
          console.log("❌ Fecha inválida:", fechaFiltro);
        }
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const uniqueReportes =
        refresh || pageNum === 1
          ? data.reportes
          : Array.from(new Set([...reportes, ...data.reportes].map((reporte) => reporte._id))).map(
              (id) => [...reportes, ...data.reportes].find((reporte) => reporte._id === id)
            );

      setReportes(uniqueReportes);
      setHasMore(pageNum < data.totalPaginas);
      setPage(pageNum);
    } catch (error) {
      console.log("❌ Error fetching reportes:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes");
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
    fetchReportes();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    fetchReportes(1, true);
  }, [selectedLocation, fechaFiltro]);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchReportes(page + 1);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDateChange = (date) => {
    if (date) {
      setFechaFiltro(date);
    }
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
  };

  const getInTimeColor = (inTime) => {
    switch (inTime) {
      case "en tiempo":
        return COLORS.success;
      case "atrasado":
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  const getInTimeText = (inTime) => {
    switch (inTime) {
      case "en tiempo":
        return "EN TIEMPO";
      case "atrasado":
        return "ATRASADO";
      default:
        return inTime || "NO ESPECIFICADO";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No registrada";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear la lista de guardias
  const formatGuardias = (guardias) => {
    if (!guardias || !Array.isArray(guardias)) return "No especificado";
    return guardias.join(", ");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reporteCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.reporteHeader}>
        <View style={styles.reporteInfo}>
          <Text style={styles.ubicacionText}>{item.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getInTimeColor(item.in_time) }]}>
          <Text style={styles.statusText}>{getInTimeText(item.in_time)}</Text>
        </View>
        <Ionicons
          name={expandedId === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Guardias: {formatGuardias(item.guardias)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Hora de reporte: {item.hora_de_reporte}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Creado el: {formatDateTime(item.createdAt)}</Text>
      </View>

      {expandedId === item._id && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTitle}>Descripción:</Text>
            <Text style={styles.descripcionText}>{item.descripcion}</Text>
          </View>

          {/* ✅ USA PRIMERO EL THUMBNAIL, LUEGO IMAGEN COMO FALLBACK */}
          {(item.thumbnail || item.image) && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.thumbnail || item.image }}
                style={styles.image}
                contentFit="cover"
              />
              {/* ✅ INDICADOR DE CALIDAD OPTIMIZADA */}
              {item.thumbnail && (
                <View style={styles.optimizedBadge}>
                  <Text style={styles.optimizedText}>✓ Optimizada</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={reportes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // ✅ OPTIMIZACIONES PARA MEJOR RENDIMIENTO:
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        initialNumToRender={8}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReportes(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerDate}>
                <DateSelector
                  selectedDate={fechaFiltro}
                  onDateChange={handleDateChange}
                  onClearDate={handleClearDate}
                  placeholder="Todas"
                  label="Filtrar por fecha:"
                />
              </View>

              <View style={styles.headerLocation}>
                <LocationSelector
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                  onClearLocation={handleClearLocation}
                  placeholder="Seleccionar ubicación"
                  label="Filtrar por ubicación:"
                />
              </View>
            </View>

            {filtroActivo && (
              <TouchableOpacity style={styles.limpiarFiltrosButton} onPress={limpiarTodosFiltros}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.limpiarFiltrosText}>Limpiar todos los filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          hasMore && reportes.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {filtroActivo
                ? "No hay reportes con los filtros aplicados"
                : "No hay reportes registrados"}
            </Text>
            <Text style={styles.emptySubtext}>
              {filtroActivo
                ? "Intenta con otros filtros o limpia los actuales"
                : "Los reportes aparecerán aquí una vez que sean creados"}
            </Text>
            {filtroActivo && (
              <TouchableOpacity style={styles.button} onPress={limpiarTodosFiltros}>
                <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Limpiar Filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
