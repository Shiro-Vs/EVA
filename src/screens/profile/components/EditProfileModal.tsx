import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { auth, storage } from "../../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUser: {
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
  };
}

export const EditProfileModal = ({ visible, onClose, currentUser }: Props) => {
  const [name, setName] = useState(currentUser.displayName || "");
  const [image, setImage] = useState(currentUser.photoURL || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Needed for sensitive changes
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Animation State (similar to WalletFilterModal)
  const translateY = React.useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    if (visible) {
      // Slide UP animation on open
      translateY.setValue(Dimensions.get("window").height);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();

      setName(currentUser.displayName || "");
      setImage(currentUser.photoURL || null);
      setPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setShowPasswordFields(false);
    }
  }, [visible, currentUser]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      // Close threshold (dragged down > 150 or fast flick)
      if (translationY > 150 || velocityY > 1000) {
        Animated.timing(translateY, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onClose());
      } else {
        // Spring back
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }).start();
      }
    }
  };

  // ... (keeping pickImage and uploadImageToFirebase and handleSave same)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso Denegado",
        "Necesitamos permiso para acceder a tu galería."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Optional if we want to debug
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri: string) => {
    if (!auth.currentUser) return null;
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileRef = ref(
        storage,
        `profile_pictures/${auth.currentUser.uid}.jpg`
      );

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Upload error: ", error);
      Alert.alert("Error", "Falló la subida de la imagen");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      let photoURL = currentUser.photoURL;

      // 1. Upload new image if selected and different from original
      if (image && image !== currentUser.photoURL) {
        const uploadedUrl = await uploadImageToFirebase(image);
        if (uploadedUrl) {
          photoURL = uploadedUrl;
        }
      }

      // 2. Update Auth Profile (Name & Photo)
      if (
        (name.trim() !== "" && name !== currentUser.displayName) ||
        photoURL !== currentUser.photoURL
      ) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoURL,
        });
      }

      // 2. Update Password (if requested)
      if (showPasswordFields && password !== "") {
        if (password !== confirmPassword) {
          Alert.alert("Error", "las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          Alert.alert(
            "Error",
            "La contraseña debe tener al menos 6 caracteres"
          );
          setLoading(false);
          return;
        }

        // Re-auth is often required for password changes
        if (currentPassword === "") {
          Alert.alert(
            "Requerido",
            "Por favor ingresa tu contraseña actual para confirmar el cambio."
          );
          setLoading(false);
          return;
        }

        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, password);
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "La contraseña actual es incorrecta.");
      } else if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Seguridad",
          "Por favor cierra sesión y vuelve a ingresar para realizar cambios sensibles."
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo actualizar el perfil: " + error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none" // We handle animation manually
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              {/* Wrapper for Gesture Handler to capture event properly */}
              <View style={{ width: "100%" }}>
                <PanGestureHandler
                  onGestureEvent={onGestureEvent}
                  onHandlerStateChange={onHandlerStateChange}
                  activeOffsetY={10} // Only activate if dragged down 10px
                  activeOffsetX={[-500, 500]} // Ignore horizontal drags
                >
                  <Animated.View
                    style={[
                      styles.modalContent,
                      {
                        transform: [
                          {
                            translateY: translateY.interpolate({
                              inputRange: [0, Dimensions.get("window").height],
                              outputRange: [0, Dimensions.get("window").height],
                              extrapolate: "clamp",
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {/* Swipe Handle */}
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                      <Text style={styles.title}>Editar Perfil</Text>
                      <TouchableOpacity onPress={onClose} disabled={loading}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {/* Avatar Upload */}
                    <View style={styles.avatarContainer}>
                      <TouchableOpacity
                        onPress={pickImage}
                        style={styles.avatarWrapper}
                      >
                        <Image
                          source={{
                            uri:
                              image ||
                              `https://ui-avatars.com/api/?name=${
                                name || "User"
                              }&background=00E0FF&color=000`,
                          }}
                          style={styles.avatar}
                        />
                        <View style={styles.cameraIconBadge}>
                          <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.changePhotoText}>
                        Toca para cambiar foto
                      </Text>
                    </View>

                    {/* Name Field */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Nombre</Text>
                      <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Tu nombre"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    {/* Email (Read Only) */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Correo Electrónico</Text>
                      <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={currentUser.email || ""}
                        editable={false}
                      />
                      <Text style={styles.helperText}>
                        El correo no se puede cambiar aquí.
                      </Text>
                    </View>

                    {/* Change Password Toggle */}
                    <TouchableOpacity
                      style={styles.togglePasswordBtn}
                      onPress={() => setShowPasswordFields(!showPasswordFields)}
                    >
                      <Text style={styles.togglePasswordText}>
                        {showPasswordFields
                          ? "Cancelar cambio de contraseña"
                          : "Cambiar contraseña"}
                      </Text>
                    </TouchableOpacity>

                    {/* Password Fields */}
                    {showPasswordFields && (
                      <View style={styles.passwordSection}>
                        <View style={styles.field}>
                          <Text style={styles.label}>
                            Contraseña Actual (Requerida)
                          </Text>
                          <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Tu contraseña actual"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Nueva Contraseña</Text>
                          <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Nueva contraseña"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>
                            Confirmar Nueva Contraseña
                          </Text>
                          <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Repite la nueva contraseña"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                          />
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>
                          Guardar Cambios
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.background,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  togglePasswordBtn: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  togglePasswordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  passwordSection: {
    marginBottom: 8,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
