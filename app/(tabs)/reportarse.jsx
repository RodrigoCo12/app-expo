// import { useState, useEffect } from "react";
// import React from "react";
// import {
//   View,
//   Text,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Image,
//   ActivityIndicator,
//   TextInput,
// } from "react-native";
// import { useRouter } from "expo-router";
// import styles from "../../assets/styles/create.styles";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors";
// import { useAuthStore } from "../../store/authStore";
// import * as ImagePicker from "expo-image-picker";
// import { API_URL } from "../../constants/api";

// export default function Reporte() {
//   const [locacion, setLocacion] = useState("");
//   const [numeroGuardia, setNumeroGuardia] = useState(null);
//   const [descripcion, setDescripcion] = useState("");
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [entradaRegistrada, setEntradaRegistrada] = useState(null);
//   const [cargandoGuardias, setCargandoGuardias] = useState(true);
//   const [guardiasActivos, setGuardiasActivos] = useState({});

//   const router = useRouter();
//   const { token, user } = useAuthStore();

//   // Función para calcular la hora_de_reporte (hora en punto)
//   const calcularHoraReporte = () => {
//     const ahora = new Date();
//     const hora = ahora.getHours();
//     return `${hora.toString().padStart(2, "0")}:00`;
//   };

//   // Función para determinar si está en tiempo o atrasado
//   const determinarInTime = () => {
//     const ahora = new Date();
//     const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
//     const horaReporte = calcularHoraReporte();
//     const [horaStr] = horaReporte.split(":");
//     const minutosReporte = parseInt(horaStr) * 60;

//     return minutosActuales - minutosReporte <= 20 ? "en tiempo" : "atrasado";
//   };

//   // Cargar datos del usuario y verificar guardias activos
//   useEffect(() => {
//     const cargarDatos = async () => {
//       if (user) {
//         setUserData(user);
//         setLocacion(user.username);

//         // Verificar estado de todos los guardias
//         await verificarGuardiasActivos();

//         // Si el usuario tiene exactamente 1 guardia, seleccionarlo automáticamente
//         if (user.numero_guardias === 1) {
//           setNumeroGuardia(1);
//         }
//       } else {
//         // Si user es null, resetear el estado
//         setUserData(null);
//         setLocacion("");
//         setNumeroGuardia(null);
//         setCargandoGuardias(false);
//       }
//     };

//     cargarDatos();
//   }, [user, token]);

//   // Verificar estado de todos los guardias del usuario
//   const verificarGuardiasActivos = async () => {
//     try {
//       setCargandoGuardias(true);
//       const activos = {};

//       // Verificar cada guardia del usuario
//       for (let i = 1; i <= user.numero_guardias; i++) {
//         const response = await fetch(`${API_URL}/entrada/activo/${user.username}/${i}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.ok) {
//           const entradaActiva = await response.json();
//           activos[i] = entradaActiva;

//           // Si este guardia está activo y es el único, establecerlo como entrada registrada
//           if (entradaActiva && user.numero_guardias === 1) {
//             setEntradaRegistrada(entradaActiva);
//           }
//         }
//       }

//       setGuardiasActivos(activos);
//     } catch (error) {
//       console.error("Error al verificar guardias activos:", error);
//     } finally {
//       setCargandoGuardias(false);
//     }
//   };

//   // Cuando se selecciona un número de guardia
//   const handleSeleccionGuardia = async (numero) => {
//     setNumeroGuardia(numero);

//     // Verificar si este guardia específico está activo
//     if (guardiasActivos[numero]) {
//       setEntradaRegistrada(guardiasActivos[numero]);
//     } else {
//       setEntradaRegistrada(null);
//     }
//   };

//   const pickImage = async () => {
//     try {
//       if (Platform.OS !== "web") {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para subir una imagen");
//           return;
//         }
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.2,
//       });

//       if (!result.canceled) {
//         setImage(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error al seleccionar imagen:", error);
//       Alert.alert("Error", "Hubo un problema al seleccionar tu imagen");
//     }
//   };

//   // Crear reporte
//   const handleSubmit = async () => {
//     if (!entradaRegistrada || !entradaRegistrada.nombre) {
//       Alert.alert("Error", "No hay una entrada activa para crear el reporte");
//       return;
//     }

//     if (!descripcion) {
//       Alert.alert("Error", "La descripción es requerida");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Calcular valores para el reporte
//       const hora_de_reporte = calcularHoraReporte();
//       const in_time = determinarInTime();

