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

export default function Reportes() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchReportes = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/reporte?page=${pageNum}&limit=5`;
      // console.log(selectedLocation);
      if (selectedLocation && selectedLocation !== "Todos") {
        url += `&location=${selectedLocation}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reportes");
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
      console.log("Error fetching reportes:", error);
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

  useEffect(() => {
    if (selectedLocation !== null) {
      fetchReportes(1, true);
    }
  }, [selectedLocation]);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchReportes(page + 1);
    }
  };

  const handleCreateReporte = () => {
    router.push("/create");
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getLocationName = (position) => {
    const locations = {
      "entrada-principal": "Entrada Principal",
      recepcion: "Recepción",
      "area-carga": "Área de Carga",
      estacionamiento: "Estacionamiento",
    };
    return locations[position] || position;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
        </View>
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
        <Text style={styles.username}>Fecha: </Text>
        <Text>{formatPublishDate(item.createdAt)}</Text>
      </View>

      {expandedId === item._id && (
        <>
          {item.image && (
            <View style={styles.bookImageContainer}>
              <Image source={{ uri: item.image }} style={styles.bookImage} contentFit="cover" />
            </View>
          )}
        </>
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
          <View style={styles.header}>
            <PosicionSelector
              selectedPost={selectedLocation}
              setSelectedPost={setSelectedLocation}
              filter={true}
            />
          </View>
        }
        ListFooterComponent={
          hasMore && reportes.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay reportes disponibles</Text>
            <Text style={styles.emptySubtext}>Sé el primero en crear un reporte</Text>
            <TouchableOpacity style={styles.button} onPress={handleCreateReporte}>
              <Text style={styles.buttonText}>Crear Reporte</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
