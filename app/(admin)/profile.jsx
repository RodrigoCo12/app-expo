// import { useEffect, useState } from "react";
// import {
//   View,
//   Alert,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Modal,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { API_URL } from "../../constants/api";
// import { useAuthStore } from "../../store/authStore";
// import styles from "../../assets/styles/profile.styles";
// import ProfileHeader from "../../components/ProfileHeader";
// import LogoutButton from "../../components/LogoutButton";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import { Image } from "expo-image";
// import { sleep } from ".";
// import Loader from "../../components/Loader";

// export default function Profile() {
//   // const [books, setBooks] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [deleteBookId, setDeleteBookId] = useState(null);
//   const [deleteLocationId, setDeleteLocationId] = useState(null);

//   // Estados para el modal de registro
//   const [showRegisterModal, setShowRegisterModal] = useState(false);
//   const [registerLoading, setRegisterLoading] = useState(false);
//   const [registerForm, setRegisterForm] = useState({
//     username: "",
//     password: "",
//     numero_guardias: "1",
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const { token, user } = useAuthStore();

//   const router = useRouter();

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);

//       // // Fetch user books
//       // const booksResponse = await fetch(`${API_URL}/books/user`, {
//       //   headers: { Authorization: `Bearer ${token}` },
//       // });
//       // const booksData = await booksResponse.json();
//       // if (!booksResponse.ok) throw new Error(booksData.message || "Failed to fetch user books");
//       // setBooks(booksData);

//       // Fetch locations (non-admin users)
//       await fetchLocations();
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Función para manejar el registro de nuevo usuario
//   const handleRegister = async () => {
//     if (!registerForm.username || !registerForm.password || !registerForm.numero_guardias) {
//       Alert.alert("Error", "Todos los campos son requeridos");
//       return;
//     }

//     if (registerForm.password.length < 6) {
//       Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
//       return;
//     }

//     if (registerForm.username.length < 3) {
//       Alert.alert("Error", "El usuario debe tener al menos 3 caracteres");
//       return;
//     }

//     const numGuardias = parseInt(registerForm.numero_guardias);
//     if (isNaN(numGuardias) || numGuardias < 1 || numGuardias > 6) {
//       Alert.alert("Error", "El número de guardias debe estar entre 1 y 6");
//       return;
//     }

//     try {
//       setRegisterLoading(true);

//       const response = await fetch(`${API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: registerForm.username,
//           password: registerForm.password,
//           numero_guardias: numGuardias,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Error al registrar usuario");
//       }

//       Alert.alert("Éxito", "Locación registrada correctamente");
//       setShowRegisterModal(false);
//       resetRegisterForm();

//       // Refrescar la lista de locaciones
//       await fetchLocations();
//     } catch (error) {
//       Alert.alert("Error", error.message || "Error al registrar locación");
//     } finally {
//       setRegisterLoading(false);
//     }
//   };

//   // Función separada para obtener locaciones
//   const fetchLocations = async () => {
//     try {
//       const usersResponse = await fetch(`${API_URL}/auth/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const usersData = await usersResponse.json();
//       if (!usersResponse.ok) throw new Error(usersData.message || "Failed to fetch users");

//       const nonAdminUsers = usersData.filter((user) => user.admin === "invalido");
//       setLocations(nonAdminUsers);
//     } catch (error) {
//       console.error("Error fetching locations:", error);
//     }
//   };

//   // Resetear formulario de registro
//   const resetRegisterForm = () => {
//     setRegisterForm({
//       username: "",
//       password: "",
//       numero_guardias: "1",
//     });
//     setShowPassword(false);
//   };

//   // Funciones para incrementar/decrementar guardias
//   const incrementGuardias = () => {
//     const currentValue = parseInt(registerForm.numero_guardias) || 1;
//     if (currentValue < 6) {
//       setRegisterForm({ ...registerForm, numero_guardias: (currentValue + 1).toString() });
//     }
//   };

//   const decrementGuardias = () => {
//     const currentValue = parseInt(registerForm.numero_guardias) || 1;
//     if (currentValue > 1) {
//       setRegisterForm({ ...registerForm, numero_guardias: (currentValue - 1).toString() });
//     }
//   };

