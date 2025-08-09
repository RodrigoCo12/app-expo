import { useState, useEffect } from "react";
import React from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
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
import PosicionSelector from "../../components/PosicionSelector";

export default function Create() {
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const router = useRouter();
  const { token, user } = useAuthStore();

  // Función para obtener el estado actual del usuario
  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/user-status/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUserStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  // Cargar el estado al montar el componente
  useEffect(() => {
    if (user?.id) {
      fetchUserStatus();
    }
  }, [user?.id]);

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

  const updateUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          location: location,
          status: "activo",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al actualizar el perfil del usuario");
      }

      return responseData;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert("Error", "Por favor completa la ubicación");
      return;
    }

    try {
      setLoading(true);

      // Primero actualizar el perfil del usuario
      await updateUserProfile();

      // Luego crear el reporte
      const formData = new FormData();
      formData.append("location", location);

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
        throw new Error(responseData.message || "Error al crear el reporte");
      }

      Alert.alert("Éxito", "¡El reporte ha sido creado y tu perfil ha sido actualizado!");
      resetForm();
      setUserStatus("activo");
      // router.push("/reportes");
    } catch (error) {
      console.error("Error al crear reporte:", error);
      Alert.alert(
        "Error",
        error.message || "Algo salió mal al crear el reporte o actualizar tu perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  const setStatusToInactive = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          status: "inactivo",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al actualizar el estado");
      }

      setUserStatus("inactivo");
      Alert.alert("Éxito", "Tu estado ha sido cambiado a inactivo");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Alert.alert("Error", error.message || "Algo salió mal al cambiar tu estado");
    } finally {
      setStatusLoading(false);
    }
  };

  const resetForm = () => {
    setLocation("");
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

          {/* Ubicación */}
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Puesto de Vigilancia*</Text>
              <PosicionSelector selectedPost={location} setSelectedPost={setLocation} />
            </View>

            {/* Imagen */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen del Reporte (Opcional)</Text>
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
                  <Text style={styles.buttonText}>Crear Reporte</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sección de estado del usuario */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Estado actual:{" "}
                <Text style={{ fontWeight: "bold" }}>{userStatus || "Cargando..."}</Text>
              </Text>

              {userStatus === "activo" && (
                <TouchableOpacity
                  style={[styles.button, styles.inactiveButton]}
                  onPress={setStatusToInactive}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="power-outline"
                        size={20}
                        color={COLORS.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Cambiar a Inactivo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
