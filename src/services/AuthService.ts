import { User } from "../interfaces/User";
import { mockDatabase } from "../data/mock/mockData";

const networkDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(obj: T): T => {
  const json = JSON.stringify(obj);
  return JSON.parse(json, (key, value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

export const AuthService = {
  async login(email: string, password: string): Promise<User> {
    await networkDelay(1000); 
    
    if (!email) throw new Error("El correo es requerido");
    
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockDatabase.users.find(u => u.correo.toLowerCase() === normalizedEmail);
    
    if (user) {
      return clone(user);
    } else {
      throw new Error("Usuario no encontrado (Verifica que sea usuario@eva.app)");
    }
  },

  async register(email: string, password: string, nombre: string): Promise<User> {
    await networkDelay(1200);
    
    const exists = mockDatabase.users.some(u => u.correo === email.toLowerCase());
    if (exists) {
      throw new Error("El correo ya está en uso");
    }

    const newUser: User = {
      uid: `user_${Date.now()}`,
      correo: email.toLowerCase(),
      nombre_pantalla: nombre,
      moneda_principal: "PEN",
      preferencias_ia: { auto_categorizar: true, asistente_voz: false },
      fecha_creacion: new Date(),
    };
    
    mockDatabase.users.unshift(newUser);
    return clone(newUser);
  },

  async getUserProfile(): Promise<User> {
    await networkDelay(200);
    return clone(mockDatabase.users[0]);
  },
};
