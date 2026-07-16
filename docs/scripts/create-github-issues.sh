#!/usr/bin/env bash
# EVA — Genera labels, milestones e issues en GitHub a partir del roadmap
# (docs/04-roadmap-sprints.md). Requiere: gh CLI instalado y autenticado
# (gh auth login) con permisos de escritura sobre el repo.
#
# Uso:
#   chmod +x scripts/create-github-issues.sh
#   ./scripts/create-github-issues.sh
#
# Es seguro correrlo más de una vez: los labels se actualizan (--force) y
# gh issue create simplemente crea issues nuevas cada vez que se corre, así
# que si ya corriste el script antes, comenta las secciones que no quieras
# duplicar antes de volver a correrlo.

set -e

REPO="Shiro-Vs/EVA"   # cambiar si corren esto contra un fork

echo "== Repo destino: $REPO =="

# ---------------------------------------------------------------------------
# 1. LABELS
# ---------------------------------------------------------------------------
echo "== Creando labels =="

gh label create "type:feature" --repo "$REPO" --color "0E8A16" --description "Funcionalidad nueva" --force
gh label create "type:chore"   --repo "$REPO" --color "C5DEF5" --description "Tarea de mantenimiento/infra, sin UI nueva" --force
gh label create "type:bug"     --repo "$REPO" --color "D73A4A" --description "Algo que ya existe y no funciona bien" --force
gh label create "type:spike"   --repo "$REPO" --color "FBCA04" --description "Investigación o decisión, no produce código directamente" --force
gh label create "type:docs"    --repo "$REPO" --color "0075CA" --description "Documentación" --force

gh label create "area:auth"            --repo "$REPO" --color "5319E7" --force
gh label create "area:cuentas"         --repo "$REPO" --color "5319E7" --force
gh label create "area:suscripciones"   --repo "$REPO" --color "5319E7" --force
gh label create "area:contactos"       --repo "$REPO" --color "5319E7" --force
gh label create "area:prestamos"       --repo "$REPO" --color "5319E7" --force
gh label create "area:metas"           --repo "$REPO" --color "5319E7" --force
gh label create "area:dashboard"       --repo "$REPO" --color "5319E7" --force
gh label create "area:ia"              --repo "$REPO" --color "5319E7" --force
gh label create "area:notificaciones"  --repo "$REPO" --color "5319E7" --force
gh label create "area:correo"          --repo "$REPO" --color "5319E7" --force
gh label create "area:infra"           --repo "$REPO" --color "5319E7" --force

gh label create "fase-0" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-1" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-2" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-3" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-4" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-5" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-6" --repo "$REPO" --color "BFD4F2" --force
gh label create "fase-7" --repo "$REPO" --color "BFD4F2" --force

# ---------------------------------------------------------------------------
# 2. MILESTONES
# ---------------------------------------------------------------------------
echo "== Creando milestones =="

create_milestone() {
  local title="$1"
  local desc="$2"
  gh api "repos/$REPO/milestones" -f title="$title" -f state="open" -f description="$desc" --silent \
    || echo "   (milestone '$title' ya existía, se omite)"
}

create_milestone "Fase 0 — Firestore real + autenticación" "Bloqueante: migrar de mockDatabase a Firestore, auth multiusuario, reglas de seguridad."
create_milestone "Fase 1 — Estabilizar Suscripciones" "Sanear el módulo más maduro antes de construir Préstamos encima."
create_milestone "Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos" "Transacciones manuales, CRUD de cuentas, alertas de presupuesto, dashboard completo."
create_milestone "Fase 3 — Préstamos" "Bancarios y personales, cronograma y cuenta corriente."
create_milestone "Fase 4 — Metas de ahorro" "Conectar GoalsScreen a datos reales."
create_milestone "Fase 5 — Notificaciones push" "FCM + Cloud Functions programadas."
create_milestone "Fase 6 — Asistente IA (Gemini)" "Análisis de gastos, OCR de boletas y documentos, reportes PDF."
create_milestone "Fase 7 — Lectura de correo" "Yape → Plin → transferencias, vía Gmail API o proveedor tipo Plaid/Belvo."

# ---------------------------------------------------------------------------
# 3. ISSUES — FASE 0
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 0 =="

