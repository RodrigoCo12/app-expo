import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import styles from "../../assets/styles/incidents.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import PosicionSelector from "../../components/PosicionSelector";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Usamos los mismos valores que en PosicionSelector
const locations = [
  { id: "Entrada principal", name: "Entrada Principal" },
  { id: "Recepción", name: "Recepción" },
  { id: "Área de Carga", name: "Área de Carga" },
  { id: "Estacionamiento", name: "Estacionamiento" },
];

export default function PosicionTrabajadores() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUsersByLocation = (locationId) => {
    let filteredUsers = users.filter((user) => user.status === "activo"); // Solo usuarios activos

    if (locationId === "Todos" || !locationId) {
      return filteredUsers.filter((user) => user.location && user.location !== "Por seleccionar");
    }
    return filteredUsers.filter((user) => user.location === locationId);
  };

  const renderLocationCard = ({ item }) => {
    // Si hay un filtro seleccionado, solo mostramos esa ubicación
    if (selectedLocation && selectedLocation !== "Todos" && selectedLocation !== item.id) {
      return null;
    }

    const locationUsers = getUsersByLocation(item.id);

    return (
      <View style={positionStyles.locationCard}>
        <Text style={positionStyles.locationTitle}>{item.name}</Text>

        {locationUsers.length > 0 ? (
          <FlatList
            data={locationUsers}
            renderItem={renderUserItem}
            keyExtractor={(user) => user._id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={positionStyles.noUsersText}>No hay trabajadores asignados</Text>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={positionStyles.userCard}>
      <View style={positionStyles.userInfo}>
        {/* {item.profileImage && (
          <Image source={{ uri: item.profileImage }} style={positionStyles.userImage} />
        )} */}
        <View>
          <Text style={positionStyles.username}>{item.username}</Text>
          <Text style={positionStyles.adminText}>
            {item.admin === "valido" ? "Administrador" : "Trabajador"}
          </Text>
        </View>
      </View>
      <View style={positionStyles.userStatus}>
        <View
          style={[
            positionStyles.statusIndicator,
            { backgroundColor: COLORS.success }, // Siempre verde porque ya están filtrados
          ]}
        />
        <Text style={positionStyles.statusText}>Activo</Text>
      </View>
    </View>
  );

  const filteredLocations =
    selectedLocation && selectedLocation !== "Todos"
      ? locations.filter((loc) => loc.id === selectedLocation)
      : locations;

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.specialStyle}>
        <PosicionSelector
          selectedPost={selectedLocation}
          setSelectedPost={setSelectedLocation}
          filter={true}
        />
      </View>

      <FlatList
        data={filteredLocations}
        renderItem={renderLocationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={positionStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron posiciones</Text>
          </View>
        }
      />
    </View>
  );
}

const positionStyles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.text,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  adminText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  noUsersText: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
});
