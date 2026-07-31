# EVA — Plan de sprints

> Secuencia de construcción ordenada por **dependencia técnica**, no por calendario. No hay fechas ni estimaciones de horas: cada sprint se cierra cuando cumple su *Definición de Hecho*, y el siguiente empieza cuando el anterior cerró.
>
> Integra el roadmap de producto de `docs/01-alcance-y-fases.md` (Fases 0-7) con los hallazgos de `docs/06-auditoria-tecnica.md`. Donde los dos difieren en orden, este documento manda y explica por qué.

## 1. El principio que ordena todo

**Arreglar algo es más barato cuanto menos cosas dependan de ello.**

De ahí sale la única desviación importante respecto al roadmap original: `01-alcance-y-fases.md` marca la Fase 0 (Firestore) como "bloqueante" y la pone primera. Este plan **estabiliza primero la lógica de Suscripciones y recién después migra a Firestore**, por una razón concreta:

> Cambiar la llave del historial de `nombre` a `id_suscriptor` (decisión ya tomada) con datos en memoria es **editar código y un mock**. La misma decisión después de migrar es **editar código y escribir un script de migración de datos reales, con riesgo de corromper historiales de pago**.

Lo mismo aplica a convertir la lógica a funciones puras: hacerlo mientras `syncServiceHistory` opera sobre un array en memoria es refactor con 36 tests de red. Hacerlo después es refactor + reescritura de la capa de acceso a datos a la vez.

El orden resultante: **sanear lo barato → estabilizar el núcleo → persistir → construir encima**.

---

## 2. Mapa general

| Sprint | Entregable | Fase del roadmap | Depende de |
|---|---|---|---|
| 1 | Base visual y de sesión sana | — (deuda) | nada |
| 2 | Suscripciones estabilizadas | Fase 1 | 1 |
| 3 | Firestore + Auth real | Fase 0 | 2 |
| 4 | Cuentas y transacciones | Fase 2a | 3 |
| 5 | Dashboard y presupuestos | Fase 2b | 4 |
| 6 | Metas de ahorro | Fase 4 | 3 |
| 7 | Préstamos | Fase 3 | 2, 4 |
| 8 | Notificaciones push | Fase 5 | 5, 6, 7 |
| 9 | Asistente IA | Fase 6 | 5 |
| 10 | Lectura de correo | Fase 7 | 9 |

El Sprint 6 (Metas) solo depende del 3, así que puede adelantarse y meterse entre el 4 y el 5 si apetece un entregable rápido y visible.

---

## Sprint 1 — Base visual y de sesión sana

**Por qué primero:** no depende de nada, y todo lo demás se construye encima. Cada pantalla nueva que se escriba antes de unificar el sistema de color es una pantalla más que habrá que migrar después.

### Alcance

**1.1 Unificar el sistema de color** *(decisión tomada: todo a `Colors.ts` + `useAppTheme()`)*
- Ampliar `src/constants/Colors.ts` con los tokens nuevos de la paleta v2: `elevated`, `borderStrong`, `primarySurface`, `onPrimary`, `onPrimaryMuted`, y los valores corregidos de `card`, `muted`, `textSecondary`, `incomeStrong`, `expenseStrong`.
- Reemplazar los **85 usos** de clases de color de NativeWind (`bg-background`, `bg-card`, `text-text-primary`, `text-text-secondary`, `border-border`, `bg-primary`, `text-muted`) por estilos con `colors.*`.
- **No tocar** las clases de layout/espaciado/tipografía (`flex-1`, `px-6`, `font-asap-bold`). NativeWind se queda para eso.
- Eliminar de `tailwind.config.js` el bloque `colors` que mapea a variables CSS, y las variables de color de `global.css`. Si quedan definidas, alguien las volverá a usar sin querer.

**1.2 Arreglar la tarjeta de saldo del Dashboard**
- Migrar a `primarySurface` + `onPrimary`.
- Eliminar `text-white/80` y `text-white/60` (fallan contraste hoy, en modo claro). Jerarquía por peso/tamaño de fuente.

**1.3 Un solo origen de tema**
- `ThemeContext` pasa a ser la única fuente. Eliminar los `useColorScheme()` de NativeWind en `DashboardScreen`, `PlanningScreen`, `LoadingSplash` y `app/_layout.tsx`.
- Persistir la preferencia con `AsyncStorage` (ya está instalado y **no se usa en ningún archivo**).
- Arrancar respetando la preferencia del sistema (`Appearance.getColorScheme()`) en vez de forzar `"light"`, con opción de override manual.
- Añadir un tercer estado `"system"` además de `"light"`/`"dark"`.

