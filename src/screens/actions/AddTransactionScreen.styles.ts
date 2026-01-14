import { StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    height: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  resetText: {
    color: colors.primary,
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "#3A3A3C",
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFF",
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 5,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "bold",
    minWidth: 100,
    textAlign: "center",
  },
  rowContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  labelSmall: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  valueText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  categoryContainer: {
    marginBottom: 25,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 4,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  catText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  inputGroupTop: {
    marginBottom: 25,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 56,
  },
  noteInputSmall: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  saveText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateModalContent: {
    width: "90%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  paymentModalContent: {
    width: "80%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: "italic",
    marginLeft: 10,
  },
});

export const SCREEN_HEIGHT_CONST = SCREEN_HEIGHT;
