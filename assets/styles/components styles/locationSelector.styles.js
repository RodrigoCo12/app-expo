// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../../constants/colors";

const styles = StyleSheet.create({
  // Estilos para el LocationSelector
  // Estilos para el LocationSelector con Modal
  locationSelectorContainer: {
    position: "relative",
    zIndex: 1000,
  },
  locationPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  locationPickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  locationDropdown: {
    position: "absolute",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  locationOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  locationOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  locationOptionTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  filtrosContainer: {
    marginBottom: 15,
    width: "100%",
  },
  filtroLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  clearButton: {
    padding: 4,
  },
  limpiarFiltrosButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  limpiarFiltrosText: {
    marginLeft: 6,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  locationSelectorContainer: {
    position: "relative",
    zIndex: 1000,
  },
  locationPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  locationPickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  locationDropdown: {
    position: "absolute",
    top: "100%",
    // left: 0,
    // right: ,
    alignSelf: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    maxHeight: 200,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  locationOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  locationOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  locationOptionTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default styles;