**1.4 `AuthContext` y guardia de rutas**
- Crear `src/context/AuthContext.tsx` con: usuario actual, estado de carga de sesión, `logout()`.
- Proteger `app/(main)/` — sin sesión, redirigir a login.
- Conectar el botón "Cerrar Sesión" de `ProfileScreen:115`, que hoy **no tiene `onPress`**.
- Sigue funcionando contra el mock. Lo que importa es que la *forma* del contexto esté lista para que el Sprint 3 solo cambie la implementación de adentro.

**1.5 Limpieza**
- Borrar `isDark` sin usar (`DashboardScreen:27`) y el `useColorScheme` importado sin usar (`app/_layout.tsx:7`).
- Eliminar `src/screens/planning/ServiceDetailScreen.tsx` (reexport de 3 líneas) y apuntar `app/service/[id].tsx` directo a `./ServiceDetail`.
- Corregir los triggers de `.github/workflows/ci.yml`: quitar `Probar-Theme2` y `master`.
- Quitar `@types/react-native` de `devDependencies` (obsoleto desde RN 0.71, puede chocar con los tipos propios de RN).
- Decidir explícitamente qué hacer con la tab "Nuevo" (`app/(main)/add.tsx`): implementarla en el Sprint 4 u ocultarla hasta entonces. Un placeholder con "Próximamente" en una de 5 tabs se nota.

### Definición de Hecho
- Cambiar a modo oscuro desde Perfil cambia **todas** las pantallas, no solo Perfil y ServiceDetail.
- Cerrar y reabrir la app conserva el tema elegido.
- Navegar directo a una ruta de `(main)` sin sesión redirige a login.
- `tsc --noEmit` limpio y los 36 tests siguen pasando.
- Ningún `bg-card` / `text-text-primary` queda en el código (`grep` vacío).

---

## Sprint 2 — Suscripciones estabilizadas (Fase 1)

**Por qué aquí:** es el módulo más usado, el más complejo, y el que la Fase 3 (Préstamos) va a reutilizar. Estabilizarlo antes de Firestore evita migrar datos dos veces; estabilizarlo antes de Préstamos evita heredar el problema.

**Prerrequisito:** la sesión de mapeo de bugs con el creador (el "spike" de la Fase 1). Los puntos de abajo son los hallazgos técnicos ya confirmados por la auditoría; la sesión debe **añadir** los bugs concretos que se reproducen en el uso real, que la auditoría no puede ver desde el código.

### Alcance

**2.1 Migrar de nombre a `id_suscriptor`** *(decisión tomada)*
- Añadir `id` a la interfaz `Subscriber` y cambiar las llaves de `registro_pagos_personas`, `cuotas_momento` y `montos_pagados` de nombre a id.
- Vincular `Subscriber.id` con `Contact.id`.
- Eliminar la cascada de renombrado de `ContactService.updateContact:39-63` — deja de ser necesaria, que es justamente el punto.
- Actualizar `pruneOrphanSubscribers:107-131`, que hoy replica la misma lista de tres diccionarios.
- Actualizar el mock y los tests.

**2.2 Convertir la lógica a funciones puras**
- `syncServiceHistory(service)` → `syncServiceHistory(service): Subscription` que retorna un objeto nuevo en vez de mutar el argumento.
- Igual con `applyFIFOPayment`.
- Es de bajo riesgo precisamente porque estas funciones ya tienen cobertura de tests.

**2.3 Eliminar la lógica duplicada**
- Borrar la reimplementación inline de FIFO en `FinanceService.togglePaymentStatus:78-99` (la que conserva el comentario `// Wait, I should implement local ascending sort`) y usar `applyFIFOPayment` + `compareMesAnioAsc` de `serviceUtils`.
- Unificar los **cuatro** sitios donde está definido el mapa de meses: `serviceUtils.ts`, `serviceHistoryUtils.ts`, dentro de `syncServiceHistory` y dentro de `FinanceService`. Debe quedar uno.

**2.4 Romper `ServiceHistory.tsx`**
- 832 líneas y 16 usos de `any`. Extraer subcomponentes siguiendo el patrón que ya existe en `ServiceDetail/components/`.
- Tipar los `any` de este archivo mientras se toca (no una cruzada global por los 112 del proyecto — solo los de aquí).