gh issue create --repo "$REPO" \
  --title "[Fase 0] Checklist de verificación en Firebase Console" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:chore,area:infra,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Antes de escribir código de migración hay que confirmar el estado real del proyecto en [Firebase Console](https://console.firebase.google.com). Ver `docs/03-implementacion-firebase.md`, sección 1.

## Tareas
- [ ] Confirmar plan del proyecto: Spark (gratis) o Blaze (pago por uso). Spark alcanza para esta fase; Blaze es obligatorio recién en Fases 5/6/7 (Cloud Functions).
- [ ] Habilitar proveedor de Authentication **Correo/Contraseña**.
- [ ] Habilitar proveedor de Authentication **Google** + configurar pantalla de consentimiento OAuth en Google Cloud Console.
- [ ] Confirmar/crear **Firestore Database** en **modo nativo** (no Datastore mode), en la región definitiva (ej. `southamerica-east1`). Una vez elegida la región no se puede cambiar sin migrar todo.
- [ ] Habilitar **Cloud Storage for Firebase** (necesario para `url_comprobante`).
- [ ] Confirmar que existe una app Web/iOS/Android registrada con credenciales reales, y reemplazar los placeholders de `.env`.

## Criterios de aceptación
- Documento (comentario en esta issue o actualización a `03-implementacion-firebase.md`) con el resultado de cada checkbox: qué faltaba, qué ya estaba.

## Referencias
- `docs/03-implementacion-firebase.md`, sección 1.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Corregir persistencia de sesión (AsyncStorage)" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:bug,area:auth,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
`getAuth(app)` en `src/api/firebase.ts` no persiste la sesión en React Native — cada recarga pide login de nuevo. `AsyncStorage` ya está en las dependencias pero no se usa en ningún archivo.

## Tareas
- [ ] Reemplazar `getAuth(app)` por `initializeAuth` con `getReactNativePersistence(AsyncStorage)`:
  ```ts
  import { initializeAuth, getReactNativePersistence } from "firebase/auth";
  import AsyncStorage from "@react-native-async-storage/async-storage";

  export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  ```
- [ ] Verificar manualmente: login, cerrar la app por completo, reabrir → debe seguir logueado.

## Criterios de aceptación
- La sesión sobrevive un reinicio completo de la app (no solo un refresh en caliente).

## Referencias
- `docs/03-implementacion-firebase.md`, sección 2.2.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Migrar AuthService a Firebase Auth real + crear AuthContext" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:auth,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Primer servicio a migrar — todo lo demás depende de tener un `uid` real. Hoy `AuthService.login` no valida password (corre contra `mockDatabase`).

## Tareas
- [ ] Migrar `login`, `register`, `getUserProfile` de `AuthService` a Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
- [ ] Al registrar, crear el documento `users/{uid}` en Firestore con la forma definida en `docs/02-modelo-de-datos.md`, sección 3.1.
- [ ] Implementar recuperación de contraseña con `sendPasswordResetEmail` (hoy `ForgotPasswordScreen` no tiene backend real).
- [ ] Crear `AuthContext` en `src/context/` (hoy solo existe `ThemeContext`) que exponga: usuario actual, estado de "cargando sesión", función de logout.
- [ ] Proteger las rutas de `app/(main)/` usando el `AuthContext` (redirigir a login si no hay sesión).

## Criterios de aceptación
- Registro crea usuario en Firebase Auth **y** su documento en Firestore.
- Login falla correctamente con password incorrecto (a diferencia del mock actual).
- Recargar la app con sesión activa no vuelve a pedir login (depende de la issue de persistencia).
- Intentar entrar a una ruta de `(main)` sin sesión redirige a login.

## Referencias
- `docs/03-implementacion-firebase.md`, sección 3, punto 1.
- `docs/02-modelo-de-datos.md`, sección 3.1.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Implementar Google Sign-In" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:auth,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Ruta recomendada con Expo managed: `expo-auth-session/providers/google`, intercambiando el `idToken` por credenciales de Firebase.

```ts
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

const credential = GoogleAuthProvider.credential(idToken);
await signInWithCredential(auth, credential);
```

**Importante:** esto no funciona de forma confiable dentro de Expo Go — se necesita un development build (`expo-dev-client` / EAS Build) para probarlo, incluso en desarrollo.

## Tareas
- [ ] Configurar Client ID de tipo Web en Google Cloud Console (para el token que valida Firebase).
- [ ] Configurar Client ID de tipo Android con el SHA-1 del certificado de firma (para builds de producción).
- [ ] Implementar el botón "Continuar con Google" en `LoginScreen`/`RegisterScreen`.
- [ ] Generar un development build para poder probar el flujo (no usar Expo Go para esta prueba).
- [ ] Si el usuario es nuevo, crear su documento `users/{uid}` igual que en el registro por correo.

## Criterios de aceptación
- Login con Google funciona en un development build.
- Usuario nuevo vía Google queda con su documento `users/{uid}` creado.

## Referencias
- `docs/03-implementacion-firebase.md`, sección 2.3.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Migrar AccountService a Firestore" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:cuentas,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Segundo servicio a migrar, el más sencillo — buena validación de que el patrón de migración funciona antes de tocar servicios más complejos.

## Tareas
- [ ] Migrar CRUD de `AccountService` a `users/{uid}/accounts/{accountId}` (estructura sin cambios respecto a la interfaz `Account` actual).
- [ ] Confirmar que Dashboard sigue leyendo cuentas correctamente contra Firestore.

## Criterios de aceptación
- Crear, leer, editar y eliminar una cuenta persiste en Firestore y sobrevive un refresh.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.2.
- `docs/03-implementacion-firebase.md`, sección 3, punto 2.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Migrar ContactService a Firestore" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:contactos,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Puede hacerse en paralelo con la migración de FinanceService — son independientes entre sí.

## Tareas
- [ ] Migrar CRUD de `ContactService` a `users/{uid}/contacts/{contactId}`.
- [ ] `total_deuda` y `total_servicios` se mantienen calculados en el cliente, no se guardan en Firestore (para no tener que mantenerlos sincronizados en cada pago).

## Criterios de aceptación
- Lista de contactos, historial y recordatorios siguen funcionando contra Firestore real.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.4.
- `docs/03-implementacion-firebase.md`, sección 3, punto 4.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Migrar FinanceService (transacciones) a Firestore" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:dashboard,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
`getTransactions`/`createTransaction` ya existen sobre mock. Puede hacerse en paralelo con la migración de ContactService.

## Tareas
- [ ] Migrar a `users/{uid}/transactions/{transactionId}`, estructura sin cambios respecto a `Transaction`.
- [ ] Confirmar que Dashboard (saldo total + últimas 5 transacciones) sigue funcionando.

## Criterios de aceptación
- Crear una transacción actualiza el Dashboard sin refrescar manualmente.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.6.
- `docs/03-implementacion-firebase.md`, sección 3, punto 4.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Migrar LoanService a Firestore (modelo de 3 modalidades)" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:prestamos,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Hoy `LoanService` solo tiene un `getLoans` stub sobre un tipo genérico. Esta issue es solo el modelo base + CRUD contra Firestore — la lógica de cálculo de cuotas con interés y el patrón FIFO para préstamos personales es trabajo de la Fase 3, no de esta issue.

## Tareas
- [ ] Migrar a `users/{uid}/loans/{loanId}` con el campo `modalidad: "bancario" | "personal_con_cronograma" | "personal_cuenta_corriente"` y `rol: "deudor" | "acreedor"`.
- [ ] Crear subcolección `.../loans/{loanId}/schedule/{cuotaId}` (para bancario y personal_con_cronograma).
- [ ] Crear subcolección `.../loans/{loanId}/movements/{movementId}` (para personal_cuenta_corriente), con actualización de `saldo_actual` en la misma transacción de escritura.
- [ ] Crear el nuevo tipo TS `LoanMovement` (no existe hoy).

## Criterios de aceptación
- El modelo distingue las 3 modalidades y el `rol`, tal como está definido en `docs/02-modelo-de-datos.md`.
- Un movimiento nuevo en `personal_cuenta_corriente` actualiza `saldo_actual` de forma atómica.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.5.
- `docs/03-implementacion-firebase.md`, sección 3, punto 5.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Crear GoalService desde cero contra Firestore" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:metas,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
No existe versión mock que migrar — `GoalsScreen` hoy está hardcodeada. Se crea directo contra Firestore.

## Tareas
- [ ] Crear `GoalService` con CRUD contra `users/{uid}/goals/{goalId}`.

## Criterios de aceptación
- Servicio con create/read/update/delete funcional, sin conectar la UI todavía (eso es Fase 4).

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.8.
- `docs/03-implementacion-firebase.md`, sección 3, punto 6.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Escribir y desplegar firestore.rules" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:feature,area:infra,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Es la única barrera real entre un usuario y los datos de otro — debe existir desde el primer día de escritura real a Firestore, no "para después".

## Tareas
- [ ] Crear `firestore.rules` en la raíz del proyecto:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
  ```
- [ ] Desplegar con `firebase deploy --only firestore:rules`.
- [ ] Probar manualmente que un usuario no puede leer/escribir datos de otro `uid` (con dos cuentas de prueba).

## Criterios de aceptación
- Las reglas están desplegadas en el proyecto real.
- Prueba manual confirma aislamiento por `uid`.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 5.
- `docs/03-implementacion-firebase.md`, sección 4.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Configurar Firebase Local Emulator Suite" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:chore,area:infra,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
Los 36 tests actuales son de lógica pura (no tocan Firebase) y no se ven afectados. Pero cualquier test nuevo sobre los Services migrados no debe pegarle al proyecto real de Firebase.

## Tareas
- [ ] Instalar `firebase-tools` y correr `firebase init emulators` (Auth + Firestore + Storage).
- [ ] Documentar en el README cómo levantar el emulador para desarrollo diario.
- [ ] Integrar el emulador en el workflow de CI para los tests que sí toquen Firebase.

## Criterios de aceptación
- `firebase emulators:start` deja Auth/Firestore/Storage corriendo localmente.
- Al menos un test de integración corre contra el emulador, no contra el proyecto real.

## Referencias
- `docs/03-implementacion-firebase.md`, sección 2.4.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 0] Renombrar .env a .env.example y sanear placeholders" \
  --milestone "Fase 0 — Firestore real + autenticación" \
  --label "type:chore,area:infra,fase-0" \
  --body "$(cat <<'EOF'
## Contexto
`.env` está trackeado en git con placeholders hoy — riesgo señalado en `01-alcance-y-fases.md`, sección 6. Esta es la fase correcta para resolverlo, porque es cuando `.env` va a tener credenciales reales por primera vez.

## Tareas
- [ ] `git mv .env .env.example`, dejando solo las claves vacías.
- [ ] Agregar `.env` a `.gitignore` (ya cubierto `.env*.local`, falta el `.env` real).
- [ ] Crear `.env` local (no trackeado) con las credenciales reales del proyecto verificado en la issue del checklist de Firebase Console.

## Criterios de aceptación
- `.env.example` en el repo, sin valores reales.
- `.env` real ignorado por git.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 6.
- `docs/03-implementacion-firebase.md`, sección 5.
EOF
)"

# ---------------------------------------------------------------------------
# 4. ISSUES — FASE 1
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 1 =="

gh issue create --repo "$REPO" \
  --title "[Fase 1] Spike: mapear deuda técnica de Suscripciones" \
  --milestone "Fase 1 — Estabilizar Suscripciones" \
  --label "type:spike,area:suscripciones,fase-1" \
  --body "$(cat <<'EOF'
## Contexto
El propio creador identificó que el módulo de Suscripciones "no está bien, falta arreglar muchas cosas" — pero no está definido si son bugs puntuales reproducibles o si el código es difícil de modificar sin romper algo. Esto define si la Fase 1 es debugging dirigido o refactor de fondo.

Como input para esta conversación, un análisis de `subscriptionLogic.ts` ya encontró dos patrones concretos de riesgo:
- Las funciones (`syncServiceHistory`, `applyFIFOPayment`) mutan objetos directamente en vez de retornar nuevo estado.
- Varios diccionarios (`registro_pagos_personas`, `montos_pagados`, `cuotas_momento`) usan `sub.nombre` (el nombre del suscriptor) como llave en vez de un `id`. Si dos suscriptores comparten nombre, o si alguien es renombrado, esto puede corromper datos silenciosamente.

## Tareas
- [ ] Sesión dirigida con el creador del proyecto para listar bugs puntuales reproducibles (con pasos para reproducir cada uno).
- [ ] Evaluar el hallazgo de "nombre como llave": ¿conviene migrar a `id_suscriptor` como llave en los diccionarios del historial? (Esto además destrabaría mejor la Fase 3, que reutiliza este patrón FIFO para préstamos personales.)
- [ ] Evaluar el hallazgo de mutación directa: ¿vale la pena convertir `subscriptionLogic.ts` a funciones puras (sin mutar el objeto recibido)?
- [ ] Decidir el alcance: lista cerrada de bugs a arreglar vs. refactor de las funciones core antes de seguir.

## Criterios de aceptación
- Documento (comentario en esta issue o sección nueva en `01-alcance-y-fases.md`) con: lista de bugs concretos, decisión sobre nombre-vs-id, decisión sobre mutación-vs-funciones puras, y alcance definido para la(s) issue(s) de implementación siguientes.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 6, "Preguntas abiertas".
- `src/logic/shared/subscriptionLogic.ts`.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 1] Refactor de subscriptionLogic.ts según hallazgos del spike" \
  --milestone "Fase 1 — Estabilizar Suscripciones" \
  --label "type:chore,area:suscripciones,fase-1" \
  --body "$(cat <<'EOF'
## Contexto
Placeholder — el alcance exacto de esta issue depende del resultado de "[Fase 1] Spike: mapear deuda técnica de Suscripciones". No editar el checklist de abajo hasta que el spike esté resuelto.

## Tareas (a completar según el spike)
- [ ] Actualizar esta issue con la lista de bugs concretos a resolver, o con el plan de refactor de fondo, según lo que haya decidido el spike.

## Criterios de aceptación
- Los 36 tests existentes en `src/logic/shared/__tests__/` siguen pasando.
- Se agregan tests nuevos que cubran los bugs corregidos.

## Referencias
- Depende de: "[Fase 1] Spike: mapear deuda técnica de Suscripciones".
EOF
)"

# ---------------------------------------------------------------------------
# 5. ISSUES — FASE 2
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 2 =="

gh issue create --repo "$REPO" \
  --title "[Fase 2] Pantalla de creación/edición manual de transacciones" \
  --milestone "Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos" \
  --label "type:feature,area:dashboard,fase-2" \
  --body "$(cat <<'EOF'
## Contexto
Hoy no existe pantalla de creación manual, aunque `FinanceService.createTransaction` ya existe (migrado en Fase 0).

## Tareas
- [ ] Formulario de creación: monto, tipo (ingreso/egreso), categoría, cuenta, fecha, descripción.
- [ ] Soporte de desglose opcional (una compra con varios ítems de distintas categorías) — campo `tiene_desglose`/`detalles_desglose` ya existe en la interfaz `Transaction`.
- [ ] Edición y eliminación de una transacción existente.

## Criterios de aceptación
- Crear una transacción manual desde la UI persiste en Firestore y aparece en el Dashboard.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.3.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 2] CRUD completo de cuentas en UI" \
  --milestone "Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos" \
  --label "type:feature,area:cuentas,fase-2" \
  --body "$(cat <<'EOF'
## Contexto
`AccountService` ya tiene CRUD completo desde Fase 0, pero hoy solo se leen en Dashboard — falta la UI de gestión.

## Tareas
- [ ] Pantalla de listado de cuentas.
- [ ] Crear cuenta (débito, crédito, billetera digital), con día de corte/pago para tarjetas de crédito.
- [ ] Editar y eliminar cuenta.

## Criterios de aceptación
- Un usuario puede gestionar sus cuentas completas sin salir de la app.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.2.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 2] Gestión de categorías + lógica de alerta de presupuesto" \
  --milestone "Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos" \
  --label "type:feature,area:dashboard,fase-2" \
  --body "$(cat <<'EOF'
## Contexto
El campo `presupuesto_mensual` ya existe en la interfaz `Category`, pero no hay lógica de alerta ni pantalla de gestión.

## Tareas
- [ ] CRUD de categorías (nombre, ícono, color, `presupuesto_mensual`).
- [ ] Lógica que compare transacciones del mes contra `presupuesto_mensual` por categoría.
- [ ] Alerta visual cuando el usuario se acerca al límite (ej. 80%) y cuando ya lo pasó.

## Criterios de aceptación
- El usuario ve una alerta clara al acercarse o pasar el presupuesto de una categoría.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.4.
- `docs/02-modelo-de-datos.md`, sección 3.7.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 2] Completar Dashboard: gráficos, filtro por periodo, balance por cuenta" \
  --milestone "Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos" \
  --label "type:feature,area:dashboard,fase-2" \
  --body "$(cat <<'EOF'
## Contexto
Hoy el Dashboard solo muestra saldo total + últimas 5 transacciones.

## Tareas
- [ ] Gráfico de gastos por categoría del periodo seleccionado.
- [ ] Filtro por periodo (mes actual, mes anterior, rango custom).
- [ ] Balance desglosado por cuenta, no solo el total.

## Criterios de aceptación
- El usuario puede ver de un vistazo en qué gastó más este mes vs. el anterior.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 3 (tabla de estado, fila Dashboard).
EOF
)"

# ---------------------------------------------------------------------------
# 6. ISSUES — FASE 3
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 3 =="

gh issue create --repo "$REPO" \
  --title "[Fase 3] Separar préstamo bancario vs. personal en UI de creación" \
  --milestone "Fase 3 — Préstamos" \
  --label "type:feature,area:prestamos,fase-3" \
  --body "$(cat <<'EOF'
## Contexto
El modelo de datos ya distingue `modalidad` (Fase 0), esta issue es la UI de creación que respeta esas reglas: en bancario, interés y fechas son obligatorios; en personal, son opcionales.

## Tareas
- [ ] Formulario de creación con selector de modalidad (bancario / personal_con_cronograma / personal_cuenta_corriente).
- [ ] Si es personal y el usuario es quien presta, exigir que la otra persona exista como Contacto (reutilizar selector de Contactos).
- [ ] Validación condicional: interés/fechas obligatorios solo en bancario.

## Criterios de aceptación
- No se puede crear un préstamo personal donde el usuario presta sin vincular un Contacto.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.7.
- `docs/02-modelo-de-datos.md`, sección 3.5.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 3] Cronograma de cuotas y registro de pagos" \
  --milestone "Fase 3 — Préstamos" \
  --label "type:feature,area:prestamos,fase-3" \
  --body "$(cat <<'EOF'
## Contexto
Para modalidades `bancario` y `personal_con_cronograma`, usando la subcolección `.../loans/{loanId}/schedule/{cuotaId}` ya modelada en Fase 0.

## ⚠️ Decisión pendiente
Cuando se configura `tasa_interes` en un préstamo personal, ¿EVA calcula automáticamente el monto de la cuota (interés simple sobre saldo o francés) o el interés es solo informativo y el usuario ingresa la cuota manualmente? No arrancar esta issue sin resolver esto primero (ver `01-alcance-y-fases.md`, sección 6).

## Tareas
- [ ] Resolver la decisión pendiente de arriba con el creador del proyecto.
- [ ] Generar el cronograma de cuotas al crear el préstamo.
- [ ] UI de registro de pago de una cuota (actualiza `estado`, `fecha_real_pago`, `monto_mora_acumulado` si aplica).
- [ ] Para préstamo bancario: el usuario ingresa cronograma y tasa manualmente (informativo, EVA no recalcula).

## Criterios de aceptación
- El cronograma refleja correctamente pagos, pendientes y vencidos.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.5.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 3] Préstamo personal cuenta corriente: movimientos + saldo" \
  --milestone "Fase 3 — Préstamos" \
  --label "type:feature,area:prestamos,fase-3" \
  --body "$(cat <<'EOF'
## Contexto
Para la modalidad `personal_cuenta_corriente`, usando la subcolección `.../loans/{loanId}/movements/{movementId}` ya modelada en Fase 0 — es el equivalente estructurado a la hoja `DEUDORES` del Excel manual anterior.

## Tareas
- [ ] UI para registrar un movimiento (monto positivo = aumenta deuda, negativo = abono/pago), con descripción y fecha.
- [ ] Confirmar que cada movimiento actualiza `saldo_actual` del préstamo padre en la misma transacción de escritura.
- [ ] Vista de historial de movimientos ordenado por fecha.

## Criterios de aceptación
- `saldo_actual` siempre refleja la suma de movimientos, sin desincronizarse.

## Referencias
- `docs/02-modelo-de-datos.md`, sección 3.5.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 3] Reutilizar patrón FIFO para cobro de préstamos personales" \
  --milestone "Fase 3 — Préstamos" \
  --label "type:feature,area:prestamos,fase-3" \
  --body "$(cat <<'EOF'
## Contexto
El cobro de préstamos personales (cuando el usuario es quien presta) reutiliza gran parte de la lógica que ya existe para el cobro de suscripciones compartidas (`applyFIFOPayment` en `subscriptionLogic.ts`).

## Depende de
"[Fase 1] Refactor de subscriptionLogic.ts según hallazgos del spike" — idealmente arrancar esta issue después de que ese refactor esté resuelto, para no reutilizar un patrón con deuda técnica conocida.

## Tareas
- [ ] Adaptar/extraer la lógica FIFO de `subscriptionLogic.ts` para que sirva tanto a Suscripciones como a Préstamos personales.
- [ ] Aplicar pago adelantado de un deudor, saldando cuotas/meses pendientes en orden.

## Criterios de aceptación
- Un pago adelantado de un deudor salda correctamente las cuotas más antiguas primero.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.7.
- `src/logic/shared/subscriptionLogic.ts`.
EOF
)"

# ---------------------------------------------------------------------------
# 7. ISSUES — FASE 4
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 4 =="

gh issue create --repo "$REPO" \
  --title "[Fase 4] Conectar GoalsScreen a GoalService real" \
  --milestone "Fase 4 — Metas de ahorro" \
  --label "type:feature,area:metas,fase-4" \
  --body "$(cat <<'EOF'
## Contexto
`GoalsScreen` existe pero está hardcodeada — no lee del mock ni de nada real. `GoalService` ya existe desde Fase 0, falta conectarlo. Es la fase más simple de las que faltan — puede adelantarse si hay tiempo libre entre otras fases.

## Tareas
- [ ] Conectar `GoalsScreen` a `GoalService` (listar, crear, editar, eliminar metas).
- [ ] Mostrar progreso (`monto_actual` / `monto_objetivo`) y `fecha_limite`.
- [ ] Las metas son siempre personales, no compartidas entre usuarios (al menos en esta etapa).

## Criterios de aceptación
- Crear/editar una meta persiste en Firestore y se refleja en la pantalla sin datos hardcodeados.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.8.
EOF
)"

# ---------------------------------------------------------------------------
# 8. ISSUES — FASE 5
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 5 =="

gh issue create --repo "$REPO" \
  --title "[Fase 5] Notificaciones push (FCM + Cloud Functions programadas)" \
  --milestone "Fase 5 — Notificaciones push" \
  --label "type:feature,area:notificaciones,fase-5" \
  --body "$(cat <<'EOF'
## Contexto
Depende de que ya existan préstamos, presupuestos y metas reales sobre los que alertar (Fases 2-4). Requiere plan Blaze (Cloud Functions necesita llamadas de red salientes, no disponible en Spark).

## ⚠️ Decisión pendiente
¿Con cuántos días de anticipación se avisa un pago próximo? ¿Es configurable por el usuario o un valor fijo para empezar (ej. 3 días antes)? Ver `01-alcance-y-fases.md`, sección 6.

## Tareas
- [ ] Resolver la decisión pendiente de arriba.
- [ ] Confirmar/activar plan Blaze en Firebase.
- [ ] Registrar `deviceTokens` por usuario (`users/{uid}/deviceTokens/{tokenId}`, ya modelado en `02-modelo-de-datos.md`).
- [ ] Cloud Function programada que revise diariamente: pagos próximos (préstamo/suscripción), deuda de contacto, meta atrasada, presupuesto excedido.
- [ ] Envío de notificación vía Firebase Cloud Messaging.

## Criterios de aceptación
- Una notificación llega aunque la app esté cerrada, para al menos uno de los 4 casos (pago próximo, deuda, meta atrasada, presupuesto excedido).

## Referencias
- `docs/01-alcance-y-fases.md`, secciones 2.10 y 6.
- `docs/02-modelo-de-datos.md`, sección 3.10.
EOF
)"

# ---------------------------------------------------------------------------
# 9. ISSUES — FASE 6
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 6 =="

gh issue create --repo "$REPO" \
  --title "[Fase 6] Cloud Function proxy para Gemini" \
  --milestone "Fase 6 — Asistente IA (Gemini)" \
  --label "type:feature,area:ia,fase-6" \
  --body "$(cat <<'EOF'
## Contexto
Prerrequisito de las otras 4 issues de esta fase. La API key de Gemini nunca debe llamarse directo desde el cliente — todas las features de IA pasan por una Cloud Function como intermediaria. Requiere plan Blaze.

## Tareas
- [ ] Cloud Function que reciba requests del cliente autenticado y haga el llamado a Gemini con la key guardada en Secret Manager (o config de Functions), nunca en el cliente.
- [ ] Definir el contrato de request/response que van a usar las 4 features siguientes.

## Criterios de aceptación
- El cliente nunca tiene la API key de Gemini en su bundle ni en `.env` público (`EXPO_PUBLIC_*`).

## Referencias
- `docs/01-alcance-y-fases.md`, secciones 2.9 y 6.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 6] Análisis de gastos y tips personalizados con Gemini" \
  --milestone "Fase 6 — Asistente IA (Gemini)" \
  --label "type:feature,area:ia,fase-6" \
  --body "$(cat <<'EOF'
## Contexto
Necesita transacciones reales de la Fase 2 para tener datos sobre los que analizar. Depende de la Cloud Function proxy de esta misma fase.

## Tareas
- [ ] Enviar patrones de gasto del usuario (categorías donde más gasta, comparación mes a mes) a Gemini vía la Cloud Function.
- [ ] Mostrar sugerencias personalizadas en la UI.

## Criterios de aceptación
- El usuario recibe al menos una sugerencia basada en sus datos reales, no genérica.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.9.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 6] Escaneo de boletas/recibos con cámara" \
  --milestone "Fase 6 — Asistente IA (Gemini)" \
  --label "type:feature,area:ia,fase-6" \
  --body "$(cat <<'EOF'
## Contexto
Alimenta transacciones automáticamente. `Transaction` ya anticipa esto con los campos `entrada_ia_cruda` y `url_comprobante`.

## Tareas
- [ ] Captura de foto de boleta/recibo desde la app.
- [ ] Subida a Cloud Storage (`url_comprobante`).
- [ ] Envío a Gemini Vision vía la Cloud Function proxy para extraer monto, fecha, comercio.
- [ ] Prellenar el formulario de transacción con lo extraído — el usuario siempre confirma antes de guardar.

## Criterios de aceptación
- Una foto de boleta prellena correctamente monto y fecha en la mayoría de los casos, y nunca se guarda sin confirmación del usuario.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.9.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 6] Escaneo de documentos de préstamo bancario con cámara" \
  --milestone "Fase 6 — Asistente IA (Gemini)" \
  --label "type:feature,area:ia,fase-6" \
  --body "$(cat <<'EOF'
## Contexto
Alimenta el módulo de Préstamos (Fase 3): autocompleta el documento típico que da el banco al desembolsar un préstamo (fechas de pago, tasa de interés, moras).

## Tareas
- [ ] Captura/subida del documento del banco.
- [ ] Envío a Gemini Vision vía la Cloud Function proxy para extraer cronograma, tasa, moras.
- [ ] Prellenar el formulario de creación de préstamo bancario (de la issue de Fase 3) — el usuario confirma antes de guardar.

## Criterios de aceptación
- Un documento típico de banco prellena correctamente el cronograma de cuotas.

## Referencias
- `docs/01-alcance-y-fases.md`, secciones 2.7 y 2.9.
EOF
)"

gh issue create --repo "$REPO" \
  --title "[Fase 6] Generación de reportes en PDF" \
  --milestone "Fase 6 — Asistente IA (Gemini)" \
  --label "type:feature,area:ia,fase-6" \
  --body "$(cat <<'EOF'
## Contexto
Reportes descargables/compartibles con el resumen financiero del usuario.

## Tareas
- [ ] Definir contenido del reporte (resumen de gastos, ingresos, categorías, progreso de metas — a confirmar con el creador).
- [ ] Generar PDF (del lado de Cloud Function o del cliente, a decidir según performance).
- [ ] Permitir descargar/compartir el PDF desde la app.

## Criterios de aceptación
- El usuario puede generar y compartir un PDF con su resumen financiero del periodo seleccionado.

## Referencias
- `docs/01-alcance-y-fases.md`, sección 2.9.
EOF
)"

# ---------------------------------------------------------------------------
# 10. ISSUES — FASE 7
# ---------------------------------------------------------------------------
echo "== Creando issues: Fase 7 =="

gh issue create --repo "$REPO" \
  --title "[Fase 7] Lectura de correo (Yape → Plin → transferencias)" \
  --milestone "Fase 7 — Lectura de correo" \
  --label "type:spike,area:correo,fase-7" \
  --body "$(cat <<'EOF'
## Contexto
La feature más compleja del roadmap. Cada usuario conecta su propia cuenta de correo; el objetivo es que EVA pre-rellene transacciones a partir de las notificaciones de Yape/Plin/transferencias — el usuario siempre confirma antes de que se guarde, nunca se registra un movimiento sin que la persona lo vea primero.

## ⚠️ Preguntas abiertas
- ¿El correo se procesa completo en un backend propio (OAuth de Gmail + webhook/polling + parseo de HTML a mano), o hay apertura a usar un proveedor tipo Plaid/Belvo (usado por fintechs en Latam) en vez de parsear el correo manualmente?
- Dar acceso de lectura a Gmail es un scope sensible ante Google — puede requerir una revisión de seguridad de la app antes de aprobar el acceso en producción (no solo en modo de prueba con cuentas propias). Investigar el proceso y tiempos antes de comprometerse a esta fase.
- Alternativa a evaluar primero, dado el esfuerzo: "sube el screenshot del Yape y que Gemini Vision lo lea" (reutilizando la issue de escaneo de boletas de la Fase 6) antes de meterse a integrar Gmail API completo.

## Tareas
- [ ] Resolver las preguntas abiertas de arriba con el creador del proyecto.
- [ ] Según lo decidido: evaluar/probar la alternativa de screenshot + Gemini Vision como primer paso de bajo esfuerzo.
- [ ] Si se opta por Gmail API propio: diseño técnico de OAuth por usuario + backend de sincronización + parseo, empezando por el formato de Yape (el más predecible).
- [ ] Si se opta por proveedor tipo Plaid/Belvo: evaluación de costos y cobertura para Perú.
- [ ] Revisar obligaciones bajo la Ley de Protección de Datos Personales (Ley N.º 29733) de Perú antes de abrir esto a usuarios que no se conocen personalmente.

## Criterios de aceptación
- Documento de decisión técnica (enfoque elegido + justificación) antes de escribir código de integración.

## Referencias
- `docs/01-alcance-y-fases.md`, secciones 2.11 y 6.
EOF
)"

echo "== Listo. Revisa el tablero de Projects/Issues en GitHub. =="
