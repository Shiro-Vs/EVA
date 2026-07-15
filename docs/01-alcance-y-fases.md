# EVA — Alcance y Fases

> Documento vivo. Se actualiza cada vez que se cierra o reprioriza una fase. No es un contrato — es el mapa para no perdernos entre features mientras el proyecto crece.

## 1. Visión

EVA es una app de gestión financiera personal para uso propio y de un grupo cerrado de amigos (no es un producto público). El objetivo central: tener en un solo lugar las cuentas, los gastos compartidos con otras personas (suscripciones, servicios), los préstamos, y eventualmente asistencia de IA para registrar y entender los movimientos sin fricción.

No se está optimizando para escalar a miles de usuarios ni para venderse — se optimiza para que sea **rápida de usar en el día a día** y **fácil de mantener por una sola persona**.

## 2. Estado actual (auditado sobre el código, no sobre el README)

Leyenda: ✅ Implementado y funcional (sobre mock) · 🟡 Parcial / solo scaffolding · ⬜ No existe

| Módulo | Interfaz (tipo) | Servicio (mock) | Pantalla / UI | Notas |
|---|---|---|---|---|
| Autenticación | ✅ `User` | 🟡 `AuthService` | ✅ Login/Registro/Recuperar | Login no valida password (ver sección 7). Sin persistencia de sesión. |
| Suscripciones / servicios compartidos | ✅ `Subscription` | ✅ `SubscriptionService` + lógica en `subscriptionLogic.ts` | ✅ Planning, detalle de servicio, historial, pagos | El módulo más maduro del proyecto. Prorrateo, FIFO, ciclos anuales/mensuales ya funcionan. |
| Contactos / cobros | ✅ `Contact` | ✅ `ContactService` | ✅ Lista, historial, recordatorios | Depende de `financeLogic.ts`, ya cubierto por tests. |
| Cuentas (bancos, billeteras) | ✅ `Account` (ya contempla crédito, billetera digital, día de corte/pago) | 🟡 `AccountService` (solo `getAccounts`) | 🟡 Se leen en Dashboard, no hay pantalla de gestión (crear/editar cuenta) | La interfaz ya está lista para tarjetas de crédito y Yape/Plin (`es_billetera_digital`). |
| Transacciones (ingresos/egresos) | ✅ `Transaction` (ya contempla desglose, foto de comprobante, IA cruda) | 🟡 `FinanceService` (`getTransactions`, `createTransaction` ya existen) | ⬜ No hay pantalla para crear/editar transacciones a mano | Dato importante: la capa de datos está más avanzada que la UI acá. |
| Dashboard | — | — | 🟡 Ya existe y muestra saldo total + últimas 5 transacciones por categoría | No es "falta implementar desde cero", falta completarlo (gráficos, filtros, periodo). |
| Categorías | ✅ `Category` (ya contempla `creada_por_ia`) | 🟡 Solo `getCategories` | ⬜ No hay gestión de categorías | Pensado desde el inicio para que la IA las autogenere. |
| Préstamos | ✅ `Loan` / `LoanSchedule` (cronograma, mora) | 🟡 Solo `getLoans` | ⬜ Sin pantalla | Modelo ya diseñado, cero UI. |
| Metas de ahorro | ✅ `Goal` | ⬜ No existe `GoalService` | 🟡 `GoalsScreen` con una tarjeta **hardcodeada** de ejemplo | Es la más atrasada: ni siquiera lee del mock todavía. |
| Asistente IA (Gemini) | — | 🟡 Cliente configurado (`gemini.ts`) | ⬜ No se llama desde ningún lado | Ver Fase 3 y advertencia de seguridad en sección 7. |
| OCR de documentos | — | ⬜ | ⬜ | No iniciado. |
| Lectura de correo (Yape) | — | ⬜ | ⬜ | No iniciado — es la feature más compleja del roadmap (ver Fase 5). |
| Persistencia real (Firebase) | ✅ Cliente configurado (`firebase.ts`) | ⬜ Ningún servicio lo usa todavía | — | Todo corre sobre `mockDatabase` en memoria. |
| Tests / CI | — | — | — | ✅ Resuelto en `feature/real-ci-and-tests` (36 tests sobre `src/logic/shared/`, CI real). |
| Design system de colores | — | — | — | ✅ Documentado en `EVA-manual-colores.md`. |

**Lectura rápida:** el negocio de "servicios compartidos + contactos" está sólido y probado. Todo lo demás (cuentas, transacciones, dashboard, metas, préstamos) tiene el **modelo de datos ya bien pensado** (buena noticia: no hay que rediseñar tipos) pero la **capa de servicio y UI está incompleta o ausente**. Eso simplifica bastante el trabajo que viene: no partimos de cero, partimos de completar.

