# EVA - Gestor de Finanzas personales

EVA es una aplicación móvil desarrollada en **React Native (Expo)** y **TypeScript** diseñada para gestionar finanzas personales y suscripciones compartidas ("family plans").

## Características Principales

- **Gestión de Servicios**: Registra servicios compartidos (Netflix, Spotify, etc.) con costo y día de corte.
- **Control de Suscriptores**: Administra quién comparte cada servicio y cuánto debe pagar.
- **Seguimiento de Pagos**:
  - **Deudas de Suscriptores**: Generación automática de deudas mensuales.
  - **Pagos del Dueño**: Registro de pagos a la plataforma del servicio.
- **Billetera y Transacciones**: Registro de ingresos (pagos de suscriptores) y egresos (pagos de servicios).
- **Autenticación**: Login y Registro seguros con Firebase Auth.
- **Datos en la Nube**: Persistencia en tiempo real con Firestore.

## Estructura del Proyecto

El proyecto sigue una arquitectura modularizada, recientemente refactorizada para mejorar la escalabilidad.

```
src/
├── components/
│   ├── common/         # Componentes reutilizables (Alerts, Buttons)
│   └── modals/         # Modales organizados por dominio
│       ├── subscribers/  # Modales de gestión de suscriptores
│       ├── services/     # Modales de gestión de servicios
│       └── payments/     # Modales de confirmación de pagos
├── screens/
│   ├── auth/           # Pantallas de Login/Registro
│   ├── services/       # Flujo principal de Servicios
│   │   ├── subscribers/  # Componentes y estilos de SubscriberDetail
│   │   └── serviceDetail/# Componentes y estilos de ServiceDetail
│   └── ...
├── services/           # Lógica de negocio y conexión a Firebase
│   ├── serviceManager.ts    # CRUD de Servicios
│   ├── subscriberService.ts # CRUD de Suscriptores
│   ├── debtService.ts       # Lógica de Deudas y Pagos
│   └── transactionService.ts# Gestión de Billetera
├── theme/              # Definiciones de colores y estilos globales
└── config/             # Configuración de Firebase
```

## Configuración y Requisitos

### Prerrequisitos

- Node.js (LTS recomendado)
- npm o yarn
- Expo Go en tu dispositivo móvil o un emulador (Android/iOS).

### Instalación

1.  **Instalar dependencias:**

    ```bash
    npm install
    # o
    yarn install
    ```

2.  **Configurar Firebase:**
    Asegúrate de tener el archivo `src/config/firebaseConfig.ts` con tus credenciales de Firebase.

### Ejecución

Para iniciar el servidor de desarrollo:

```bash
npx expo start
```

- Presiona `a` para abrir en Android Emulator.
- Presiona `i` para abrir en iOS Simulator.
- Escanea el código QR con la app Expo Go en tu celular.

## Roadmap (Próximos Pasos)

- [ ] Mejorar la interfaz de la Billetera.
- [ ] Implementar notificaciones push para recordatorios de pago.
- [ ] Modo Oscuro/Claro (tema dinámico).
- [ ] Exportación de reportes mensuales.

---

_Documentación actualizada al: Enero 2026_
