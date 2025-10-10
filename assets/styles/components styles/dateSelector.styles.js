// dateSelector.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../../constants/colors";

const styles = StyleSheet.create({
  filtrosContainer: {
    // marginBottom: 15,
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
    height: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    flex: 1,
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
    padding: 10,
    marginLeft: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
  },
  // Estos estilos probablemente van en otro archivo (index_admin.styles)
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
});

export default styles;
