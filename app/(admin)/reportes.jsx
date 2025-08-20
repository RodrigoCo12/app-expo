// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Image,
//   Alert,
// } from "react-native";
// import { useAuthStore } from "../../store/authStore";
// import { useEffect, useState } from "react";
// import styles from "../../assets/styles/incidents.styles";
// import { API_URL } from "../../constants/api";
// import { Ionicons } from "@expo/vector-icons";
// import { formatPublishDate } from "../../lib/utils";
// import COLORS from "../../constants/colors";
// import Loader from "../../components/Loader";
// import { useRouter } from "expo-router";
// import DateSelector from "../../components/DateSelector";
// import LocationSelector from "../../components/LocationSelector";

// export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export default function Entradas() {
//   const { token, user } = useAuthStore();
//   const router = useRouter();
//   const [entradas, setEntradas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [expandedId, setExpandedId] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState("Todos");
//   const [fechaFiltro, setFechaFiltro] = useState(null);
//   const [filtroActivo, setFiltroActivo] = useState(false);

//   const fetchEntradas = async (pageNum = 1, refresh = false) => {
//     try {
//       if (refresh) setRefreshing(true);
//       else if (pageNum === 1) setLoading(true);

//       let url = `${API_URL}/entrada?page=${pageNum}&limit=10`;

//       // Filtrar por ubicación si está seleccionada y no es "Todos"
//       if (selectedLocation && selectedLocation !== "Todos") {
//         url += `&locacion=${selectedLocation}`;
//       }

//       // Filtrar por fecha si está seleccionada
//       if (fechaFiltro) {
//         const fechaInicio = new Date(fechaFiltro);
//         fechaInicio.setHours(0, 0, 0, 0);

//         const fechaFin = new Date(fechaFiltro);
//         fechaFin.setHours(23, 59, 59, 999);

//         url += `&fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
//       }

//       const response = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch entradas");
//       }

//       const data = await response.json();

//       const uniqueEntradas =
//         refresh || pageNum === 1
//           ? data.entradas
//           : Array.from(new Set([...entradas, ...data.entradas].map((entrada) => entrada._id))).map(
//               (id) => [...entradas, ...data.entradas].find((entrada) => entrada._id === id)
//             );

//       setEntradas(uniqueEntradas);
//       setHasMore(pageNum < data.totalPaginas);
//       setPage(pageNum);
//     } catch (error) {
//       console.log("Error fetching entradas:", error);
//       Alert.alert("Error", "No se pudieron cargar las entradas");
//     } finally {
//       if (refresh) {
//         await sleep(800);
//         setRefreshing(false);
//       } else {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchEntradas();
//   }, []);

//   useEffect(() => {
//     fetchEntradas(1, true);
//     setFiltroActivo(selectedLocation !== "Todos" || fechaFiltro !== null);
//   }, [selectedLocation, fechaFiltro]);

//   const handleLoadMore = async () => {
//     if (hasMore && !loading && !refreshing) {
//       await fetchEntradas(page + 1);
//     }
//   };

//   const handleCreateEntrada = () => {
//     router.push("/entrada");
//   };

//   const toggleExpand = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   const handleDateChange = (date) => {
//     setFechaFiltro(date);
//   };

//   const handleClearDate = () => {
//     setFechaFiltro(null);
//   };

//   const handleLocationChange = (location) => {
//     setSelectedLocation(location);
//   };

//   const handleClearLocation = () => {
//     setSelectedLocation("Todos");
//   };

//   const limpiarTodosFiltros = () => {
//     setSelectedLocation("Todos");
//     setFechaFiltro(null);
//     setFiltroActivo(false);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "activo":
//         return COLORS.success;
//       case "completado":
//         return COLORS.primary;
//       default:
//         return COLORS.textSecondary;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case "activo":
//         return "ACTIVO";
//       case "completado":
//         return "COMPLETADO";
//       default:
//         return status;
//     }
//   };

//   const formatTime = (date) => {
//     if (!date) return "No registrada";
//     return new Date(date).toLocaleTimeString("es-ES", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDate = (date) => {
//     if (!date) return "No registrada";
//     return new Date(date).toLocaleDateString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.bookCard}
//       onPress={() => toggleExpand(item._id)}
//       activeOpacity={0.8}
//     >
//       <View style={styles.bookHeader}>
//         <View style={styles.userInfo}>
//           <Text style={styles.username}>{item.nombre}</Text>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//             <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
//           </View>
//         </View>
//         <Ionicons
//           name={expandedId === item._id ? "chevron-up" : "chevron-down"}
//           size={20}
//           color={COLORS.textSecondary}
//         />
//       </View>

//       <View style={styles.infoRow}>
//         <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
//         <Text style={styles.infoText}>{item.locacion}</Text>
//       </View>

//       {item.numero_guardia && (
//         <View style={styles.infoRow}>
//           <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
//           <Text style={styles.infoText}>Guardia #{item.numero_guardia}</Text>
//         </View>
//       )}

