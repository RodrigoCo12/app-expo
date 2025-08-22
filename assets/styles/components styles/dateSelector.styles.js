import { StyleSheet } from "react-native";
import COLORS from "../../../constants/colors";

const styles = StyleSheet.create({
  // Estilos para el DateSelector
  filtrosContainer: {
    // marginBottom: 15,
    width: "100%",
    // backgroundColor: "#4f344f",
    height: 50,
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
    height: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    // marginBottom: 10,
  },
  datePickerText: {
    marginLeft: 5,
    fontSize: 13,
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
    // padding: 10,
    marginTop: 10,
  },
  limpiarFiltrosText: {
    marginLeft: 6,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default styles;
