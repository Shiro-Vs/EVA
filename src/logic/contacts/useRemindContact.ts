import { useState, useEffect } from "react";
import { Alert, Linking, Share } from "react-native";
import { Contact } from "../../interfaces/Contact";
import { FinanceService } from "../../services/FinanceService";

export const useRemindContact = (visible: boolean, debtors: Contact[]) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visible && debtors.length > 0) {
      setSelectedId(debtors[0].id);
    }
  }, [visible, debtors]);

  useEffect(() => {
    if (selectedId) {
      loadSummary(selectedId);
    }
  }, [selectedId]);

  const loadSummary = async (id: string) => {
    const contact = debtors.find(d => d.id === id);
    if (!contact) return;

    setLoading(true);
    try {
      const data = await FinanceService.getContactSummary(contact.nombre);
      setSummary(data);
      generateMessage(contact.nombre, data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = (name: string, data: any) => {
    const debt = data?.totalDebt || 0;
    let msg = `Hola ${name}! 👋\n\nTu deuda total es de *S/ ${debt.toFixed(2)}* 💸\n\n`;
    
    if (data?.services) {
      data.services.forEach((s: any) => {
        if (s.debt > 0) {
          msg += `• *${s.serviceName}*: `;
          if (s.monthsDelay > 0) {
            msg += `${s.monthsDelay} ${s.monthsDelay === 1 ? 'mes' : 'meses'} (S/ ${s.debt.toFixed(2)})`;
          } else {
            msg += `S/ ${s.debt.toFixed(2)}`;
          }
          msg += `\n`;
        }
      });
    }

    msg += `\n¿Me podrías confirmar si lo logras pagar hoy? ¡Gracias! ✨`;
    setMessage(msg);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("WhatsApp", "WhatsApp no está instalado en este dispositivo");
      }
    });
  };

  return {
    selectedId,
    setSelectedId,
    loading,
    message,
    handleShare,
    handleWhatsApp
  };
};
