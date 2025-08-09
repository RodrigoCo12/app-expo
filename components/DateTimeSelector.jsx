import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Opcional: para soporte de español

import styles from "../assets/styles/create.styles";
const DateTimeSelector = ({
  initialDate = new Date(),
  onDateTimeChange,
  mode = "datetime",
  minimumDate,
  maximumDate,
}) => {
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");

  useEffect(() => {
    onDateTimeChange(date);
  }, [date]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (pickerMode === "date") {
      setDate(currentDate);
      if (mode === "datetime") {
        // Después de seleccionar fecha, mostrar el selector de hora
        setPickerMode("time");
        if (Platform.OS === "ios") return;
        setShowDatePicker(true);
      }
    } else {
      // Combinar la fecha seleccionada con la hora seleccionada
      const combinedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes()
      );
      setDate(combinedDate);
      setPickerMode("date");
    }
  };

  const showDatepicker = () => {
    setPickerMode("date");
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setPickerMode("time");
    setShowDatePicker(true);
  };

  const formatDate = (dateToFormat) => {
    return format(dateToFormat, "P", { locale: es }); // Formato de fecha en español
  };

  const formatTime = (dateToFormat) => {
    return format(dateToFormat, "HH:mm");
  };

  return (
    <View style={stylees.container}>
      <View style={stylees.selectorContainer}>
        <TouchableOpacity onPress={showDatepicker} style={styles.inputDateContainer}>
          <Text style={styles.input}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {(mode === "datetime" || mode === "time") && (
          <TouchableOpacity onPress={showTimepicker} style={styles.inputDateContainer}>
            <Text style={styles.input}>{formatTime(date)}</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          is24Hour={true}
          // display={pickerMode === "Date" ? "Calendar" : "spiner"}
          display={"spinner"}
          onChange={onChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale="es-ES" // Opcional: para español
        />
      )}

      {Platform.OS === "ios" && showDatePicker && (
        <TouchableOpacity style={stylees.doneButton} onPress={() => setShowDatePicker(false)}>
          <Text style={stylees.doneButtonText}>Listo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const stylees = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  selectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  selectorButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectorText: {
    fontSize: 12,
    color: "#333",
  },
  doneButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DateTimeSelector;
