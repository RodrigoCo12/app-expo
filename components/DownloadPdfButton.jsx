import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import styles from "../assets/styles/components styles/DownloadPdFButton.styles";

const DownloadPdfButton = ({
  onPress,
  downloading = false,
  label = "Descargar PDF",
  variant = "default",
}) => {
  if (variant === "primary") {
    return (
      <TouchableOpacity
        style={[styles.downloadAllButton, downloading && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={downloading}
      >
        {downloading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons name="download-outline" size={20} color={COLORS.white} />
        )}
        <Text style={styles.downloadAllText}>{downloading ? "Generando..." : label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.downloadButton} onPress={onPress} disabled={downloading}>
      {downloading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Ionicons name="download-outline" size={20} color={COLORS.white} />
      )}
      <Text style={styles.downloadAllText}>{downloading ? "Generando..." : label}</Text>
    </TouchableOpacity>
  );
};

export default DownloadPdfButton;