//   const handleGuardiasChange = (text) => {
//     if (/^\d*$/.test(text)) {
//       const numValue = parseInt(text) || 0;
//       if (numValue > 6) {
//         setRegisterForm({ ...registerForm, numero_guardias: "6" });
//       } else if (numValue < 1 && text !== "") {
//         setRegisterForm({ ...registerForm, numero_guardias: "1" });
//       } else {
//         setRegisterForm({ ...registerForm, numero_guardias: text });
//       }
//     }
//   };

//   // Función para eliminar locación de la base de datos
//   const handleDeleteLocation = async (locationId, locationName) => {
//     try {
//       setDeleteLocationId(locationId);

//       const response = await fetch(`${API_URL}/auth/users/${locationId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to delete location");
//       }

//       // Eliminar del estado local después de éxito en el backend
//       setLocations(locations.filter((location) => location._id !== locationId));
//       Alert.alert("Éxito", `Locación "${locationName}" eliminada correctamente`);
//     } catch (error) {
//       console.error("Error deleting location:", error);
//       Alert.alert("Error", error.message || "No se pudo eliminar la locación");
//     } finally {
//       setDeleteLocationId(null);
//     }
//   };

//   const confirmDeleteLocation = (locationId, locationName) => {
//     Alert.alert(
//       "Eliminar Locación",
//       `¿Estás seguro de que quieres eliminar la locación "${locationName}"? Esta acción no se puede deshacer.`,
//       [
//         { text: "Cancelar", style: "cancel" },
//         {
//           text: "Eliminar",
//           style: "destructive",
//           onPress: () => handleDeleteLocation(locationId, locationName),
//         },
//       ]
//     );
//   };

//   // Render item para la lista de locaciones
//   const renderLocationItem = ({ item }) => (
//     <View style={styles.locationItem}>
//       <View style={styles.locationInfo}>
//         <View style={styles.locationHeader}>
//           <Text style={styles.locationName}>{item.username}</Text>
//           <View style={styles.guardCountBadge}>
//             <Ionicons name="people-outline" size={14} color="#fff" />
//             <Text style={styles.guardCountText}>{item.numero_guardias}</Text>
//           </View>
//         </View>
//         <Text style={styles.locationDate}>
//           Creado: {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//       </View>

//       <TouchableOpacity
//         style={styles.deleteLocationButton}
//         onPress={() => confirmDeleteLocation(item._id, item.username)}
//         disabled={deleteLocationId === item._id}
//       >
//         {deleteLocationId === item._id ? (
//           <ActivityIndicator size="small" color={COLORS.danger} />
//         ) : (
//           <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
//         )}
//       </TouchableOpacity>
//     </View>
//   );

//   // const renderBookItem = ({ item }) => (
//   //   <View style={styles.bookItem}>
//   //     <Image source={item.image} style={styles.bookImage} />
//   //     <View style={styles.bookInfo}>
//   //       <Text style={styles.bookTitle}>{item.title}</Text>
//   //       <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
//   //       <Text style={styles.bookCaption} numberOfLines={2}>
//   //         {item.caption}
//   //       </Text>
//   //       <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
//   //     </View>

//   //     <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
//   //       {deleteBookId === item._id ? (
//   //         <ActivityIndicator size="small" color={COLORS.primary} />
//   //       ) : (
//   //         <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
//   //       )}
//   //     </TouchableOpacity>
//   //   </View>
//   // );

//   const renderRatingStars = (rating) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <Ionicons
//           key={i}
//           name={i <= rating ? "star" : "star-outline"}
//           size={14}
//           color={i <= rating ? "#f4b400" : COLORS.textSecondary}
//           style={{ marginRight: 2 }}
//         />
//       );
//     }
//     return stars;
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await sleep(500);
//     await fetchData();
//     setRefreshing(false);
//   };

//   if (isLoading && !refreshing) return <Loader />;

//   return (
//     <View style={styles.container}>
//       <ProfileHeader />
//       <LogoutButton />

