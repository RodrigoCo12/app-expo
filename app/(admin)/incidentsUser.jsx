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
import { formatPublishDate } from "../../lib/utils";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useRouter } from "expo-router";
import PosicionSelector from "../../components/PosicionSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Incidents() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Estado para
  // controlar qué item está expandido
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchIncidents = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/incident?page=${pageNum}&limit=5`;
      if (selectedLocation && selectedLocation !== "Todos") {
        url += `&location=${selectedLocation}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON response");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch incidents");

      const uniqueIncidents =
        refresh || pageNum === 1
          ? data.incidents
          : Array.from(
              new Set([...incidents, ...data.incidents].map((incident) => incident._id))
            ).map((id) =>
              [...incidents, ...data.incidents].find((incident) => incident._id === id)
            );

      setIncidents(uniqueIncidents);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching incidents:", error);
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
    fetchIncidents();
  }, []);
  useEffect(() => {
    if (selectedLocation !== null) {
      fetchIncidents(1, true);
    }
  }, [selectedLocation]);
  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchIncidents(page + 1);
    }
  };

  const handleCreateIncident = () => {
    router.push("/create-incident");
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id); // Si ya está expandido, lo colapsa
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.bookHeader}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Ionicons
          name={expandedId === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textSecondary}
        />
      </View>

      {item.location && (
        <View style={styles.locationContainer}>
          <Text style={styles.username}>Puesto: </Text>
          <Text>{getLocationName(item.location)}</Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.username}>Reportado por: </Text>
        <Text>{item.user?.username || "Usuario desconocido"}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.username}>Fecha y Hora: </Text>
        <Text>{formatPublishDate(item.incidentDate)}</Text>
      </View>

      {/* Contenido expandible */}
      {expandedId === item._id && (
        <>
          <View style={styles.bookDetails}>
            <Text style={styles.caption}>{item.description}</Text>
          </View>

          {item.image && (
            <View style={styles.bookImageContainer}>
              <Image source={{ uri: item.image }} style={styles.bookImage} contentFit="cover" />
            </View>
          )}
        </>
      )}
      <Text style={styles.date}>Reporte entregado: {formatPublishDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const getLocationName = (position) => {
    const locations = {
      "entrada-principal": "Entrada Principal",
      recepcion: "Recepción",
      "area-carga": "Área de Carga",
      estacionamiento: "Estacionamiento",
    };
    return locations[position] || position;
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={incidents}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchIncidents(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <PosicionSelector
              selectedPost={selectedLocation}
              setSelectedPost={setSelectedLocation}
              filter={true}
            />
          </View>
        }
        ListFooterComponent={
          hasMore && incidents.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay incidentes reportados</Text>
            <Text style={styles.emptySubtext}>Sé el primero en reportar un incidente</Text>
            <TouchableOpacity style={styles.button} onPress={handleCreateIncident}>
              <Text style={styles.buttonText}>Crear Reporte</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
