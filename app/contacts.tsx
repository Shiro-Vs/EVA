import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { mockDB } from "../src/services/mockDatabase";
import { Contact } from "../src/interfaces/Contact";

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await mockDB.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error al cargar contactos", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#1F7ECC" />
      </SafeAreaView>
    );
  }

  const totalDeudaGlobal = contacts.reduce((acc, c) => acc + (c.total_deuda || 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 flex-1">
        {/* Header */}
        <View className="flex-row items-center mt-6 mb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-card rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="chevron-back" size={24} color="#1F7ECC" />
          </TouchableOpacity>
          <Text className="text-text-primary font-asap-bold text-2xl">Mis Contactos</Text>
        </View>

        {/* Debt Summary Card */}
        <View className="bg-primary p-6 rounded-[32px] mb-8 shadow-sm">
          <Text className="text-white/70 font-asap-semibold text-[10px] uppercase tracking-widest mb-1">Total por Cobrar</Text>
          <Text className="text-white font-asap-bold text-3xl">S/ {totalDeudaGlobal.toFixed(2)}</Text>
          <View className="flex-row items-center mt-4 bg-white/10 self-start px-3 py-1.5 rounded-full">
            <Ionicons name="people" size={14} color="white" />
            <Text className="text-white font-asap-medium text-[10px] ml-2">{contacts.length} personas en tu comunidad</Text>
          </View>
        </View>

        <Text className="text-text-secondary font-asap-semibold text-[10px] uppercase tracking-widest mb-4 ml-2">Lista de Contactos</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {contacts.map((contact) => (
            <TouchableOpacity 
              key={contact.id}
              className="bg-card p-4 rounded-3xl border border-border/10 flex-row items-center mb-3"
              activeOpacity={0.7}
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${contact.color}15` }}
              >
                <Text className="text-xl font-asap-bold" style={{ color: contact.color }}>
                  {contact.nombre.charAt(0)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-text-primary font-asap-bold text-base">{contact.nombre}</Text>
                <Text className="text-text-secondary font-asap text-xs">
                  {contact.total_deuda && contact.total_deuda > 0 
                    ? `Debe S/ ${contact.total_deuda.toFixed(2)}` 
                    : "Al día"}
                </Text>
              </View>

              <View className="items-end">
                <View 
                  className={`px-3 py-1.5 rounded-full ${contact.total_deuda && contact.total_deuda > 0 ? "bg-orange-500/10" : "bg-green-500/10"}`}
                >
                  <Text 
                    className={`font-asap-bold text-[10px] uppercase ${contact.total_deuda && contact.total_deuda > 0 ? "text-orange-600" : "text-green-600"}`}
                  >
                    {contact.total_deuda && contact.total_deuda > 0 ? "Pendiente" : "Al día"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-20" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
