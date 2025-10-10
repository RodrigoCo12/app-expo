import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    flexGrow: 1,
    padding: 10,
  },

  // Header
  header: {
    marginBottom: 15,
  },

  // Grupos de ubicación
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  guardCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  // Tarjetas de guardias activos
  activeGuardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginBottom: 8,
  },
  activeGuardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    width: 70,
  },
  activeGuardValue: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  activeGuardStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },

  // Botones de acción
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonIcon: {
    marginRight: 8,
  },

  // Botón limpiar filtros
  limpiarFiltrosButton: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  limpiarFiltrosText: {
    marginLeft: 6,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "500",
  },

  // Estados vacíos
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  // Scroll container
  activeGuardsScroll: {
    flex: 1,
  },
});

export default styles;
