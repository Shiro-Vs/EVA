import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 100, // Limitamos ventana antes del navbar
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.surface,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});
