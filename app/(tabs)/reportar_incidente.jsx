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
import styles from "../../assets/styles/reportar_incidente.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useGuardiasStore } from "../../store/guardiasStore";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../constants/api";

export default function ReporteIncidente() {
  const { guardiasActualizados, resetGuardiasActualizados } = useGuardiasStore();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [guardiasActivos, setGuardiasActivos] = useState([]);
  const [cargandoGuardias, setCargandoGuardias] = useState(true);

  const router = useRouter();
  const { token, user } = useAuthStore();

  // Cargar datos del usuario y verificar guardias activos
  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        setUserData(user);
        await verificarGuardiasActivos();
      } else {
        setUserData(null);
        setGuardiasActivos([]);
        setCargandoGuardias(false);
      }
    };

    cargarDatos();
  }, [user, token]);

  // Efecto para detectar cambios en guardias
  useEffect(() => {
    if (guardiasActualizados) {
      verificarGuardiasActivos();
      resetGuardiasActualizados();
    }
  }, [guardiasActualizados]);

  // Verificar estado de todos los guardias del usuario
  const verificarGuardiasActivos = async () => {
    try {
      setCargandoGuardias(true);
      const activos = [];

      // Verificar cada guardia del usuario
      for (let i = 1; i <= user.numero_guardias; i++) {
        const response = await fetch(`${API_URL}/entrada/activo/${user.username}/${i}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const entradaActiva = await response.json();
          if (entradaActiva) {
            activos.push(entradaActiva);
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
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar tu imagen");
    }
  };

  // Crear reporte de incidente
  const handleSubmit = async () => {
    if (!titulo) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    if (!descripcion) {
      Alert.alert("Error", "La descripción es requerida");
      return;
    }

    if (guardiasActivos.length === 0) {
      Alert.alert("Error", "No hay guardias activos para reportar el incidente");
      return;
    }

    try {
      setLoading(true);

      // Obtener nombres de todos los guardias activos
      const nombresGuardias = guardiasActivos.map((g) => g.nombre).join(", ");

      // ✅ CORRECCIÓN: Eliminar numero_guardia del objeto ya que no se usa
      const incidenteData = {
        title: titulo,
        description: descripcion,
        guardia: nombresGuardias, // Todos los guardias activos
        location: user.username,
        // ❌ ELIMINADO: numero_guardia: null, // Ya no se usa ni se envía
      };

      // ✅ OPTIMIZACIÓN: Reducir calidad de imagen al 0.3 (30%)
      if (image) {
        const formData = new FormData();

        // Agregar todos los campos al FormData
        Object.keys(incidenteData).forEach((key) => {
          formData.append(key, incidenteData[key]);
        });

        const fileType = image.split(".").pop();
        const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

        formData.append("image", {
          uri: image,
          name: `incidente_image.${fileType}`,
          type: mimeType,
        });

        const response = await fetch(`${API_URL}/incidente`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Error al crear el reporte de incidente");
        }

        Alert.alert("Éxito", "¡El reporte de incidente ha sido registrado correctamente!");
      } else {
        // Sin imagen, enviar como JSON normal
        const response = await fetch(`${API_URL}/incidente`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(incidenteData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Error al crear el reporte de incidente");
        }

        Alert.alert("Éxito", "¡El reporte de incidente ha sido registrado correctamente!");
      }

      // Limpiar formulario después del éxito
      setTitulo("");
      setDescripcion("");
      setImage(null);
    } catch (error) {
      console.error("Error al crear reporte de incidente:", error);
      Alert.alert("Error", error.message || "Algo salió mal al crear el reporte de incidente");
    } finally {
      setLoading(false);
    }
  };

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

  // Si no hay guardias activos
  if (guardiasActivos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons
            style={{ alignSelf: "center" }}
            name="alert-circle-outline"
            size={60}
            color={COLORS.warning}
          />
          <Text style={styles.title}>No hay guardias activos</Text>
          <Text style={styles.subtitle}>No hay entradas activas para reportar incidentes</Text>
          <Text style={styles.infoText}>
            Para reportar un incidente, primero debes registrar una entrada para al menos un
            guardia.
          </Text>
        </View>
      </View>
    );
  }

  // Mostrar formulario de reporte de incidente
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Reportar Incidente</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{user.username}</Text>

            <Text style={styles.infoLabel}>Guardias activos:</Text>
            <Text style={styles.infoValue}>{guardiasActivos.map((g) => g.nombre).join(", ")}</Text>

            <Text style={styles.infoLabel}>Total de guardias activos:</Text>
            <Text style={styles.infoValue}>{guardiasActivos.length}</Text>

            <Text style={styles.infoLabel}>Hora de entrada más reciente:</Text>
            <Text style={styles.infoValue}>{formatFecha(guardiasActivos[0]?.entrada)}</Text>
          </View>

          {/* Título del incidente */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Título del Incidente*</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ingresa el título del incidente"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Descripción */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el incidente en detalle"
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
            disabled={loading || !titulo || !descripcion}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Reportar Incidente</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
