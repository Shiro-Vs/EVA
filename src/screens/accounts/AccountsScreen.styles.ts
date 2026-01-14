import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

// Predefined colors for categories
export const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#FF9F43",
  "#54A0FF",
  "#2ECC71",
  "#FD79A8",
  "#A3CB38",
];

// Predefined icons for categories
export const CATEGORY_ICONS = [
  "fast-food",
  "bus",
  "game-controller",
  "medkit",
  "school",
  "cart",
  "home",
  "shirt",
  "airplane",
  "construct",
  "gift",
  "cash",
];

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary + "30", // Translucent primary
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  activeTabText: {
    color: colors.primary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 224, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  itemSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  amount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
  },
  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  rowWrap: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: "bold",
    fontSize: 14,
  },
  // Category Specific
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#FFF",
  },
  iconSelect: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
