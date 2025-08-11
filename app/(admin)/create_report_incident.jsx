import { useState, useEffect } from "react";
import React from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../constants/api";
import { Picker } from "@react-native-picker/picker";
import DateTimeSelector from "../../components/DateTimeSelector";
import PosicionSelector from "../../components/PosicionSelector";
export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null); // Estado para el usuario actualizado

  const router = useRouter();
  const { token, user, setUser } = useAuthStore(); // Asegúrate de que setUser esté disponible

  // Función para obtener el estado actualizado del usuario
  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/user-status/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener el estado del usuario");

      const data = await response.json();

      // Actualiza el usuario en el store si hay cambios
      if (data.location !== user.location || data.status !== user.status) {
        setUser({ ...user, location: data.location, status: data.status });
        setCurrentUser({ ...user, location: data.location, status: data.status });
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  // Polling cada 30 segundos cuando la pantalla está enfocada
  useEffect(
    React.useCallback(() => {
      const intervalId = setInterval(fetchUserStatus, 30000); // 30 segundos

      // Ejecutar inmediatamente al montar
      fetchUserStatus();

      return () => clearInterval(intervalId);
    }, [user?.id, token])
  );
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

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      // formData.append("incidentDate", selectedDate.toISOString());
      // No necesitamos enviar location ya que se obtendrá del usuario en el backend

      if (image) {
        const fileType = image.split(".").pop();
        const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

        formData.append("image", {
          uri: image,
          name: `incident_image.${fileType}`,
          type: mimeType,
        });
      }

      const response = await fetch(`${API_URL}/incident`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al reportar el incidente");
      }

      Alert.alert("Éxito", "¡El reporte de incidente ha sido creado!");
      resetForm();
      // router.push("/incidents");
    } catch (error) {
      console.error("Error al crear incidente:", error);
      Alert.alert("Error", error.message || "Algo salió mal al crear el reporte");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    // setSelectedPost(null);
    // setSelectedDate(new Date());
    setImage(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/* HEADER */}

          {/* Puesto de Vigilancia */}
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.userLocation}>{user?.location || "No especificada"}</Text>
            </View>
            {/* Título del Incidente */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título del Incidente*</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Persona sospechosa en perimetro"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Fecha y Hora */}
            {/* <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha y Hora del Incidente*</Text>
              <DateTimeSelector
                onDateTimeChange={setSelectedDate}
                mode="datetime"
                initialDate={selectedDate}
              />
            </View> */}

            {/* Imagen */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen del Incidente (Opcional)</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Toca para seleccionar imagen</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Descripción */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción del Incidente*</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describa el incidente detalladamente..."
                placeholderTextColor={COLORS.placeholderText}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Reportar Incidente</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
