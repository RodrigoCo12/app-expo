// export default DateSelector;
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import styles from "../assets/styles/components styles/dateSelector.styles";

const DateSelector = ({
  selectedDate,
  onDateChange,
  onClearDate,
  placeholder = "Seleccionar fecha",
  label = "Fecha:",
  showClearButton = false,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      onDateChange(date);
    }
  };

  const formatDate = (date) => {
    if (!date) return placeholder;

    const today = new Date();
    const selected = new Date(date);

    if (selected.toDateString() === today.toDateString()) {
      return "Hoy";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (selected.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selected.toDateString() === tomorrow.toDateString()) {
      return "Mañana";
    }

    return selected.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.filtrosContainer}>
      <Text style={styles.filtroLabel}>{label}</Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.datePickerButton}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLORS.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.datePickerText, !selectedDate && styles.placeholderText]}>
            {formatDate(selectedDate)}
          </Text>
        </TouchableOpacity>

        {/* {showClearButton && (
          <TouchableOpacity onPress={onClearDate} style={styles.clearButton}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        )} */}
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

export default DateSelector;
