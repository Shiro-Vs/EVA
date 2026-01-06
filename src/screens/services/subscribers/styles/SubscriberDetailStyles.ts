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
    fontSize: 20,
    fontWeight: "900",
    color: colors.success,
    lineHeight: 24,
  },
  gridPendingText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.error,
  },
  gridAmount: {
    display: "none",
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    textAlign: "center",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: {
    padding: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.secondary, fontWeight: "bold" },

  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "bold",
  },

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
