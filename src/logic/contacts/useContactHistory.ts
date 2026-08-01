import { useState, useEffect } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { Contact } from "../../interfaces/Contact";
import { FinanceService } from "../../services/FinanceService";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useContactHistory = (contact: Contact, refreshTrigger?: number) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const loadSummary = async () => {
    try {
      const data = await FinanceService.getContactSummary(contact.id);
      setSummary(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [contact, refreshTrigger]);

  const toggleService = (serviceId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  return {
    loading,
    summary,
    expandedServices,
    toggleService,
    loadSummary
  };
};
