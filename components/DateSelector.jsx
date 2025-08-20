import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import COLORS from "../constants/colors";
import styles from "../assets/styles/components styles/dateSelector.styles";

const DateSelector = ({
  selectedDate,
  onDateChange,
  onClearDate,
  placeholder = "Seleccionar fecha",
  label = "Filtrar por fecha:",
  maximumDate = new Date(),
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date && event.type === "set") {
      onDateChange(date);
    }
  };

  const formatDate = (date) => {
    if (!date) return placeholder;
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const showPicker = () => {
    if (Platform.OS === "android") {
      setShowDatePicker(true);
    } else {
      // Para iOS, mostramos el picker directamente
      setShowDatePicker(true);
    }
  };

  return (
    <View style={styles.filtrosContainer}>
      {label && <Text style={styles.filtroLabel}>{label}</Text>}

      <TouchableOpacity style={styles.datePickerButton} onPress={showPicker}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={[styles.datePickerText, !selectedDate && styles.placeholderText]}>
          {formatDate(selectedDate)}
        </Text>

        {selectedDate && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onClearDate();
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={maximumDate}
          locale="es-ES"
          positiveButton={{ label: "OK", textColor: COLORS.primary }}
          negativeButton={{ label: "Cancelar", textColor: COLORS.danger }}
        />
      )}
    </View>
  );
};

export default DateSelector;