//       // Obtener el nombre del guardia de la entrada activa
//       const guardia = entradaRegistrada.nombre;

//       // Crear el reporte
//       const formData = new FormData();
//       formData.append("location", locacion);
//       formData.append("guardia", guardia);
//       formData.append("descripcion", descripcion);
//       formData.append("numero_guardia", numeroGuardia.toString());
//       formData.append("hora_de_reporte", hora_de_reporte);
//       formData.append("in_time", in_time);

//       if (image) {
//         const fileType = image.split(".").pop();
//         const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

//         formData.append("image", {
//           uri: image,
//           name: `reporte_image.${fileType}`,
//           type: mimeType,
//         });
//       }

//       const response = await fetch(`${API_URL}/reporte`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//         body: formData,
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData.message || "Error al crear el reporte");
//       }

//       Alert.alert("Éxito", "¡El reporte ha sido registrado correctamente!");
//       setDescripcion("");
//       setImage(null);
//     } catch (error) {
//       console.error("Error al crear reporte:", error);
//       Alert.alert("Error", error.message || "Algo salió mal al crear el reporte");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generar opciones para el selector de número de guardia
//   const generarOpcionesGuardias = () => {
//     if (!userData || !userData.numero_guardias || userData.numero_guardias < 1) return [];

//     const opciones = [];
//     for (let i = 1; i <= userData.numero_guardias; i++) {
//       opciones.push(i);
//     }
//     return opciones;
//   };

//   const opcionesGuardias = generarOpcionesGuardias();

//   // Formatear fecha para mostrar
//   const formatFecha = (fecha) => {
//     if (!fecha) return "No registrada";

//     const date = new Date(fecha);
//     return date.toLocaleString("es-ES", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Si no hay usuario (logout), mostrar mensaje o redirigir
//   if (!user) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.title}>Sesión no iniciada</Text>
//           <Text style={styles.subtitle}>Por favor inicia sesión para acceder a esta función</Text>
//           <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
//             <Text style={styles.buttonText}>Ir a Login</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   // Si está cargando la verificación de guardias
//   if (cargandoGuardias) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.card}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Verificando estado de guardias...</Text>
//         </View>
//       </View>
//     );
//   }

//   // Si el usuario tiene más de un guardia y no se ha seleccionado uno, mostrar selector
//   if (user.numero_guardias > 1 && !numeroGuardia) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.title}>Seleccionar Guardia</Text>
//           <Text style={styles.subtitle}>Elige el número de guardia a reportar</Text>

//           <View style={styles.selectorContainerGrande}>
//             {opcionesGuardias.map((numero) => (
//               <TouchableOpacity
//                 key={numero}
//                 style={[
//                   styles.selectorOptionGrande,
//                   guardiasActivos[numero] && styles.selectorOptionActivo,
//                 ]}
//                 onPress={() => handleSeleccionGuardia(numero)}
//               >
//                 <Ionicons
//                   name={guardiasActivos[numero] ? "checkmark-circle" : "person-outline"}
//                   size={40}
//                   color={guardiasActivos[numero] ? COLORS.success : COLORS.text}
//                 />
//                 <Text style={styles.selectorOptionTextGrande}>Guardia {numero}</Text>
//                 <Text style={styles.selectorOptionEstado}>
//                   {guardiasActivos[numero] ? "ACTIVO" : "INACTIVO"}
//                 </Text>
//                 {guardiasActivos[numero] && (
//                   <Text style={styles.selectorOptionNombre}>{guardiasActivos[numero].nombre}</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </View>
//     );
//   }

//   // Si no hay entrada activa para el guardia seleccionado
//   if (numeroGuardia && !entradaRegistrada) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.card}>
//           <Ionicons name="alert-circle-outline" size={60} color={COLORS.warning} />
//           <Text style={styles.title}>Guardia {numeroGuardia} - INACTIVO</Text>
//           <Text style={styles.subtitle}>
//             No hay una entrada activa para el Guardia {numeroGuardia}
//           </Text>
//           <Text style={styles.infoText}>
//             Para crear un reporte, primero debes registrar una entrada para este guardia.
//           </Text>

//           {user.numero_guardias > 1 && (
//             <TouchableOpacity
//               style={[styles.button, styles.secondaryButton]}
//               onPress={() => setNumeroGuardia(null)}
//             >
//               <Ionicons
//                 name="arrow-back-outline"
//                 size={20}
//                 color={COLORS.text}
//                 style={styles.buttonIcon}
//               />
//               <Text style={[styles.buttonText, styles.secondaryButtonText]}>
//                 Seleccionar otro guardia
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   }

