import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60, // Espacio para la barra de estado
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para Navbar
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 5,
  },
  balance: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "bold",
  },
});
