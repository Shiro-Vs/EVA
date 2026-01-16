import { StyleSheet } from "react-native";
import { colors } from "../../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingsButton: {
    padding: 8,
    marginLeft: "auto",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  infoContainer: {
    flexDirection: "column",
  },
  name: { fontSize: 18, fontWeight: "bold", color: colors.text },
  info: { fontSize: 13, color: colors.textSecondary },

  // SUMMARY Styles (2 Cards Layout)
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    // borderColor set dynamically
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summarySub: {
    fontSize: 10,
    color: colors.textSecondary,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 2,
  },

  // FILTER Styles
  listHeaderContainer: {
    paddingHorizontal: 15,
    marginVertical: 15, // Increased vertical spacing
  },
  yearFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 5,
    borderRadius: 20,
    gap: 20,
    alignSelf: "center",
  },
  yearFilterText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },

  // GRID Styles (Modified for Compactness with Large Text)
  gridList: {
    paddingHorizontal: 10,
    paddingBottom: 150,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1.4,
    borderRadius: 12, // Increased slightly
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5, // Slightly thicker for dashed visibility
    borderColor: "rgba(255,255,255,0.15)", // Default subtle border
    borderStyle: "dashed", // GLOBAL DASHED STYLE
  },
  gridItemPending: {
    borderColor: "rgba(255, 68, 68, 0.5)", // Stronger border color
    backgroundColor: "rgba(255, 68, 68, 0.05)",
  },
  gridItemPaid: {
    borderColor: "rgba(0, 200, 83, 0.5)", // Stronger border color
    backgroundColor: "rgba(0, 200, 83, 0.05)",
  },
  gridItemEmpty: {
    borderColor: "rgba(255,255,255,0.1)",
    // Inherits dashed
  },

  // LARGE FONT SIZES
  gridMonth: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  gridPaidDate: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  gridPendingText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.error,
  },
  gridAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.success,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: {
    padding: 15,
  },
  cancelButtonText: { color: colors.textSecondary },

  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  confirmButtonText: { color: "#000", fontWeight: "bold" },

  // LIST VIEW STYLES
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  listItemPending: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  listItemPaid: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemMonth: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    textTransform: "capitalize",
  },
  listItemSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  listAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.success,
  },
  listStatus: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },

  // Modal Options
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  optionTextCancel: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    width: "100%",
  },
});
