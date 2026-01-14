import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 0,
  },
  viewToggle: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for FAB
  },
  // LIST STYLES
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  iconText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  cost: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  // GRID STYLES
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: "48%", // 2 columns with space
    alignItems: "center",
    // Optional: Border indicating color
    borderWidth: 1,
    borderColor: "transparent",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gridIconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    resizeMode: "cover",
  },
  gridIconText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  gridName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  gridCost: {
    fontSize: 18,
    fontWeight: "900", // Heavy weight
    color: colors.text,
    marginBottom: 12,
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  sharedBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selectionHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  selectionIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});
