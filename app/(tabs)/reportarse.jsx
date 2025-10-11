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
import styles from "../../assets/styles/reportarse.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { useGuardiasStore } from "../../store/guardiasStore";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../constants/api";

export default function Reporte() {
  const { guardiasActualizados, resetGuardiasActualizados } = useGuardiasStore();

  const [locacion, setLocacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [guardiasActivos, setGuardiasActivos] = useState([]);
  const [cargandoGuardias, setCargandoGuardias] = useState(true);
  const [reporteEnviado, setReporteEnviado] = useState(false);
  const [verificandoReporte, setVerificandoReporte] = useState(false);
  const [horaCreacionReporte, setHoraCreacionReporte] = useState(null);
  const [ultimaHoraVerificada, setUltimaHoraVerificada] = useState(null);

  const router = useRouter();
  const { token, user } = useAuthStore();

  // Función para calcular la hora_de_reporte (SIEMPRE usa la hora actual en punto)
  const calcularHoraReporte = () => {
    const ahora = new Date();
    const hora = ahora.getHours();
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  // Función para determinar si está en tiempo o atrasado
  const determinarInTime = () => {
    const ahora = new Date();
    const minutos = ahora.getMinutes();
    return minutos <= 20 ? "en tiempo" : "atrasado";
  };

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaActual = () => {
    const ahora = new Date();
    return ahora.toISOString().split("T")[0]; // Retorna "2025-10-04"
  };

  // Verificar si el USUARIO ya hizo un reporte para esta hora (CORREGIDO)
  const verificarReporteExistente = async (forzarVerificacion = false) => {
    if (!user || !locacion) return;

    const horaActual = calcularHoraReporte();
    const fechaActual = obtenerFechaActual();

    // No verificar de nuevo si ya verificamos esta misma hora recientemente (a menos que sea forzado)
    if (!forzarVerificacion && ultimaHoraVerificada === horaActual && reporteEnviado) {
      return;
    }

    try {
      setVerificandoReporte(true);
      setUltimaHoraVerificada(horaActual);

      const response = await fetch(`${API_URL}/reporte/verificar/${locacion}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        console.log("=== VERIFICACIÓN REPORTE ===");
        console.log("Hora actual:", horaActual);
        console.log("Fecha actual:", fechaActual);
        console.log("Ubicación:", locacion);
        console.log("Reporte existe:", data.existe);
        console.log("Hora del reporte:", data.reporte?.hora_de_reporte);
        console.log("Fecha del reporte:", data.reporte?.createdAt);
        console.log("Reporte enviado:", data.existe);
        console.log("===========================");

        setReporteEnviado(data.existe);
        setHoraCreacionReporte(data.horaCreacion);
      } else {
        setReporteEnviado(false);
        setHoraCreacionReporte(null);
      }
    } catch (error) {
      console.error("Error al verificar reporte:", error);
      setReporteEnviado(false);
      setHoraCreacionReporte(null);
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
        await verificarGuardiasActivos();
        await verificarReporteExistente(true); // Forzar verificación al cargar
      } else {
        setUserData(null);
        setLocacion("");
        setGuardiasActivos([]);
        setCargandoGuardias(false);
      }
    };

    cargarDatos();
  }, [user, token]);

  // Verificar reporte existente cuando cambia la hora (MEJORADO)
  useEffect(() => {
    const verificarCadaMinuto = () => {
      const ahora = new Date();
      const minutos = ahora.getMinutes();

      // Verificar cada minuto, pero solo forzar verificación en minutos específicos
      if (minutos === 0 || minutos === 30) {
        // Verificar en punto y a los 30 minutos
        verificarReporteExistente(true);
      } else {
        verificarReporteExistente();
      }
    };

    // Verificar inmediatamente al montar el componente
    verificarReporteExistente(true);

    const interval = setInterval(verificarCadaMinuto, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [user, locacion]);

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
        quality: 0.4, // ✅ REDUCIDO de 0.2 a 0.3 para mejor calidad sin exceso
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
    console.log("=== ENVÍO DE REPORTE ===");
    console.log("Fecha actual:", obtenerFechaActual());
    console.log("Hora actual:", calcularHoraReporte());
    console.log("Reporte ya enviado (antes):", reporteEnviado);
    console.log("Ubicación:", locacion);
    console.log("Guardias activos:", guardiasActivos.length);
    console.log("=====================");

    if (guardiasActivos.length === 0) {
      Alert.alert("Error", "No hay guardias activos para crear el reporte");
      return;
    }

    if (!descripcion) {
      Alert.alert("Error", "La descripción es requerida");
      return;
    }

    // Verificación LOCAL inmediata antes de enviar
    if (reporteEnviado) {
      Alert.alert("Información", "Ya has enviado un reporte para esta hora");
      return;
    }

    try {
      setLoading(true);

      const hora_de_reporte = calcularHoraReporte();
      const in_time = determinarInTime();

      // Obtener array de nombres de todos los guardias activos
      const nombresGuardias = guardiasActivos.map((g) => g.nombre);

      const formData = new FormData();
      formData.append("location", locacion);
      formData.append("guardias", nombresGuardias.join(", "));
      formData.append("descripcion", descripcion);
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
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.reporteExistente) {
          // ACTUALIZACIÓN INMEDIATA del estado local
          setReporteEnviado(true);
          setHoraCreacionReporte(responseData.reporte?.createdAt || new Date());
          Alert.alert("Información", "Ya has enviado un reporte para esta hora");
          return;
        }
        throw new Error(responseData.message || "Error al crear el reporte");
      }

      // REPORTE EXITOSO - ACTUALIZACIÓN INMEDIATA
      Alert.alert("Éxito", "¡El reporte ha sido registrado correctamente!");

      // 1. Actualizar estado inmediatamente
      setReporteEnviado(true);
      setHoraCreacionReporte(responseData.reporte?.createdAt || new Date());

      // 2. Limpiar formulario
      setDescripcion("");
      setImage(null);

      // 3. Forzar verificación inmediata con el servidor
      setTimeout(() => {
        verificarReporteExistente(true);
      }, 500);

      console.log("=== REPORTE ENVIADO EXITOSAMENTE ===");
      console.log("Fecha:", obtenerFechaActual());
      console.log("Hora:", hora_de_reporte);
      console.log("Ubicación:", locacion);
      console.log("Guardias incluidos:", nombresGuardias);
      console.log("===================================");
    } catch (error) {
      console.error("Error al crear reporte:", error);
      Alert.alert("Error", error.message || "Algo salió mal al crear el reporte");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear solo la hora
  const formatHora = (fecha) => {
    if (!fecha) return "Cargando...";
    try {
      const date = new Date(fecha);
      return date.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "Error";
    }
  };

  // Función para formatear fecha completa
  const formatFecha = (fecha) => {
    if (!fecha) return "No registrada";
    try {
      const date = new Date(fecha);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Error";
    }
  };

  // Si no hay usuario
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

  // Si está cargando
  if (cargandoGuardias || verificandoReporte) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {verificandoReporte ? "Verificando reportes..." : "Verificando estado de guardias..."}
          </Text>
        </View>
      </View>
    );
  }

  // Si no hay guardias activos
  if (guardiasActivos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.warning} />
          <Text style={styles.title}>No hay guardias activos</Text>
          <Text style={styles.subtitle}>No hay entradas activas para crear reportes</Text>
          <Text style={styles.infoText}>
            Para crear un reporte, primero debes registrar una entrada para al menos un guardia.
          </Text>
        </View>
      </View>
    );
  }

  // Si ya se envió un reporte para esta hora
  if (reporteEnviado) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          {/* <Ionicons name="checkmark-done-circle" size={60} color={COLORS.success} /> */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={60} color={COLORS.success} />
          </View>
          <Text style={styles.title}>Reporte Enviado</Text>
          <Text style={styles.subtitle}>
            Ya has enviado un reporte para esta hora ({calcularHoraReporte()})
          </Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{locacion}</Text>

            <Text style={styles.infoLabel}>Guardias activos:</Text>
            <Text style={styles.infoValue}>{guardiasActivos.map((g) => g.nombre).join(", ")}</Text>

            <Text style={styles.infoLabel}>Hora de envío:</Text>
            <Text style={styles.infoValue}>{formatHora(horaCreacionReporte)}</Text>

            <Text style={styles.infoLabel}>Fecha de envío:</Text>
            <Text style={styles.infoValue}>
              {horaCreacionReporte
                ? new Date(horaCreacionReporte).toLocaleDateString("es-ES")
                : "N/A"}
            </Text>

            <Text style={styles.infoLabel}>Próximo reporte:</Text>
            <Text style={styles.infoValue}>
              {parseInt(calcularHoraReporte().split(":")[0]) + 1}:00
            </Text>
          </View>

          <Text style={styles.infoText}>
            Solo puedes enviar un reporte por hora. El próximo reporte estará disponible en la
            siguiente hora en punto.
          </Text>
        </View>
      </View>
    );
  }

  // Mostrar formulario de reporte
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear Reporte</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{locacion}</Text>

            <Text style={styles.infoLabel}>Guardias activos:</Text>
            <Text style={styles.infoValue}>{guardiasActivos.map((g) => g.nombre).join(", ")}</Text>

            <Text style={styles.infoLabel}>Hora de reporte:</Text>
            <Text style={styles.infoValue}>{calcularHoraReporte()}</Text>

            <Text style={styles.infoLabel}>Fecha actual:</Text>
            <Text style={styles.infoValue}>{obtenerFechaActual()}</Text>

            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={styles.infoValue}>
              {determinarInTime() === "en tiempo" ? "En tiempo ✅" : "Atrasado ⚠️"}
            </Text>

            <Text style={styles.infoLabel}>Entradas activas:</Text>
            {guardiasActivos.map((guardia, index) => (
              <View key={index} style={styles.guardiaItem}>
                <Text style={styles.guardiaNombre}>{guardia.nombre}</Text>
                <Text style={styles.guardiaHora}>Entrada: {formatFecha(guardia.entrada)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ingresa la descripción del reporte"
              placeholderTextColor={COLORS.placeholderTexts}
              multiline={true}
              numberOfLines={4}
            />
          </View>

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
                <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Crear Reporte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
