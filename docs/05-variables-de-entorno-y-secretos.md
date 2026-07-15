# EVA — Variables de Entorno y Secretos

> Depende de `docs/03-implementacion-firebase.md` (sección 5, higiene de `.env`). Este documento va más a fondo: qué variable va dónde, cuáles son seguras de exponer y cuáles no, a través de todas las fases del proyecto — no solo Firebase.

## 1. La distinción que importa: `EXPO_PUBLIC_*` vs secreto real

Cualquier variable con el prefijo `EXPO_PUBLIC_` **queda incrustada en el bundle de la app** en tiempo de build — es decir, es tan pública como si estuviera escrita en el código fuente. Cualquiera que descompile el `.apk`/`.ipa` o inspeccione el bundle web puede leerla.

Esto es **aceptable** para credenciales que están diseñadas para ser públicas (el `apiKey` de Firebase, por ejemplo — la seguridad real la dan las reglas de Firestore y Auth, no el key). Es **inaceptable** para credenciales que dan acceso directo a algo con costo o privilegio si se filtran (la API key de Gemini, un futuro client secret de OAuth, cualquier token de servidor).

**Hoy el proyecto trata a las dos por igual** — `EXPO_PUBLIC_GEMINI_API_KEY` está en el mismo `.env` con el mismo prefijo que las de Firebase. Esto ya se había señalado en el análisis técnico inicial y en `docs/01-alcance-y-fases.md`, pero este documento lo deja como regla explícita para que no se repita con las próximas integraciones (Gmail OAuth, FCM).

## 2. Tabla completa: qué variable, en qué fase, dónde puede vivir

| Variable | Fase | ¿Segura en cliente (`EXPO_PUBLIC_`)? | Dónde vive realmente |
|---|---|---|---|
| `FIREBASE_API_KEY` | 0 | ✅ Sí | Cliente (`.env` → bundle) |
| `FIREBASE_AUTH_DOMAIN` | 0 | ✅ Sí | Cliente |
| `FIREBASE_PROJECT_ID` | 0 | ✅ Sí | Cliente |
| `FIREBASE_STORAGE_BUCKET` | 0 | ✅ Sí | Cliente |
| `FIREBASE_MESSAGING_SENDER_ID` | 0 | ✅ Sí | Cliente |
| `FIREBASE_APP_ID` | 0 | ✅ Sí | Cliente |
| `FIREBASE_MEASUREMENT_ID` | 0 | ✅ Sí | Cliente |
| `GOOGLE_WEB_CLIENT_ID` (Google Sign-In) | 0 | ✅ Sí | Cliente — los Client ID de OAuth son públicos por diseño, no tienen "secret" en flujos de app móvil/SPA |
| `GEMINI_API_KEY` | 4/6 | ❌ **No** | **Solo en Cloud Function** (Secret Manager de Firebase/GCP). El cliente nunca la ve — llama a la Cloud Function, que internamente llama a Gemini. |
| `GMAIL_OAUTH_CLIENT_SECRET` | 7 | ❌ **No** | Solo en Cloud Function / Secret Manager. El `client_id` de Gmail puede ser público, el `client_secret` nunca. |
| `FCM_SERVER_KEY` / credenciales de servicio | 5 | ❌ **No** | Solo en Cloud Function — FCM desde el backend usa credenciales de servicio (Admin SDK), no una key en el cliente. |

**Regla simple para lo que venga después:** si la variable empieza a usarse solo para *identificar* el proyecto/la app ante Google (Firebase config, OAuth client ID), puede ir en el cliente. Si la variable *autoriza* una acción con costo o acceso a datos de terceros (llamar a Gemini, leer Gmail, mandar notificaciones a nombre de todos los usuarios), va en el servidor, sin excepción.

## 3. Los tres lugares distintos donde vive esto (y no se mezclan)

### 3.1 Local — `.env`
Para desarrollo en la máquina de cada quien.
- `.env.example` se comitea al repo, con las claves de cada variable y valores de ejemplo/placeholder (nunca reales).
- `.env` real es local, no se comitea (ver `docs/03-implementacion-firebase.md` sección 5 para el `.gitignore`).
- Solo contiene las variables `EXPO_PUBLIC_*` de la tabla de arriba — nunca `GEMINI_API_KEY` sin el prefijo, porque en local Expo igual la metería en el bundle si se usara `process.env.GEMINI_API_KEY` sin pasar por una Cloud Function.

### 3.2 CI — GitHub Actions Secrets
El pipeline de CI (`.github/workflows/ci.yml`) hoy no necesita ninguna de estas variables — corre typecheck y tests sobre lógica pura, sin tocar Firebase real. Esto cambia cuando:
- Se agregue el Firebase Local Emulator Suite (`docs/03`, sección 2.4) a CI — ahí sí hace falta, pero son credenciales del emulador (no reales, no sensibles).
- Se agreguen tests que sí llamen a servicios reales (no recomendado en CI, mejor emulador).

Si en algún punto CI necesita un secreto real (por ejemplo, para desplegar `firestore.rules` automáticamente vía `firebase deploy`), se configura en GitHub → Settings → Secrets and variables → Actions, nunca hardcodeado en el YAML ni en el código.

### 3.3 Build real — EAS Build (`eas.json`)
Cuando se generen builds de verdad (development/preview/production) con `eas build`, las variables `EXPO_PUBLIC_*` se configuran por perfil en `eas.json` o en el dashboard de EAS (Environment Variables), **no** reutilizando ciegamente el `.env` local — así el build de producción usa el proyecto de Firebase de producción y no accidentalmente uno de pruebas (si en algún momento se decide tener proyectos de Firebase separados para dev/prod — no es necesario ahora con un solo desarrollador, pero vale la pena saber que la estructura de `eas.json` ya lo soporta el día que haga falta).

## 4. Qué falta corregir en el código actual

- Mover la lógica de `src/api/gemini.ts` a que nunca use `EXPO_PUBLIC_GEMINI_API_KEY` en producción — hoy el archivo existe pero no se llama desde ningún lado (confirmado en el análisis técnico inicial), así que no hay una llamada real expuesta todavía. El riesgo es **si se empieza a usar tal cual está** al construir la Fase 4/6 sin pasar primero por una Cloud Function. Este documento existe para que eso no pase por descuido.
- `.env` → `.env.example` (ya planeado en `docs/03`, sección 5, pendiente de ejecutar).

## 5. Documentos relacionados

- `docs/01-alcance-y-fases.md` — riesgos generales, incluyendo la mención original de este problema.
- `docs/03-implementacion-firebase.md` — higiene básica de `.env` para Firebase específicamente.