//       {/* Botón para crear nueva locación/usuario - Solo visible para admin */}
//       {user?.admin === "valido" && (
//         <TouchableOpacity
//           style={styles.addLocationButton}
//           onPress={() => setShowRegisterModal(true)}
//         >
//           <Ionicons name="add-circle-outline" size={20} color="#fff" />
//           <Text style={styles.addLocationButtonText}>Nueva Locación</Text>
//         </TouchableOpacity>
//       )}

//       {/* Lista de Locaciones - Solo visible para admin */}

//       {user?.admin === "valido" && (
//         <View style={styles.locationsSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Locaciones Registradas</Text>
//             <Text style={styles.locationsCount}>{locations.length} locaciones</Text>
//           </View>

//           <FlatList
//             data={locations}
//             renderItem={renderLocationItem}
//             keyExtractor={(item) => item._id}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.locationsList}
//             ListEmptyComponent={
//               <View style={styles.emptyLocationsContainer}>
//                 <Ionicons name="business-outline" size={40} color={COLORS.textSecondary} />
//                 <Text style={styles.emptyLocationsText}>No hay locaciones registradas</Text>
//                 <Text style={styles.emptyLocationsSubtext}>
//                   Presiona "Nueva Locación" para agregar la primera
//                 </Text>
//               </View>
//             }
//           />
//         </View>
//       )}

//       {/* Modal de Registro */}
//       <Modal
//         visible={showRegisterModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setShowRegisterModal(false);
//           resetRegisterForm();
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <KeyboardAvoidingView
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={styles.modalContainer}
//           >
//             <View style={styles.modalContent}>
//               {/* Header del Modal */}
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Registrar Nueva Locación</Text>
//                 <TouchableOpacity
//                   style={styles.closeButton}
//                   onPress={() => {
//                     setShowRegisterModal(false);
//                     resetRegisterForm();
//                   }}
//                 >
//                   <Ionicons name="close-outline" size={24} color={COLORS.text} />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView style={styles.modalForm}>
//                 {/* Usuario Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Usuario</Text>
//                   <View style={styles.inputContainer}>
//                     <Ionicons
//                       name="person-outline"
//                       size={20}
//                       color={COLORS.primary}
//                       style={styles.inputIcon}
//                     />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Nombre de usuario"
//                       placeholderTextColor={COLORS.placeholderText}
//                       value={registerForm.username}
//                       onChangeText={(text) => setRegisterForm({ ...registerForm, username: text })}
//                       autoCapitalize="none"
//                     />
//                   </View>
//                 </View>

//                 {/* Contraseña Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Contraseña</Text>
//                   <View style={styles.inputContainer}>
//                     <Ionicons
//                       name="lock-closed-outline"
//                       size={20}
//                       color={COLORS.primary}
//                       style={styles.inputIcon}
//                     />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="******"
//                       placeholderTextColor={COLORS.placeholderText}
//                       value={registerForm.password}
//                       onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
//                       secureTextEntry={!showPassword}
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword(!showPassword)}
//                       style={styles.eyeIcon}
//                     >
//                       <Ionicons
//                         name={showPassword ? "eye-outline" : "eye-off-outline"}
//                         size={20}
//                         color={COLORS.primary}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* Número de Guardias Input */}
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Número de Guardias</Text>
//                   <View style={styles.guardiasContainer}>
//                     <TouchableOpacity
//                       style={styles.guardiasButton}
//                       onPress={decrementGuardias}
//                       disabled={parseInt(registerForm.numero_guardias) <= 1}
//                     >
//                       <Ionicons
//                         name="remove-outline"
//                         size={20}
//                         color={
//                           parseInt(registerForm.numero_guardias) <= 1 ? COLORS.gray : COLORS.primary
//                         }
//                       />
//                     </TouchableOpacity>

//                     <TextInput
//                       style={styles.guardiasInput}
//                       value={registerForm.numero_guardias}
//                       onChangeText={handleGuardiasChange}
//                       keyboardType="numeric"
//                       textAlign="center"
//                     />

