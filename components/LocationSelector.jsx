import { useAuthStore } from "../store/authStore";
import { API_URL } from "../constants/api";
import COLORS from "../constants/colors";
import styles from "../assets/styles/components styles/locationSelector.styles";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LocationSelector = ({
  selectedLocation,
  onLocationChange,
  onClearLocation,
  placeholder = "Seleccionar ubicación",
  label = "Filtrar por ubicación:",
}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const { token } = useAuthStore();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      const nonAdminUsers = users.filter((user) => user.admin !== "valido");
      const userLocations = nonAdminUsers.map((user) => user.username);
      const uniqueLocations = [...new Set(userLocations)].sort();

      setLocations(uniqueLocations);
    } catch (error) {
      console.log("Error fetching locations:", error);
      Alert.alert("Error", "No se pudieron cargar las ubicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationSelect = (location) => {
    onLocationChange(location);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClearLocation();
    setShowDropdown(false);
  };

  const measureButton = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setDropdownPosition({ x, y: y + height, width });
  };

  // CORRECCIÓN: Mostrar clear button solo cuando hay una ubicación específica seleccionada
  const showClearButton = selectedLocation && selectedLocation !== "Todos";

  if (loading) {
    return (
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtroLabel}>{label}</Text>
        <View style={styles.locationPickerButton}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.locationPickerText}>Cargando ubicaciones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.filtrosContainer}>
      <Text style={styles.filtroLabel}>{label}</Text>

      <View style={styles.locationSelectorContainer}>
        <TouchableOpacity
          style={styles.locationPickerButton}
          onPress={() => setShowDropdown(!showDropdown)}
          onLayout={measureButton}
        >
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.locationPickerText, !selectedLocation && styles.placeholderText]}>
            {selectedLocation || placeholder}
          </Text>

          {/* CORRECCIÓN: Solo mostrar clear button cuando hay una ubicación específica seleccionada */}
          {showClearButton && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}

          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
          // style={{ height: "20" }}
        >
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.locationDropdown,
                  {
                    top: dropdownPosition.y,
                    width: dropdownPosition.width,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.locationOption}
                  onPress={() => handleLocationSelect("Todos")}
                >
                  <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.locationOptionText}>Todas las ubicaciones</Text>
                </TouchableOpacity>

                {locations.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.locationOption,
                      selectedLocation === location && styles.locationOptionSelected,
                    ]}
                    onPress={() => handleLocationSelect(location)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={selectedLocation === location ? COLORS.white : COLORS.text}
                    />
                    <Text
                      style={[
                        styles.locationOptionText,
                        selectedLocation === location && styles.locationOptionTextSelected,
                      ]}
                    >
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

export default LocationSelector;
