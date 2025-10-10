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
import styles from "../../assets/styles/index_admin.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import DateSelector from "../../components/DateSelector";
import LocationSelector from "../../components/LocationSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Entradas() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Todos");

  // Por defecto: últimas 24 horas
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(now.getHours() - 24);
    return yesterday;
  });
  const [fechaFinFiltro, setFechaFinFiltro] = useState(new Date());
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [filtroDefault, setFiltroDefault] = useState(true); // Controlar si es filtro por defecto

  const fetchEntradas = async (pageNum = 1, refresh = false) => {
    // Verificar si hay token antes de hacer la petición
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/entrada?page=${pageNum}&limit=10`;

      // Filtrar por ubicación si está seleccionada y no es "Todos"
      if (selectedLocation && selectedLocation !== "Todos") {
        url += `&locacion=${selectedLocation}`;
      }

      // Siempre aplicar filtro de fecha (últimas 24 horas por defecto)
      if (fechaInicioFiltro && fechaFinFiltro) {
        const fechaInicio = new Date(fechaInicioFiltro);
        const fechaFin = new Date(fechaFinFiltro);

        url += `&fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch entradas");
      }

      const data = await response.json();

      const uniqueEntradas =
        refresh || pageNum === 1
          ? data.entradas
          : Array.from(new Set([...entradas, ...data.entradas].map((entrada) => entrada._id))).map(
              (id) => [...entradas, ...data.entradas].find((entrada) => entrada._id === id)
            );

      setEntradas(uniqueEntradas);
      setHasMore(pageNum < data.totalPaginas);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching entradas:", error);
      if (token) {
        Alert.alert("Error", "No se pudieron cargar las entradas");
      }
    } finally {
      if (refresh) {
        await sleep(800);
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Función para mostrar todas las entradas (sin filtros de fecha)
  const mostrarTodasLasEntradas = () => {
    setFechaInicioFiltro(null);
    setFechaFinFiltro(null);
    setFiltroDefault(false);
    setFiltroActivo(true);
  };

  useEffect(() => {
    if (token) {
      fetchEntradas();
      // Solo mostrar filtro como activo si no es "Todos" o si el filtro no es por defecto
      setFiltroActivo(selectedLocation !== "Todos" || !filtroDefault);
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEntradas(1, true);
      setFiltroActivo(selectedLocation !== "Todos" || !filtroDefault);
    }
  }, [selectedLocation, fechaInicioFiltro, fechaFinFiltro, token]);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing && token) {
      await fetchEntradas(page + 1);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDateChange = (date) => {
    // Cuando el usuario cambia manualmente la fecha, ya no es el filtro por defecto
    setFiltroDefault(false);

    // Para simplificar, vamos a usar un rango de un día cuando el usuario selecciona una fecha
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    setFechaInicioFiltro(startDate);
    setFechaFinFiltro(endDate);
  };

  const handleClearDate = () => {
    // Al limpiar, volver a las últimas 24 horas
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(now.getHours() - 24);

    setFechaInicioFiltro(yesterday);
    setFechaFinFiltro(now);
    setFiltroDefault(true);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation("Todos");
  };

  const limpiarTodosFiltros = () => {
    setSelectedLocation("Todos");
    // Restablecer a últimas 24 horas
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setHours(now.getHours() - 24);

    setFechaInicioFiltro(yesterday);
    setFechaFinFiltro(now);
    setFiltroDefault(true);
    setFiltroActivo(false);
  };

  // Función para formatear el rango de fecha mostrado
  const getDateDisplayText = () => {
    if (filtroDefault) {
      return "Últimas 24h";
    }

    // Si no hay fechas (mostrar todas)
    if (!fechaInicioFiltro || !fechaFinFiltro) {
      return "Todas las fechas";
    }

    const start = new Date(fechaInicioFiltro);
    const end = new Date(fechaFinFiltro);

    // Si es un solo día
    if (start.toDateString() === end.toDateString()) {
      const today = new Date();
      const selected = new Date(start);

      if (selected.toDateString() === today.toDateString()) {
        return "Hoy";
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (selected.toDateString() === yesterday.toDateString()) {
        return "Ayer";
      }

      return selected.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    // Si es un rango de fechas
    return `${start.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    })} - ${end.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "activo":
        return COLORS.success;
      case "completado":
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "activo":
        return "ACTIVO";
      case "completado":
        return "COMPLETADO";
      default:
        return status;
    }
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

  const formatDateTime = (date) => {
    if (!date) return "No registrada";
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.itemHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.nombre}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Ionicons
          name={expandedId === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{item.locacion}</Text>
      </View>

      {item.numero_guardia && (
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Guardia #{item.numero_guardia}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Entrada: {formatDateTime(item.entrada)}</Text>
      </View>

      {item.salida && (
        <View style={styles.infoRow}>
          <Ionicons name="exit-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Salida: {formatDateTime(item.salida)}</Text>
        </View>
      )}

      {expandedId === item._id && (
        <View style={styles.expandedContent}>
          {item.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            </View>
          )}

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración:</Text>
              <Text style={styles.detailValue}>
                {item.entrada && item.salida
                  ? `${Math.round((new Date(item.salida) - new Date(item.entrada)) / (1000 * 60 * 60))} horas`
                  : item.status === "activo"
                    ? "En curso..."
                    : "No disponible"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={entradas}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEntradas(1, true)}
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
                  selectedDate={fechaFinFiltro} // Mostrar la fecha final como referencia
                  onDateChange={handleDateChange}
                  onClearDate={handleClearDate}
                  placeholder={getDateDisplayText()}
                  label="Filtrar por fecha:"
                  showClearButton={!filtroDefault}
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
          hasMore && entradas.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {filtroActivo
                ? `No hay entradas para los filtros seleccionados`
                : "No hay entradas en las últimas 24 horas"}
            </Text>
            <Text style={styles.emptySubtext}>
              {filtroActivo
                ? "Intenta con otros filtros o limpia los filtros actuales"
                : "Puedes ver todas las entradas registradas"}
            </Text>

            {/* BOTÓN MODIFICADO: Ahora muestra "Mostrar todas las entradas" en lugar de "Registrar Entrada" */}
            <TouchableOpacity style={styles.button} onPress={mostrarTodasLasEntradas}>
              <Text style={styles.buttonText}>Mostrar todas las entradas</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