//       <View style={styles.infoRow}>
//         <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
//         <Text style={styles.infoText}>
//           Entrada: {formatDate(item.entrada)} {formatTime(item.entrada)}
//         </Text>
//       </View>

//       {item.salida && (
//         <View style={styles.infoRow}>
//           <Ionicons name="exit-outline" size={16} color={COLORS.textSecondary} />
//           <Text style={styles.infoText}>
//             Salida: {formatDate(item.salida)} {formatTime(item.salida)}
//           </Text>
//         </View>
//       )}

//       {expandedId === item._id && (
//         <View style={styles.expandedContent}>
//           {item.image && (
//             <View style={styles.imageContainer}>
//               <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
//             </View>
//           )}

//           <View style={styles.detailsContainer}>
//             <Text style={styles.detailTitle}>Detalles completos:</Text>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Registro ID:</Text>
//               <Text style={styles.detailValue}>{item._id}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Duración:</Text>
//               <Text style={styles.detailValue}>
//                 {item.entrada && item.salida
//                   ? `${Math.round((new Date(item.salida) - new Date(item.entrada)) / (1000 * 60 * 60))} horas`
//                   : item.status === "activo"
//                     ? "En curso..."
//                     : "No disponible"}
//               </Text>
//             </View>
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   if (loading) return <Loader />;

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={entradas}
//         renderItem={renderItem}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={styles.listContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => fetchEntradas(1, true)}
//             colors={[COLORS.primary]}
//             tintColor={COLORS.primary}
//           />
//         }
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.1}
//         ListHeaderComponent={
//           <View style={styles.header}>
//             <Text style={styles.screenTitle}>Registro de Entradas</Text>

//             {/* Componente DateSelector */}
//             <DateSelector
//               selectedDate={fechaFiltro}
//               onDateChange={handleDateChange}
//               onClearDate={handleClearDate}
//               placeholder="Seleccionar fecha"
//               label="Filtrar por fecha:"
//             />

//             {/* Componente LocationSelector */}
//             <LocationSelector
//               selectedLocation={selectedLocation}
//               onLocationChange={handleLocationChange}
//               onClearLocation={handleClearLocation}
//               placeholder="Seleccionar ubicación"
//               label="Filtrar por ubicación:"
//             />

//             {/* Limpiar Filtros */}
//             {filtroActivo && (
//               <TouchableOpacity style={styles.limpiarFiltrosButton} onPress={limpiarTodosFiltros}>
//                 <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
//                 <Text style={styles.limpiarFiltrosText}>Limpiar todos los filtros</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         }
//         ListFooterComponent={
//           hasMore && entradas.length > 0 ? (
//             <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
//           ) : null
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="time-outline" size={60} color={COLORS.textSecondary} />
//             <Text style={styles.emptyText}>
//               {filtroActivo
//                 ? "No hay entradas con los filtros aplicados"
//                 : "No hay entradas registradas"}
//             </Text>
//             <Text style={styles.emptySubtext}>
//               {filtroActivo
//                 ? "Intenta con otros filtros o limpia los actuales"
//                 : "Comienza registrando una nueva entrada"}
//             </Text>
//             {filtroActivo ? (
//               <TouchableOpacity style={styles.button} onPress={limpiarTodosFiltros}>
//                 <Ionicons name="close-circle-outline" size={20} color={COLORS.white} />
//                 <Text style={styles.buttonText}>Limpiar Filtros</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity style={styles.button} onPress={handleCreateEntrada}>
//                 <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
//                 <Text style={styles.buttonText}>Registrar Entrada</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         }
//       />
//     </View>
//   );
// }
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
  const [filtroActivo, setFiltroActivo] = useState(false);

  const fetchReportes = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      let url = `${API_URL}/reporte?page=${pageNum}&limit=10`;

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

        url += `&fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`;
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
    fetchReportes(1, true);
    setFiltroActivo(selectedLocation !== "Todos" || fechaFiltro !== null);
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

  const formatTime = (timeString) => {
    if (!timeString) return "No registrada";
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No registrada";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => toggleExpand(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.guardia}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getInTimeColor(item.in_time) }]}>
            <Text style={styles.statusText}>{getInTimeText(item.in_time)}</Text>
          </View>
        </View>
        <Ionicons
          name={expandedId === item._id ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textSecondary}
        />
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
        <Text style={styles.infoText}>Hora de reporte: {item.hora_de_reporte}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>Fecha: {formatDate(item.createdAt)}</Text>
      </View>

      {expandedId === item._id && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTitle}>Descripción:</Text>
            <Text style={styles.descripcionText}>{item.descripcion}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reporte ID:</Text>
              <Text style={styles.detailValue}>{item._id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Creado el:</Text>
              <Text style={styles.detailValue}>{formatDateTime(item.createdAt)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Actualizado el:</Text>
              <Text style={styles.detailValue}>{formatDateTime(item.updatedAt)}</Text>
            </View>
          </View>

          {item.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
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
            <Text style={styles.screenTitle}>Registro de Reportes</Text>

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
