import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    // padding: 12,
  },

  listContainer: {
    flexGrow: 1,
    padding: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  activeGuardsScroll: {
    flex: 1,
  },
  locationGroup: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 8,
  },
  guardCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  activeGuardCard: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 10,
    // padding: 15,
    marginBottom: 10,
  },
  lastGuardCard: {
    marginBottom: 0,
  },
  activeGuardInfoContainer: {
    marginLeft: 5,
  },
  activeGuardInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activeGuardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginLeft: 8,
    width: 70,
  },
  activeGuardValue: {
    fontSize: 14,
    color: COLORS.textDark,
    marginLeft: 5,
    flex: 1,
  },
  //   activeGuardStatus: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     marginTop: 10,
  //     paddingTop: 10,
  //     borderTopWidth: 1,
  //     borderTopColor: COLORS.grayLight,
  //   },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activeGuardStatusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.success,
  },
  limpiarFiltrosButton: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  limpiarFiltrosText: {
    marginLeft: 6,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default styles;
