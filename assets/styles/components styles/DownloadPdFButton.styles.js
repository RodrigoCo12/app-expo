import { StyleSheet } from "react-native";
import COLORS from "../../../constants/colors";

const styles = StyleSheet.create({
  // Botones de descarga
  downloadButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 10,
  },
  downloadAllButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    marginHorizontal: 10,
  },
  downloadAllText: {
    color: COLORS.white,
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default styles;