//                     <TouchableOpacity
//                       style={styles.guardiasButton}
//                       onPress={incrementGuardias}
//                       disabled={parseInt(registerForm.numero_guardias) >= 6}
//                     >
//                       <Ionicons
//                         name="add-outline"
//                         size={20}
//                         color={
//                           parseInt(registerForm.numero_guardias) >= 6 ? COLORS.gray : COLORS.primary
//                         }
//                       />
//                     </TouchableOpacity>
//                   </View>
//                   <Text style={styles.guardiasNote}>Mínimo: 1 guardia, Máximo: 6 guardias</Text>
//                 </View>

//                 {/* Botones del Modal */}
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.cancelButton]}
//                     onPress={() => {
//                       setShowRegisterModal(false);
//                       resetRegisterForm();
//                     }}
//                     disabled={registerLoading}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancelar</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.registerButton]}
//                     onPress={handleRegister}
//                     disabled={registerLoading}
//                   >
//                     {registerLoading ? (
//                       <ActivityIndicator color="#fff" size="small" />
//                     ) : (
//                       <Text style={styles.registerButtonText}>Registrar</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>
//             </View>
//           </KeyboardAvoidingView>
//         </View>
//       </Modal>
//     </View>
//   );
// }
import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import { sleep } from ".";
import Loader from "../../components/Loader";

