import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
  },
  headerDate: {
    flex: 4,
  },
  headerlocation: {
    flex: 6,
    marginLeft: 6,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingTop: 15,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    backgroundColor: COLORS.grayLight,
    padding: 15,
    borderRadius: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  limpiarFiltrosButton: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 16,
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
