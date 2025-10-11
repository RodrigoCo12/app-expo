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
import styles from "../../assets/styles/index_guardia.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useGuardiasStore } from "../../store/guardiasStore";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../constants/api";

export default function Entrada() {
  const { setGuardiasActualizados } = useGuardiasStore();
  const [locacion, setLocacion] = useState("");
  const [numeroGuardia, setNumeroGuardia] = useState(null);
  const [nombre, setNombre] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [entradaRegistrada, setEntradaRegistrada] = useState(null);
  const [registrandoSalida, setRegistrandoSalida] = useState(false);
  const [cargandoGuardias, setCargandoGuardias] = useState(true);
  const [guardiasActivos, setGuardiasActivos] = useState({});

  const router = useRouter();
  const { token, user } = useAuthStore();

  // Solicitar permisos de cámara al cargar el componente
  useEffect(() => {
    const solicitarPermisosCamara = async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permiso de cámara requerido",
            "Necesitamos acceso a tu cámara para tomar fotos"
          );
        }
      }
    };

    solicitarPermisosCamara();
  }, []);

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
        // Si user es null, resetear el estado
        setUserData(null);
        setLocacion("");
        setNumeroGuardia(null);
        setCargandoGuardias(false);
      }
    };

    cargarDatos();
  }, [user, token]);

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

    // Verificar si este guardia específico está activo
    if (guardiasActivos[numero]) {
      setEntradaRegistrada(guardiasActivos[numero]);
    } else {
      setEntradaRegistrada(null);
    }
  };

  // Tomar foto con la cámara (OBLIGATORIA)
  const takePhoto = async () => {
    try {
      // Verificar permisos de cámara
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
          if (newStatus !== "granted") {
            Alert.alert("Permiso denegado", "Necesitamos acceso a tu cámara para tomar fotos");
            return;
          }
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "Hubo un problema al tomar la foto");
    }
  };

  // Eliminar foto seleccionada
  const removePhoto = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!locacion) {
      Alert.alert("Error", "La ubicación es requerida");
      return;
    }

    if (!nombre) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    if (!numeroGuardia) {
      Alert.alert("Error", "Debes seleccionar un número de guardia");
      return;
    }

    // VALIDACIÓN DE FOTO OBLIGATORIA
    if (!image) {
      Alert.alert("Error", "Debes tomar una foto para registrar la entrada");
      return;
    }

    // CONFIRMACIÓN ANTES DE REGISTRAR ENTRADA
    Alert.alert(
      "Confirmar Entrada",
      `¿Estás seguro de registrar la entrada para el Guardia ${numeroGuardia}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setLoading(true);

              // Crear la entrada
              const formData = new FormData();
              formData.append("locacion", locacion);
              formData.append("numero_guardia", numeroGuardia.toString());
              formData.append("nombre", nombre);

              // La imagen ahora es obligatoria
              const fileType = image.split(".").pop();
              const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

              formData.append("image", {
                uri: image,
                name: `entrada_image.${fileType}`,
                type: mimeType,
              });

              const response = await fetch(`${API_URL}/entrada`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
                body: formData,
              });

              const responseData = await response.json();

              if (!response.ok) {
                throw new Error(responseData.message || "Error al crear la entrada");
              }

              Alert.alert("Éxito", "¡La entrada ha sido registrada correctamente!");
              setEntradaRegistrada(responseData);
              setGuardiasActualizados("entrada", numeroGuardia);
              setGuardiasActivos((prev) => ({ ...prev, [numeroGuardia]: responseData }));
            } catch (error) {
              console.error("Error al crear entrada:", error);
              Alert.alert("Error", error.message || "Algo salió mal al crear la entrada");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRegistrarSalida = async () => {
    if (!entradaRegistrada || !entradaRegistrada._id) {
      Alert.alert("Error", "No se puede registrar la salida");
      return;
    }

    // CONFIRMACIÓN ANTES DE REGISTRAR SALIDA
    Alert.alert(
      "Confirmar Salida",
      `¿Estás seguro de registrar la salida para el Guardia ${numeroGuardia}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setRegistrandoSalida(true);

              const response = await fetch(`${API_URL}/entrada/${entradaRegistrada._id}/salida`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const responseData = await response.json();

              if (!response.ok) {
                throw new Error(responseData.message || "Error al registrar la salida");
              }

              Alert.alert("Éxito", "¡La salida ha sido registrada correctamente!");
              setGuardiasActualizados("salida", numeroGuardia);
              setEntradaRegistrada(null);

              if (user && user.numero_guardias > 1) {
                setNumeroGuardia(null);
              }

              setGuardiasActivos((prev) => ({ ...prev, [numeroGuardia]: null }));
              resetForm();
            } catch (error) {
              console.error("Error al registrar salida:", error);
              Alert.alert("Error", error.message || "Algo salió mal al registrar la salida");
            } finally {
              setRegistrandoSalida(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNombre("");
    setImage(null);
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
          <Text style={styles.subtitle}>Elige el número de guardia a registrar</Text>

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
                  {guardiasActivos[numero] ? "ACTIVO" : "DISPONIBLE"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Si el guardia seleccionado está activo, mostrar pantalla de salida
  if (entradaRegistrada) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          {userData.numero_guardias > 1 ? (
            <Text style={styles.title}>Guardia {numeroGuardia}</Text>
          ) : (
            ""
          )}

          <View style={styles.estadoContainer}>
            <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
            <Text style={styles.estadoTexto}>ESTADO: ACTIVO</Text>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{entradaRegistrada.nombre}</Text>

              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue}>{entradaRegistrada.locacion}</Text>

              <Text style={styles.infoLabel}>Hora de entrada:</Text>
              <Text style={styles.infoValue}>{formatFecha(entradaRegistrada.entrada)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegistrarSalida}
            disabled={registrandoSalida}
          >
            {registrandoSalida ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Registrar Salida</Text>
              </>
            )}
          </TouchableOpacity>

          {user.numero_guardias > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setNumeroGuardia(null);
                setEntradaRegistrada(null);
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

  // Mostrar formulario de entrada si el guardia no está activo
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {userData.numero_guardias > 1 ? (
            <Text style={styles.title}>Registrar Entrada - Guardia {numeroGuardia}</Text>
          ) : (
            ""
          )}

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.titleCardText}>{locacion || user?.username}</Text>
            </View>

            {/* Campo para ingresar el nombre */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingresa el nombre completo.."
                placeholderTextColor={COLORS.placeholderText}
              />
            </View>

            {/* Imagen - MODIFICADO: Obligatoria */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto*</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={takePhoto}>
                {image ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={removePhoto}>
                      <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="camera" size={40} color={COLORS.primary} />
                    <Text style={styles.placeholderText}>Toca para tomar foto</Text>
                    <Text style={styles.placeholderSubtext}>
                      Obligatorio - Usa la cámara de tu dispositivo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {!image && (
                <Text style={styles.requiredText}>
                  * La foto es obligatoria para registrar la entrada
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!nombre || !numeroGuardia || !image) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !nombre || !numeroGuardia || !image}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Registrar Entrada</Text>
                </>
              )}
            </TouchableOpacity>

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
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cambiar Guardia</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