**2.5 Cubrir con tests los bugs que salgan del spike**
- Cada bug reproducible que se arregle entra con un test que falle antes y pase después.

### Definición de Hecho
- Renombrar un contacto no toca ninguna estructura de historial.
- Dos contactos con el mismo nombre conviven sin corromperse.
- `subscriptionLogic.ts` no muta ninguno de sus argumentos.
- Una sola implementación de FIFO y un solo mapa de meses en todo el proyecto.
- Los bugs listados en el spike, cerrados y con test.

---

## Sprint 3 — Firestore + Auth real (Fase 0)

**Por qué aquí:** con la lógica ya estable y pura, migrar es reemplazar la capa de acceso a datos sin tocar reglas de negocio.

### Alcance

**3.0 Decidir la capa de estado de datos — antes de migrar nada**
Hoy cada pantalla hace su propio `useEffect` + `useState` (ver auditoría 5.2, Hueco 1). Sin caché, cada montaje es un refetch completo — que con Firestore es una lectura facturable y una espera de red.

Opciones: TanStack Query, o listeners en tiempo real de Firestore (`onSnapshot`) envueltos en contexto.

**Se decide aquí y no después** porque migrar los servicios a Firestore y luego envolverlos en una capa de caché es hacer el trabajo dos veces.

**3.1 Configuración de Firebase**
- Completar el checklist de `docs/03-implementacion-firebase.md` sección 1.
- Corregir la persistencia de sesión: `getAuth(app)` en `src/api/firebase.ts:16` no persiste en React Native. Sustituir por `initializeAuth` + `getReactNativePersistence(AsyncStorage)`.

**3.2 Auth real**
- Migrar `AuthService` a Firebase Auth. `login` hoy **ignora el parámetro `password`** (`AuthService.ts:19`) — verificar explícitamente que deja de hacerlo.
- Crear `users/{uid}` al registrar.
- Recuperación de contraseña con `sendPasswordResetEmail`.
- Google Sign-In (requiere development build; no funciona en Expo Go).
- Conectar el `AuthContext` del Sprint 1 a Firebase real.

**3.3 Utilidades compartidas de servicio**
- Crear `src/services/_shared.ts` con la conversión `Timestamp` ↔ `Date`, hoy copiada como `clone()` en los 6 servicios.
- Tipar `Date | any` como `Date | Timestamp` en las interfaces. Esto elimina de golpe una parte grande de los 112 `any`.

**3.4 Migrar servicios**
En este orden (de menos a más riesgo): `AccountService` → `ContactService` → `FinanceService` → `SubscriptionService` → `LoanService`.

Atención especial a `syncServiceHistory`: hoy asume el historial completo en memoria, pero el modelo de datos lo separa en subcolección. Necesita una versión "por rango de meses" (ver auditoría 5.4).

**3.5 Seguridad**
- Escribir y desplegar `firestore.rules` con aislamiento por `uid`.
- Probar con dos cuentas que una no puede leer datos de la otra.
- Configurar el Local Emulator Suite para que los tests no peguen al proyecto real.

**3.6 Manejo de errores**
- Distinguir *cargando* / *error* / *vacío* en las pantallas de datos. Hoy un fallo de red deja el saldo en `S/0.00`, indistinguible de "no tienes dinero" (auditoría 5.2, Hueco 3). En una app financiera eso es un problema de confianza.

### Definición de Hecho
- Login con password incorrecto **falla**.
- La sesión sobrevive cerrar y reabrir la app por completo.
- Dos cuentas de prueba no se ven los datos entre sí (verificado a mano).
- Ningún servicio importa `mockDatabase`.
- Un fallo de red muestra estado de error, no ceros.

---

## Sprint 4 — Cuentas y transacciones (Fase 2a)

**Por qué aquí:** es el hueco más grande del producto respecto a la visión. EVA es una app de finanzas y hoy no se puede registrar un gasto a mano.

### Alcance
- CRUD completo de `AccountService` (hoy **solo tiene `getAccounts`**) + pantalla de gestión de cuentas: débito, crédito, billetera digital, con día de corte/pago.
- Pantalla de creación/edición de transacciones — la tab "Nuevo" (`add.tsx`), hoy un placeholder.
- Soporte del desglose opcional (`tiene_desglose` / `detalles_desglose` ya existen en la interfaz).
- Reemplazar los datos falsos del Dashboard: `+12.5% vs mes anterior` hardcodeado (`DashboardScreen:124`) y el "Hoy" fijo en toda transacción (`:210`).

