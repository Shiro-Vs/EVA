import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Fondo transparente controlado por el componente padre o nulo
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.0)", // Transparente total como pediste
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "90%", // Más estrecho
    maxWidth: 400, // Límite máximo menor
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 15, // Menos padding interno
    shadowColor: "#3ed2ffff",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    // Borde para separar del fondo transparente
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
