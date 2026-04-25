export interface User {
  uid: string;
  correo: string;
  nombre_pantalla: string;
  moneda_principal: string;
  foto_url?: string;
  preferencias_ia: {
    auto_categorizar: boolean;
    asistente_voz: boolean;
  };
  fecha_creacion: Date | any; // Firestore Timestamp
}
