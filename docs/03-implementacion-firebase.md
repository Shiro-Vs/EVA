# EVA — Implementación de Firebase (Fase 0)

> Depende de `docs/01-alcance-y-fases.md` y `docs/02-modelo-de-datos.md`. Este documento es el plan técnico para pasar de `mockDatabase` a Firebase real. No es código todavía — es la guía para escribirlo sin descubrir a mitad de camino que falta activar algo en la consola.

## 1. Checklist de verificación en Firebase Console

Antes de escribir una sola línea de migración, confirma esto en [console.firebase.google.com](https://console.firebase.google.com), en el proyecto de EVA:

### 1.1 Plan del proyecto
- [ ] ¿Es plan **Spark** (gratis) o **Blaze** (pago por uso)?
  - Spark alcanza para esta fase (Auth + Firestore + Storage).
  - **Blaze es obligatorio** para Cloud Functions (Fases 5, 6 y 7 — notificaciones, Gemini, lectura de correo), porque Cloud Functions necesita hacer llamadas de red salientes, algo que Spark no permite. No hay que activarlo ahora, pero mejor saberlo antes de diseñar esas fases asumiendo que ya se puede.

### 1.2 Authentication
- [ ] ¿Está habilitado el proveedor **Correo/Contraseña**?
- [ ] ¿Está habilitado el proveedor **Google**?
  - Si no, hay que activarlo y configurar la pantalla de consentimiento OAuth en Google Cloud Console (el mismo proyecto que Firebase, son la misma base).
  - Google Sign-In en Expo necesita, además, un **Client ID de tipo Web** (para el token que valida Firebase) y, para builds de Android en producción, un **Client ID de tipo Android** con el SHA-1 del certificado de firma. Esto se configura una vez y punto, pero hay que hacerlo antes de programar el botón de "Continuar con Google".

### 1.3 Firestore Database
- [ ] ¿Existe la base de datos ya creada? (Firestore, no "Realtime Database" — son productos distintos)
- [ ] ¿En qué modo? Debe ser **modo nativo** (no "Datastore mode").
- [ ] ¿En qué región? (una vez elegida, no se puede cambiar sin migrar todo — si no está creada aún, elegir una región cercana a Perú, ej. `southamerica-east1` en São Paulo, o `us-central1` si prefieres la más barata/rápida para Cloud Functions más adelante).

### 1.4 Storage
- [ ] ¿Está habilitado Cloud Storage for Firebase? Se necesita para `url_comprobante` (fotos de recibos) desde ya, aunque la Fase de escaneo con IA venga después — la subida de la foto es independiente de que la IA la lea.

### 1.5 App registrada
- [ ] ¿Existe una app Web/iOS/Android registrada en el proyecto con las credenciales que hoy están como placeholder en `.env`? Si el proyecto es nuevo, falta registrar la app y reemplazar los valores reales.

**Siguiente paso una vez marcado esto:** avísame qué encontraste (qué faltaba, qué ya estaba) y ajustamos el resto del plan si hace falta.

## 2. Decisiones técnicas

### 2.1 SDK
Se mantiene el **Firebase JS SDK modular** (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`) que ya está en `src/api/firebase.ts` — es compatible con Expo sin necesidad de un dev build nativo para Auth/Firestore/Storage (a diferencia de `@react-native-firebase`, que si requiere módulos nativos). Se descarta cambiar de librería.

### 2.2 Persistencia de sesión (el bug que hoy no existe)
El `getAuth(app)` que usa hoy `firebase.ts` **no persiste la sesión en React Native** — por eso cada recarga pide login de nuevo. La corrección:

```ts
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```
`AsyncStorage` ya está en las dependencias del proyecto pero no se usa en ningún archivo — este es exactamente el lugar donde debía usarse.

### 2.3 Google Sign-In en Expo
Con Expo (managed, sin eyectar) la ruta recomendada es `expo-auth-session/providers/google`, que abre el flujo OAuth del sistema y devuelve un `idToken`. Ese token se intercambia por credenciales de Firebase:

```ts
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

const credential = GoogleAuthProvider.credential(idToken);
await signInWithCredential(auth, credential);
```

**Importante:** esto no funciona de forma confiable dentro de **Expo Go** — Google restringió el flujo OAuth en el navegador embebido de apps genéricas hace tiempo. Se necesita un **development build** (`expo-dev-client` / EAS Build) para probarlo correctamente, incluso en desarrollo. Vale la pena confirmarlo cuando lleguemos a esa parte, para no perder tiempo debuggeando algo que es una limitación conocida y no un bug del código.

### 2.4 Firebase Local Emulator Suite (para desarrollo y tests)
Ahora que los servicios van a hablar con Firebase real, los 36 tests que ya existen (que son de lógica pura, sin Firebase) siguen sin verse afectados. Pero cualquier test nuevo sobre los `Service` migrados (`AuthService`, `AccountService`, etc.) **no debe pegarle al proyecto de Firebase real** — se recomienda instalar el [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) (`firebase-tools`, `firebase init emulators`) para correr Auth + Firestore + Storage localmente, tanto en desarrollo diario como en CI. Esto se agrega como tarea de esta fase, no es opcional: sin emulador, cada test de integración tendría que usar datos reales o mockear Firebase de nuevo, que es exactamente el problema que estamos resolviendo.

## 3. Orden de migración por servicio

Cada servicio se migra completo (no a medias) antes de pasar al siguiente, para poder probarlo de forma aislada:

1. **`AuthService`** — primero, porque todo lo demás depende de tener un `uid` real.
   - Registro, login (con validación real de password, se resuelve solo por usar Firebase Auth), Google Sign-In, recuperación de contraseña (`sendPasswordResetEmail`), persistencia de sesión (sección 2.2).
   - Se agrega un `AuthContext`/`UserContext` en `src/context/` (hoy solo existe `ThemeContext`) que expone el usuario actual y un estado de "cargando sesión" para poder proteger rutas.
2. **`AccountService`** — CRUD simple, buen segundo paso por ser el más sencillo.
3. **`SubscriptionService`** — sigue el modelo de subcolecciones de `docs/02-modelo-de-datos.md` (`services`, `subscribers`, `history`). Es el más delicado porque tiene más lógica (`subscriptionLogic.ts`) — conviene hacerlo junto con la Fase 1 (estabilización) en vez de migrar primero y arreglar después.
4. **`ContactService`** y **`FinanceService`** — en paralelo, son independientes entre sí.
5. **`LoanService`** — al final de este grupo, ya con el modelo de 3 modalidades de `docs/02-modelo-de-datos.md` (hoy solo tiene un `getLoans` stub).
6. **`GoalService`** — no existe todavía, se crea de cero directamente contra Firestore (no tiene versión mock que migrar).

## 4. Reglas de seguridad

Las reglas ya están definidas en `docs/02-modelo-de-datos.md`, sección 5. Esta fase agrega el archivo `firestore.rules` en la raíz del proyecto y el despliegue:

```bash
firebase deploy --only firestore:rules
```
Se recomienda tener esto desde el primer día de escritura real a Firestore, no "para después" — es la única barrera real entre un usuario y los datos de otro.

## 5. Limpieza de `.env`

Ya señalado en el análisis técnico inicial, pero esta es la fase correcta para resolverlo, porque es cuando el `.env` va a pasar de tener placeholders a tener credenciales reales:

```bash
git mv .env .env.example
# vaciar los valores reales de .env.example, dejar solo las claves
echo ".env" >> .gitignore
```
Y crear un `.env` local (no trackeado) con las credenciales reales del proyecto verificado en la sección 1.

## 6. Fuera de alcance de esta fase

- Cloud Functions (requieren plan Blaze) — se activan recién en la Fase 6 (Gemini) y Fase 7 (correo).
- Firebase Cloud Messaging — Fase 5.
- Cualquier lógica de negocio nueva (eso es Fase 1 en adelante) — esta fase es exclusivamente "que lo que ya existe hable con datos reales en vez de mock".