### Definición de Hecho
- Registrar un gasto a mano desde la app, que persiste y aparece en el Dashboard con su fecha real.
- Crear, editar y eliminar cuentas desde la UI.
- Cero datos hardcodeados en el Dashboard.

---

## Sprint 5 — Dashboard y presupuestos (Fase 2b)

### Alcance
- CRUD de categorías (nombre, ícono, color, `presupuesto_mensual` — el campo ya existe, la lógica no).
- Lógica de alerta de presupuesto: acercándose al límite (ej. 80%) y sobrepasado. Usa el patrón *Warning* del manual de colores.
- Gráfico de gastos por categoría.
- Filtro por periodo (mes actual, anterior, rango).
- Balance desglosado por cuenta, no solo el total.

### Definición de Hecho
- El usuario ve en qué gastó más este mes vs. el anterior.
- Pasar el 80% de una categoría dispara una alerta visible.

---

## Sprint 6 — Metas de ahorro (Fase 4)

**Puede adelantarse:** solo depende del Sprint 3. Es el sprint más barato del plan y convierte una pantalla falsa en una real.

### Alcance
- Crear `GoalService` (no existe).
- Conectar `GoalsScreen`, hoy **100% hardcodeada** ("Nueva Laptop", 65%, $780 — no lee ni del mock).
- Progreso, fecha límite, prioridad.
- Aportar a una meta desde una transacción (`id_meta_destino` ya existe en `Transaction`).

### Definición de Hecho
- Crear una meta, aportarle dinero y ver el progreso real persistido.

---

## Sprint 7 — Préstamos (Fase 3)

**Depende del Sprint 2** (reutiliza el FIFO ya saneado) **y del 4** (los pagos generan transacciones).

### ⚠️ Decisión pendiente antes de arrancar
Cuando se configura `tasa_interes` en un préstamo personal: ¿EVA calcula el monto de la cuota automáticamente, o el interés es informativo y el usuario ingresa la cuota a mano? Está en `01-alcance-y-fases.md` sección 6 y sigue sin resolverse.

### Alcance
- Ampliar el modelo: `modalidad` (`bancario` | `personal_con_cronograma` | `personal_cuenta_corriente`) y `rol` (`deudor` | `acreedor`). Hoy `Loan` es un tipo único y genérico.
- Subcolecciones `schedule/` (cronograma) y `movements/` (cuenta corriente).
- CRUD completo en `LoanService` (hoy **solo `getLoans`**).
- UI de creación con validación condicional: interés y fechas obligatorios solo en bancario.
- Préstamo personal donde el usuario presta → exige vincular un Contacto.
- Reutilizar el FIFO de Suscripciones para cobrar préstamos personales.

### Definición de Hecho
- Las tres modalidades se crean y se distinguen.
- Un pago adelantado salda las cuotas más antiguas primero.
- `saldo_actual` de una cuenta corriente nunca se desincroniza de sus movimientos.

---

## Sprint 8 — Notificaciones push (Fase 5)

**Depende de 5, 6 y 7:** no tiene sentido alertar sobre presupuestos, metas y préstamos que no existen. Requiere plan Blaze.

### ⚠️ Decisión pendiente
¿Cuántos días de anticipación para avisar un pago próximo? ¿Configurable o fijo (ej. 3 días)?

### Alcance
- Registrar `deviceTokens` por usuario.
- Cloud Function programada que revise a diario: pago próximo, deuda de contacto, meta atrasada, presupuesto excedido.
- Envío vía Firebase Cloud Messaging.

### Definición de Hecho
- Una notificación llega con la app cerrada, para al menos uno de los cuatro casos.

---

## Sprint 9 — Asistente IA (Fase 6)

**Depende del Sprint 5:** sin transacciones y categorías reales no hay nada que analizar.

### 🔴 Deuda de seguridad a resolver primero
`src/api/gemini.ts` inicializa el cliente con `EXPO_PUBLIC_GEMINI_API_KEY`. **Todo lo que lleva el prefijo `EXPO_PUBLIC_` acaba en el bundle del cliente**, o sea que la API key es extraíble de cualquier build. Hoy no hay fuga real porque ese archivo no lo importa nadie — pero es exactamente lo que `01-alcance-y-fases.md` sección 6 dice que no debe pasar. Este sprint empieza borrando esa key del cliente.