## 3. Fases (orden recomendado)

### Fase 0 — Firestore real (bloqueante para todo lo demás)
Migrar `AuthService`, `AccountService`, `FinanceService`, `LoanService`, `SubscriptionService`, `ContactService` de `mockDatabase` a Firestore. Incluye:
- Diseño del modelo de datos en Firestore (documento separado, `02-modelo-de-datos.md`, siguiente en la lista).
- Reglas de seguridad (`firestore.rules`) para que cada usuario/grupo solo vea sus propios datos.
- Persistencia de sesión (hoy no existe ni con mock).

*Por qué primero:* todo lo que se construya en fases posteriores (dashboard, metas, IA) va a necesitar leer/escribir contra la base real. Construir sobre mock ahora es construir dos veces.

### Fase 1 — Completar Ingresos/Egresos y Dashboard
Ya existe base (`FinanceService.createTransaction`, `DashboardScreen` parcial). Falta:
- Pantalla para crear/editar transacciones manualmente.
- Gestión de cuentas (crear, editar, eliminar) — hoy solo se leen.
- Gestión de categorías.
- Completar Dashboard: gráficos por categoría, filtro por periodo, balance por cuenta.

### Fase 2 — Préstamos
El tipo `Loan`/`LoanSchedule` ya contempla cronograma y mora. Falta el servicio completo (crear préstamo, generar cronograma, registrar pagos) y la UI. Puede reutilizar bastante patrón de `subscriptionLogic.ts` (participantes → cuotas → historial es un problema similar a cronograma → cuotas → pagos).

### Fase 3 — Metas de ahorro
Es la más simple de las que faltan: conectar `GoalsScreen` a un `GoalService` real y quitar el hardcodeo. Puede ir en paralelo con la Fase 2 si hay tiempo.

### Fase 4 — Gemini: análisis de gastos
Requiere Fase 1 completa (necesitas transacciones reales para que el análisis tenga sentido). Se implementa vía una Cloud Function que actúa de intermediario — nunca se llama a Gemini directo desde el cliente (ver sección 7).

### Fase 5 — OCR de documentos bancarios (foto → registro de préstamo)
Reutiliza la misma Cloud Function-proxy de la Fase 4, pero con Gemini Vision. Alimenta directamente al módulo de Préstamos (Fase 2).

### Fase 6 — Lectura de correo para detectar Yapes
La más compleja del roadmap completo. Requiere OAuth de Gmail, un backend con webhook o polling, y parseo de un formato de correo que puede cambiar. Se evalúa **después** de tener la Fase 5 funcionando — puede que una alternativa más simple (subir screenshot del Yape a Gemini Vision) cubra el 90% de la necesidad con una fracción del esfuerzo.

## 4. Fuera de alcance por ahora

Cosas que no vamos a documentar ni construir todavía, para no inflar el alcance:
- Multi-idioma / i18n.
- Modo multi-moneda más allá de `moneda_principal` como campo simple.
- Panel de administración o roles de usuario (es para ti y tus amigos, no hay jerarquía de permisos por ahora).
- Publicación en stores (Play Store / App Store) — mientras se use vía Expo Go o build interna.

## 5. Decisiones ya tomadas

- **Stack:** Expo + React Native + TypeScript + NativeWind, Firebase (Auth + Firestore + Storage), Gemini para IA.
- **Paleta de colores y tokens de UI:** ver `EVA-manual-colores.md`.
- **Idioma del dominio de datos:** español, `snake_case`, consistente en todas las interfaces existentes (`nombre_pantalla`, `fecha_inicio`, etc.) — se mantiene así hacia adelante para no mezclar convenciones a mitad de proyecto.
- **CI/CD:** GitHub Actions con typecheck, tests (Jest) y audit reales (ver PR `feature/real-ci-and-tests`).

## 6. Riesgos y advertencias abiertas (heredadas del análisis técnico)

- `AuthService.login` no valida contraseña — se resuelve naturalmente al migrar a Firebase Auth en la Fase 0, pero hay que confirmar que quede resuelto, no asumido.
- La API key de Gemini (`EXPO_PUBLIC_GEMINI_API_KEY`) no debe llamarse nunca directo desde el cliente en producción — de ahí que las Fases 4 y 5 pasen por una Cloud Function intermedia.
- `.env` está trackeado en git (con placeholders, no valores reales) — renombrar a `.env.example` antes de que alguien pegue una key real ahí sin querer.

## 7. Documentos relacionados

- `EVA-manual-colores.md` — Design system de colores. ✅ Existente.
- `docs/02-modelo-de-datos.md` — Modelo de datos de Firestore (colecciones, subcolecciones, reglas de seguridad). 🔜 Siguiente documento a redactar.