//   // Mostrar formulario de reporte solo si hay una entrada activa
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
//         <View style={styles.card}>
//           <Text style={styles.title}>Crear Reporte - Guardia {numeroGuardia}</Text>

//           <View style={styles.infoContainer}>
//             <Text style={styles.infoLabel}>Nombre del Guardia:</Text>
//             <Text style={styles.infoValue}>{entradaRegistrada.nombre}</Text>

//             <Text style={styles.infoLabel}>Ubicación:</Text>
//             <Text style={styles.infoValue}>{entradaRegistrada.locacion}</Text>

//             <Text style={styles.infoLabel}>Hora de entrada:</Text>
//             <Text style={styles.infoValue}>{formatFecha(entradaRegistrada.entrada)}</Text>

//             <Text style={styles.infoLabel}>Hora de reporte calculada:</Text>
//             <Text style={styles.infoValue}>{calcularHoraReporte()}</Text>

//             <Text style={styles.infoLabel}>Estado:</Text>
//             <Text style={styles.infoValue}>
//               {determinarInTime() === "en tiempo" ? "En tiempo ✅" : "Atrasado ⚠️"}
//             </Text>
//           </View>

//           {/* Descripción */}
//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Descripción*</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               value={descripcion}
//               onChangeText={setDescripcion}
//               placeholder="Ingresa la descripción del reporte"
//               placeholderTextColor={COLORS.textSecondary}
//               multiline={true}
//               numberOfLines={4}
//             />
//           </View>

//           {/* Imagen */}
//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Imagen (Opcional)</Text>
//             <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
//               {image ? (
//                 <Image source={{ uri: image }} style={styles.previewImage} />
//               ) : (
//                 <View style={styles.placeholderContainer}>
//                   <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
//                   <Text style={styles.placeholderText}>Toca para seleccionar imagen</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={handleSubmit}
//             disabled={loading || !descripcion}
//           >
//             {loading ? (
//               <ActivityIndicator color={COLORS.white} />
//             ) : (
//               <>
//                 <Ionicons
//                   name="document-text-outline"
//                   size={20}
//                   color={COLORS.white}
//                   style={styles.buttonIcon}
//                 />
//                 <Text style={styles.buttonText}>Crear Reporte</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {user.numero_guardias > 1 && (
//             <TouchableOpacity
//               style={[styles.button, styles.secondaryButton]}
//               onPress={() => {
//                 setNumeroGuardia(null);
//                 setEntradaRegistrada(null);
//                 setDescripcion("");
//                 setImage(null);
//               }}
//             >
//               <Ionicons
//                 name="arrow-back-outline"
//                 size={20}
//                 color={COLORS.text}
//                 style={styles.buttonIcon}
//               />
//               <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cambiar Guardia</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }
import { useState, useEffect } from "react";
import React from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../constants/api";