### Alcance (en este orden, cada uno depende del anterior)
1. **Cloud Function proxy** con la key en Secret Manager. Prerrequisito de todo lo demás.
2. **Análisis de gastos y tips** sobre datos reales.
3. **Escaneo de boletas** con cámara → Storage → Gemini Vision → prellenar transacción. El usuario **siempre confirma** antes de guardar.
4. **Escaneo de documentos de préstamo** → prellenar el cronograma del Sprint 7.
5. **Reportes en PDF**.

### Definición de Hecho
- La API key de Gemini no aparece en el bundle del cliente (verificado sobre el build, no asumido).
- Una foto de boleta prellena monto y fecha, y nunca guarda sin confirmación.

---

## Sprint 10 — Lectura de correo (Fase 7)

**El último por diseño:** es el de mayor esfuerzo, mayor riesgo regulatorio y el que más depende de que todo lo demás funcione.

### ⚠️ Este sprint empieza con una decisión, no con código
- ¿Backend propio con OAuth de Gmail, o proveedor tipo Plaid/Belvo?
- El scope de lectura de Gmail es sensible ante Google: puede exigir una revisión de seguridad antes de aprobar producción. **Investigar el proceso y los tiempos antes de comprometerse.**
- **Alternativa de mucho menor esfuerzo:** "sube el screenshot del Yape y que Gemini Vision lo lea", reutilizando el punto 3 del Sprint 9. Cubre buena parte del caso de uso sin tocar Gmail API. Vale la pena probarla antes de construir la integración completa.
- Revisar obligaciones bajo la Ley N.º 29733 de Protección de Datos Personales antes de abrir esto a usuarios que no conoces personalmente.

### Definición de Hecho
- Documento de decisión técnica **antes** de escribir código de integración.

---

## 3. Reglas que aplican a todos los sprints

- **Una rama por sprint**, con PRs pequeños dentro. Un PR, un propósito (`docs/05-convenciones-de-codigo.md` sección 7).
- **`main` no recibe commits directos.**
- **El CI tiene que estar en verde antes de mergear** — typecheck, tests y audit. No mergear con checks en amarillo.
- **Todo bug arreglado entra con un test** que falle antes y pase después.
- **No se agregan `any` nuevos.** Al tocar una función que ya tiene, tiparla.
- **La lógica de negocio nueva va en `logic/`**, pura y con tests. Es lo mejor que tiene el proyecto; no romper el patrón.

---

## 4. Preguntas abiertas que siguen sin resolverse

| Pregunta | Bloquea | Estado |
|---|---|---|
| ¿Qué bugs concretos tiene Suscripciones? | Sprint 2 | Necesita sesión con el creador |
| ¿EVA calcula la cuota con interés, o es informativo? | Sprint 7 | Abierta |
| ¿Días de anticipación de las alertas, fijo o configurable? | Sprint 8 | Abierta |
| ¿Gmail API propio o proveedor tipo Plaid/Belvo? | Sprint 10 | Abierta |
| ¿TanStack Query o listeners de Firestore? | Sprint 3 | Se decide al inicio del sprint |

## 5. Decisiones ya tomadas en este plan

- **Sistema de color:** fuente única en `Colors.ts` + `useAppTheme()`. NativeWind se queda para layout, no para color.
- **Llave del historial:** migrar de `nombre` a `id_suscriptor`, antes de Firestore.
- **Orden:** estabilizar Suscripciones **antes** de migrar a Firestore, invirtiendo el orden del roadmap original.
- **Planificación:** por dependencia, sin fechas.

---

## 6. Documentos relacionados

- `docs/01-alcance-y-fases.md` — la visión de producto.
- `docs/02-modelo-de-datos.md` — modelo de Firestore.
- `docs/03-implementacion-firebase.md` — detalle técnico del Sprint 3.
- `docs/04-roadmap-sprints.md` — milestones e issues de GitHub.
- `docs/05-convenciones-de-codigo.md` — reglas de código.
- `docs/06-auditoria-tecnica.md` — de dónde salen los hallazgos citados aquí.
- `docs/EVA-manual-colores.md` — paleta que aplica el Sprint 1.
