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

  // Header y filtros
  header: {
    marginBottom: 15,
    width: "100%",
    flexDirection: "row",
  },
  headerDate: {
    flex: 4,
  },
  headerLocation: {
    flex: 6,
    marginLeft: 6,
  },
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

  // Tarjetas de incidentes
  incidentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginRight: 10,
  },
  locationHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 10,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    // marginLeft: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Información básica
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },

  // Contenido expandido
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  guardiaSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  guardiaInfo: {
    // Estilos para la información del guardia
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
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

  // Loader
  footerLoader: {
    marginVertical: 20,
  },

  // Botones (si los necesitas)
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default styles;