export default function Reporte() {
  const [locacion, setLocacion] = useState("");
  const [numeroGuardia, setNumeroGuardia] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [entradaRegistrada, setEntradaRegistrada] = useState(null);
  const [cargandoGuardias, setCargandoGuardias] = useState(true);
  const [guardiasActivos, setGuardiasActivos] = useState({});
  const [reporteEnviado, setReporteEnviado] = useState(false);
  const [verificandoReporte, setVerificandoReporte] = useState(false);

  const router = useRouter();
  const { token, user } = useAuthStore();

  // Función para calcular la hora_de_reporte (hora en punto)
  const calcularHoraReporte = () => {
    const ahora = new Date();
    const hora = ahora.getHours();
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  // Función para determinar si está en tiempo o atrasado
  const determinarInTime = () => {
    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    const horaReporte = calcularHoraReporte();
    const [horaStr] = horaReporte.split(":");
    const minutosReporte = parseInt(horaStr) * 60;

    return minutosActuales - minutosReporte <= 20 ? "en tiempo" : "atrasado";
  };

  // Verificar si ya existe un reporte para la hora actual
  const verificarReporteExistente = async () => {
    if (!entradaRegistrada || !entradaRegistrada.nombre) return;

    try {
      setVerificandoReporte(true);
      const response = await fetch(
        `${API_URL}/reporte/verificar/${locacion}/${entradaRegistrada.nombre}/${numeroGuardia}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReporteEnviado(data.existe);
      }
    } catch (error) {
      console.error("Error al verificar reporte:", error);
    } finally {
      setVerificandoReporte(false);
    }
  };

  // Cargar datos del usuario y verificar guardias activos
  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        setUserData(user);
        setLocacion(user.username);

        // Verificar estado de todos los guardias
        await verificarGuardiasActivos();

        // Si el usuario tiene exactamente 1 guardia, seleccionarlo automáticamente
        if (user.numero_guardias === 1) {
          setNumeroGuardia(1);
        }
      } else {
        // Si user is null, resetear el estado
        setUserData(null);
        setLocacion("");
        setNumeroGuardia(null);
        setCargandoGuardias(false);
      }
    };

    cargarDatos();
  }, [user, token]);

  // Verificar reporte existente cuando cambia la entrada registrada
  useEffect(() => {
    if (entradaRegistrada) {
      verificarReporteExistente();
    }
  }, [entradaRegistrada]);

  // Verificar estado de todos los guardias del usuario
  const verificarGuardiasActivos = async () => {
    try {
      setCargandoGuardias(true);
      const activos = {};

      // Verificar cada guardia del usuario
      for (let i = 1; i <= user.numero_guardias; i++) {
        const response = await fetch(`${API_URL}/entrada/activo/${user.username}/${i}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const entradaActiva = await response.json();
          activos[i] = entradaActiva;

          // Si este guardia está activo y es el único, establecerlo como entrada registrada
          if (entradaActiva && user.numero_guardias === 1) {
            setEntradaRegistrada(entradaActiva);
          }
        }
      }

      setGuardiasActivos(activos);
    } catch (error) {
      console.error("Error al verificar guardias activos:", error);
    } finally {
      setCargandoGuardias(false);
    }
  };

  // Cuando se selecciona un número de guardia
  const handleSeleccionGuardia = async (numero) => {
    setNumeroGuardia(numero);
    setReporteEnviado(false);

    // Verificar si este guardia específico está activo
    if (guardiasActivos[numero]) {
      setEntradaRegistrada(guardiasActivos[numero]);
    } else {
      setEntradaRegistrada(null);
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para subir una imagen");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar tu imagen");
    }
  };

  // Crear reporte
  const handleSubmit = async () => {
    if (!entradaRegistrada || !entradaRegistrada.nombre) {
      Alert.alert("Error", "No hay una entrada activa para crear el reporte");
      return;
    }

    if (!descripcion) {
      Alert.alert("Error", "La descripción es requerida");
      return;
    }

    if (reporteEnviado) {
      Alert.alert("Información", "Ya has enviado un reporte para esta hora");
      return;
    }

    try {
      setLoading(true);

      // Calcular valores para el reporte
      const hora_de_reporte = calcularHoraReporte();
      const in_time = determinarInTime();

      // Obtener el nombre del guardia de la entrada activa
      const guardia = entradaRegistrada.nombre;

      // Crear el reporte
      const formData = new FormData();
      formData.append("location", locacion);
      formData.append("guardia", guardia);
      formData.append("descripcion", descripcion);
      formData.append("numero_guardia", numeroGuardia.toString());
      formData.append("hora_de_reporte", hora_de_reporte);
      formData.append("in_time", in_time);

      if (image) {
        const fileType = image.split(".").pop();
        const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

        formData.append("image", {
          uri: image,
          name: `reporte_image.${fileType}`,
          type: mimeType,
        });
      }

      const response = await fetch(`${API_URL}/reporte`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.reporteExistente) {
          setReporteEnviado(true);
          Alert.alert("Información", "Ya has enviado un reporte para esta hora");
          return;
        }
        throw new Error(responseData.message || "Error al crear el reporte");
      }

      Alert.alert("Éxito", "¡El reporte ha sido registrado correctamente!");
      setReporteEnviado(true);
      setDescripcion("");
      setImage(null);
    } catch (error) {
      console.error("Error al crear reporte:", error);
      Alert.alert("Error", error.message || "Algo salió mal al crear el reporte");
    } finally {
      setLoading(false);
    }
  };

  // Generar opciones para el selector de número de guardia
  const generarOpcionesGuardias = () => {
    if (!userData || !userData.numero_guardias || userData.numero_guardias < 1) return [];

    const opciones = [];
    for (let i = 1; i <= userData.numero_guardias; i++) {
      opciones.push(i);
    }
    return opciones;
  };

  const opcionesGuardias = generarOpcionesGuardias();

  // Formatear fecha para mostrar
  const formatFecha = (fecha) => {
    if (!fecha) return "No registrada";

    const date = new Date(fecha);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Si no hay usuario (logout), mostrar mensaje o redirigir
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sesión no iniciada</Text>
          <Text style={styles.subtitle}>Por favor inicia sesión para acceder a esta función</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>Ir a Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Si está cargando la verificación de guardias
  if (cargandoGuardias) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Verificando estado de guardias...</Text>
        </View>
      </View>
    );
  }

  // Si el usuario tiene más de un guardia y no se ha seleccionado uno, mostrar selector
  if (user.numero_guardias > 1 && !numeroGuardia) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Seleccionar Guardia</Text>
          <Text style={styles.subtitle}>Elige el número de guardia a reportar</Text>

          <View style={styles.selectorContainerGrande}>
            {opcionesGuardias.map((numero) => (
              <TouchableOpacity
                key={numero}
                style={[
                  styles.selectorOptionGrande,
                  guardiasActivos[numero] && styles.selectorOptionActivo,
                ]}
                onPress={() => handleSeleccionGuardia(numero)}
              >
                <Ionicons
                  name={guardiasActivos[numero] ? "checkmark-circle" : "person-outline"}
                  size={40}
                  color={guardiasActivos[numero] ? COLORS.success : COLORS.text}
                />
                <Text style={styles.selectorOptionTextGrande}>Guardia {numero}</Text>
                <Text style={styles.selectorOptionEstado}>
                  {guardiasActivos[numero] ? "ACTIVO" : "INACTIVO"}
                </Text>
                {guardiasActivos[numero] && (
                  <Text style={styles.selectorOptionNombre}>{guardiasActivos[numero].nombre}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Si no hay entrada activa para el guardia seleccionado
  if (numeroGuardia && !entradaRegistrada) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.warning} />
          <Text style={styles.title}>Guardia {numeroGuardia} - INACTIVO</Text>
          <Text style={styles.subtitle}>
            No hay una entrada activa para el Guardia {numeroGuardia}
          </Text>
          <Text style={styles.infoText}>
            Para crear un reporte, primero debes registrar una entrada para este guardia.
          </Text>

          {user.numero_guardias > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setNumeroGuardia(null)}
            >
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={COLORS.text}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Seleccionar otro guardia
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Si ya se envió un reporte para esta hora
  if (reporteEnviado) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="checkmark-done-circle" size={60} color={COLORS.success} />
          <Text style={styles.title}>Reporte Enviado</Text>
          <Text style={styles.subtitle}>
            Ya has enviado un reporte para esta hora ({calcularHoraReporte()})
          </Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Guardia:</Text>
            <Text style={styles.infoValue}>{entradaRegistrada.nombre}</Text>

            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{entradaRegistrada.locacion}</Text>

            <Text style={styles.infoLabel}>Hora de reporte:</Text>
            <Text style={styles.infoValue}>{calcularHoraReporte()}</Text>
          </View>

          <Text style={styles.infoText}>Puedes enviar otro reporte en la próxima hora.</Text>

          {user.numero_guardias > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setNumeroGuardia(null);
                setEntradaRegistrada(null);
                setReporteEnviado(false);
              }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={COLORS.text}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cambiar Guardia</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Mostrar formulario de reporte solo si hay una entrada activa y no se ha enviado reporte
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear Reporte - Guardia {numeroGuardia}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Nombre del Guardia:</Text>
            <Text style={styles.infoValue}>{entradaRegistrada.nombre}</Text>

            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{entradaRegistrada.locacion}</Text>

            <Text style={styles.infoLabel}>Hora de entrada:</Text>
            <Text style={styles.infoValue}>{formatFecha(entradaRegistrada.entrada)}</Text>

            <Text style={styles.infoLabel}>Hora de reporte calculada:</Text>
            <Text style={styles.infoValue}>{calcularHoraReporte()}</Text>

            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={styles.infoValue}>
              {determinarInTime() === "en tiempo" ? "En tiempo ✅" : "Atrasado ⚠️"}
            </Text>
          </View>

          {/* Descripción */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ingresa la descripción del reporte"
              placeholderTextColor={COLORS.textSecondary}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Imagen */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Imagen (Opcional)</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}>Toca para seleccionar imagen</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading || !descripcion}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Crear Reporte</Text>
              </>
            )}
          </TouchableOpacity>

          {user.numero_guardias > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setNumeroGuardia(null);
                setEntradaRegistrada(null);
                setDescripcion("");
                setImage(null);
                setReporteEnviado(false);
              }}
            >
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={COLORS.text}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cambiar Guardia</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
