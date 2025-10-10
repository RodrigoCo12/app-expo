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
  header: {
    marginBottom: 15,
  },
  activeGuardsScroll: {
    flex: 1,
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
  locationGroupWithoutGuards: {
    marginBottom: 20,
    backgroundColor: COLORS.white + "80",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border + "80",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  locationHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  locationWithoutGuards: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontStyle: "italic",
  },
  locationSubtitle: {
    marginLeft: 7,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  guardCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 10,
  },
  guardCountZero: {
    fontSize: 12,
    color: COLORS.textSecondary + "80",
    marginRight: 10,
    fontStyle: "italic",
  },

  // Tabla de reportes
  reportesTable: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowEven: {
    backgroundColor: COLORS.lightGray,
  },
  tableRowWithoutGuards: {
    opacity: 0.6,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: COLORS.text,
    textAlign: "center",
  },
  tableCellWithoutGuards: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 8,
  },
  statusCell: {
    fontWeight: "600",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: "hidden",
  },
  statusOnTime: {
    backgroundColor: COLORS.success + "20",
    color: COLORS.success,
  },
  statusLate: {
    backgroundColor: COLORS.error + "20",
    color: COLORS.error,
  },
  statusNoReport: {
    backgroundColor: COLORS.warning + "20",
    color: COLORS.warning,
  },
  statusNoGuards: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "normal",
    fontStyle: "italic",
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

  // Modal de detalles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 0,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "400",
  },
  statusValue: {
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },

  // Guardias en modal
  guardiaReporte: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  guardiaActiva: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  guardiaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  guardiaNombre: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  guardiaRol: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  guardiaDetalles: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  guardiaIcono: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
    textAlign: "center",
  },
  noGuardiasText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
  },

  // Modal de período
  periodoModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 0,
    width: "90%",
    maxHeight: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  periodoModalBody: {
    padding: 20,
  },
  periodoModalText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  periodoModalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodoModalButtonActive: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  periodoModalButtonText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  periodoModalButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  periodoModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  periodoModalCancel: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  periodoModalCancelText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  periodoModalConfirm: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  periodoModalConfirmText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "bold",
  },
});

export default styles;
