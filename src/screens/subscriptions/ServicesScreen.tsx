import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { Service } from "../../services/subscriptionService";
import { EditServiceModal } from "../../components/modals/services/EditServiceModal";
import { CustomAlertModal } from "../../components/common/CustomAlertModal";

import { styles } from "./ServicesScreen.styles";
import { useServices } from "./useServices";

export default function ServicesScreen() {
  const {
    services,
    loading,
    refreshing,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    showDeleteModal,
    setShowDeleteModal,
    isSelectionMode,
    selectedServiceIds,
    onRefresh,
    getDaysRemaining,
    handleLongPress,
    handlePress,
    cancelSelectionMode,
    handleDeleteSelected,
    confirmDelete,
    handleCreateService,
  } = useServices();

  // Render Item: LIST
  const renderListItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={[
        styles.card,
        isSelectionMode &&
          item.id &&
          selectedServiceIds.has(item.id) && {
            borderColor: colors.primary,
            borderWidth: 1,
            backgroundColor: "rgba(62, 210, 255, 0.1)",
          },
      ]}
      onPress={() => {
        handlePress(item);
      }}
      onLongPress={() => {
        if (item.id) {
          handleLongPress(item.id);
        }
      }}
      delayLongPress={300}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.color || colors.primary },
          item.logoUrl ? { padding: 0 } : {},
        ]}
      >
        {item.logoUrl ? (
          <Image
            source={{ uri: item.logoUrl }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              resizeMode: "cover",
            }}
          />
        ) : item.icon ? (
          item.iconLibrary === "MaterialCommunityIcons" ? (
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color="#FFF"
            />
          ) : (
            <Ionicons name={item.icon as any} size={24} color="#FFF" />
          )
        ) : (
          <Text style={styles.iconText}>
            {(item.name || "?").charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name || "Sin nombre"}</Text>
        <Text style={styles.date}>Se paga el día {item.billingDay || "?"}</Text>
      </View>
      <Text style={styles.cost}>S/ {(item.cost || 0).toFixed(2)}</Text>
      {isSelectionMode ? (
        <Ionicons
          name={
            item.id && selectedServiceIds.has(item.id)
              ? "checkbox"
              : "square-outline"
          }
          size={24}
          color={
            item.id && selectedServiceIds.has(item.id)
              ? colors.primary
              : colors.textSecondary
          }
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  // Render Item: GRID
  const renderGridItem = ({ item }: { item: Service }) => {
    const daysRemaining = getDaysRemaining(item.billingDay);
    const isToday = daysRemaining === "Hoy";
    const isSelected = item.id ? selectedServiceIds.has(item.id) : false;

    return (
      <TouchableOpacity
        style={[
          styles.gridCard,
          { borderColor: item.color || colors.border },
          isSelected && {
            borderColor: colors.primary,
            backgroundColor: "rgba(62, 210, 255, 0.1)",
            borderWidth: 2,
          },
        ]}
        onPress={() => {
          handlePress(item);
        }}
        onLongPress={() => {
          if (item.id) {
            handleLongPress(item.id);
          }
        }}
        delayLongPress={300}
      >
        {/* Selection Indicator */}
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <Ionicons name="checkbox" size={24} color={colors.primary} />
            ) : (
              <Ionicons
                name="square-outline"
                size={24}
                color={colors.textSecondary}
              />
            )}
          </View>
        )}

        {/* Header Icon */}
        <View
          style={[
            styles.gridIconContainer,
            { backgroundColor: item.color || colors.primary },
          ]}
        >
          {item.logoUrl ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={styles.gridIconImage}
            />
          ) : item.icon ? (
            item.iconLibrary === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons
                name={item.icon as any}
                size={32}
                color="#FFF"
              />
            ) : (
              <Ionicons name={item.icon as any} size={32} color="#FFF" />
            )
          ) : (
            <Text style={styles.gridIconText}>
              {(item.name || "?").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Body */}
        <Text style={styles.gridName} numberOfLines={1}>
          {item.name || "Sin nombre"}
        </Text>
        <Text style={styles.gridCost}>S/ {(item.cost || 0).toFixed(2)}</Text>

        {/* Footer Info */}
        <View style={styles.gridFooter}>
          <View style={styles.badgeContainer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.gridDate,
                isToday && { color: colors.error, fontWeight: "bold" },
              ]}
            >
              {isToday ? "¡Hoy!" : `${daysRemaining}`}
            </Text>
          </View>

          {item.shared && (
            <View style={styles.sharedBadge}>
              <Ionicons name="people" size={10} color="#FFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Toggle */}
      <View style={styles.headerContainer}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={cancelSelectionMode}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>
              {selectedServiceIds.size} seleccionados
            </Text>
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.header}>Mis Suscripciones</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() =>
                  setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                }
                style={styles.viewToggle}
              >
                <Ionicons
                  name={viewMode === "list" ? "grid-outline" : "list-outline"}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <FlatList
        key={`${viewMode}`} // Force refresh
        data={services}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={viewMode === "list" ? renderListItem : renderGridItem}
        numColumns={viewMode === "grid" ? 2 : 1}
        contentContainerStyle={styles.list}
        columnWrapperStyle={
          viewMode === "grid" ? { justifyContent: "space-between" } : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            enabled={true}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes servicios registrados.
            </Text>
            <Text style={styles.emptySubText}>
              Agrega Netflix, Spotify, etc.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <EditServiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateService}
        isEditing={false}
      />

      <CustomAlertModal
        visible={showDeleteModal}
        title="Eliminar Servicios"
        message={`¿Estás seguro de que deseas eliminar ${selectedServiceIds.size} servicio(s)? Esta acción no se puede deshacer.`}
        variant="destructive"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </View>
  );
}