export default function Profile() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLocationId, setDeleteLocationId] = useState(null);

  // Estados para el modal de registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    numero_guardias: "1",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { token, user } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await fetchLocations();
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para manejar el registro de nuevo usuario
  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.password || !registerForm.numero_guardias) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }

    if (registerForm.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (registerForm.username.length < 3) {
      Alert.alert("Error", "El usuario debe tener al menos 3 caracteres");
      return;
    }

    const numGuardias = parseInt(registerForm.numero_guardias);
    if (isNaN(numGuardias) || numGuardias < 1 || numGuardias > 6) {
      Alert.alert("Error", "El número de guardias debe estar entre 1 y 6");
      return;
    }

    try {
      setRegisterLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          numero_guardias: numGuardias,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      Alert.alert("Éxito", "Locación registrada correctamente");
      setShowRegisterModal(false);
      resetRegisterForm();

      // Refrescar la lista de locaciones
      await fetchLocations();
    } catch (error) {
      Alert.alert("Error", error.message || "Error al registrar locación");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Función separada para obtener locaciones
  const fetchLocations = async () => {
    try {
      const usersResponse = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      if (!usersResponse.ok) throw new Error(usersData.message || "Failed to fetch users");

      const nonAdminUsers = usersData.filter((user) => user.admin === "invalido");
      setLocations(nonAdminUsers);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Resetear formulario de registro
  const resetRegisterForm = () => {
    setRegisterForm({
      username: "",
      password: "",
      numero_guardias: "1",
    });
    setShowPassword(false);
  };

  // Funciones para incrementar/decrementar guardias
  const incrementGuardias = () => {
    const currentValue = parseInt(registerForm.numero_guardias) || 1;
    if (currentValue < 6) {
      setRegisterForm({ ...registerForm, numero_guardias: (currentValue + 1).toString() });
    }
  };

  const decrementGuardias = () => {
    const currentValue = parseInt(registerForm.numero_guardias) || 1;
    if (currentValue > 1) {
      setRegisterForm({ ...registerForm, numero_guardias: (currentValue - 1).toString() });
    }
  };

  const handleGuardiasChange = (text) => {
    if (/^\d*$/.test(text)) {
      const numValue = parseInt(text) || 0;
      if (numValue > 6) {
        setRegisterForm({ ...registerForm, numero_guardias: "6" });
      } else if (numValue < 1 && text !== "") {
        setRegisterForm({ ...registerForm, numero_guardias: "1" });
      } else {
        setRegisterForm({ ...registerForm, numero_guardias: text });
      }
    }
  };

  // Función para eliminar locación de la base de datos
  const handleDeleteLocation = async (locationId, locationName) => {
    try {
      setDeleteLocationId(locationId);

      const response = await fetch(`${API_URL}/auth/users/${locationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete location");
      }

      // Eliminar del estado local después de éxito en el backend
      setLocations(locations.filter((location) => location._id !== locationId));
      Alert.alert("Éxito", `Locación "${locationName}" eliminada correctamente`);
    } catch (error) {
      console.error("Error deleting location:", error);
      Alert.alert("Error", error.message || "No se pudo eliminar la locación");
    } finally {
      setDeleteLocationId(null);
    }
  };

  const confirmDeleteLocation = (locationId, locationName) => {
    Alert.alert(
      "Eliminar Locación",
      `¿Estás seguro de que quieres eliminar la locación "${locationName}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => handleDeleteLocation(locationId, locationName),
        },
      ]
    );
  };

  // Render item para la lista de locaciones
  const renderLocationItem = ({ item }) => (
    <View style={styles.locationItem}>
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationName}>{item.username}</Text>
          <View style={styles.guardCountBadge}>
            <Ionicons name="people-outline" size={14} color="#fff" />
            <Text style={styles.guardCountText}>{item.numero_guardias}</Text>
          </View>
        </View>
        <Text style={styles.locationDate}>
          Creado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteLocationButton}
        onPress={() => confirmDeleteLocation(item._id, item.username)}
        disabled={deleteLocationId === item._id}
      >
        {deleteLocationId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        )}
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* SOLUCIÓN: Usar ScrollView con refreshControl en lugar de View */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Botón para crear nueva locación/usuario - Solo visible para admin */}
        {user?.admin === "valido" && (
          <TouchableOpacity
            style={styles.addLocationButton}
            onPress={() => setShowRegisterModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addLocationButtonText}>Nueva Locación</Text>
          </TouchableOpacity>
        )}

        {/* Lista de Locaciones - Solo visible para admin */}
        {user?.admin === "valido" && (
          <View style={styles.locationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Locaciones Registradas</Text>
              <Text style={styles.locationsCount}>{locations.length} locaciones</Text>
            </View>

            {/* SOLUCIÓN: Cambiar FlatList por ScrollView + map cuando hay muchos elementos */}
            {locations.length > 0 ? (
              <View style={styles.locationsListContainer}>
                {locations.map((item) => (
                  <View key={item._id}>{renderLocationItem({ item })}</View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyLocationsContainer}>
                <Ionicons name="business-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.emptyLocationsText}>No hay locaciones registradas</Text>
                <Text style={styles.emptyLocationsSubtext}>
                  Presiona "Nueva Locación" para agregar la primera
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Registro */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowRegisterModal(false);
          resetRegisterForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              {/* Header del Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Registrar Nueva Locación</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowRegisterModal(false);
                    resetRegisterForm();
                  }}
                >
                  <Ionicons name="close-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                {/* Usuario Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Usuario</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de usuario"
                      placeholderTextColor={COLORS.placeholderText}
                      value={registerForm.username}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, username: text })}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Contraseña Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="******"
                      placeholderTextColor={COLORS.placeholderText}
                      value={registerForm.password}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Número de Guardias Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número de Guardias</Text>
                  <View style={styles.guardiasContainer}>
                    <TouchableOpacity
                      style={styles.guardiasButton}
                      onPress={decrementGuardias}
                      disabled={parseInt(registerForm.numero_guardias) <= 1}
                    >
                      <Ionicons
                        name="remove-outline"
                        size={20}
                        color={
                          parseInt(registerForm.numero_guardias) <= 1 ? COLORS.gray : COLORS.primary
                        }
                      />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.guardiasInput}
                      value={registerForm.numero_guardias}
                      onChangeText={handleGuardiasChange}
                      keyboardType="numeric"
                      textAlign="center"
                    />

                    <TouchableOpacity
                      style={styles.guardiasButton}
                      onPress={incrementGuardias}
                      disabled={parseInt(registerForm.numero_guardias) >= 6}
                    >
                      <Ionicons
                        name="add-outline"
                        size={20}
                        color={
                          parseInt(registerForm.numero_guardias) >= 6 ? COLORS.gray : COLORS.primary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.guardiasNote}>Mínimo: 1 guardia, Máximo: 6 guardias</Text>
                </View>

                {/* Botones del Modal */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowRegisterModal(false);
                      resetRegisterForm();
                    }}
                    disabled={registerLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.registerButton]}
                    onPress={handleRegister}
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.registerButtonText}>Registrar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
