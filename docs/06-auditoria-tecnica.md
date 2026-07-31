# EVA — Auditoría técnica

> Auditoría del código real (no del código que la documentación asume que existe), hecha leyendo `src/` y `app/` completos. Cada hallazgo apunta a archivo y línea, y separa **lo que está roto hoy** de **lo que va a doler después**.
>
> **Estado base verificado al momento de la auditoría:** `tsc --noEmit` pasa sin errores, y los 36 tests de `src/logic/shared/__tests__/` pasan. El proyecto no está en rojo — los hallazgos de abajo son deuda y bugs latentes, no una app rota.

## 1. Resumen ejecutivo

Lo bueno, y no es poco:

- **La separación `logic/` ↔ `screens/` ↔ `services/` es real y se respeta.** No es una carpeta decorativa: `subscriptionLogic.ts` no importa React, y las pantallas no calculan prorrateos. Esto es lo más difícil de conseguir en un proyecto personal y ya está hecho.
- **El módulo de Suscripciones es sofisticado.** Prorrateo por días, ciclos mensuales/anuales mixtos en el mismo historial, FIFO, "congelado" del costo del momento (`costo_servicio_momento`, `cuotas_momento`). Eso es modelado financiero correcto, no un CRUD.
- **Los tipos del dominio ya anticipan el futuro:** `entrada_ia_cruda`, `url_comprobante`, `tiene_desglose`. El modelo no va a tener que romperse para meter la IA.

Lo que hay que atender, en orden de gravedad:

| # | Hallazgo | Gravedad | Dónde |
|---|---|---|---|
| 1 | El modo oscuro no funciona en ~85 puntos de la UI | 🔴 Alta | `global.css` |
| 2 | Tres fuentes de tema compitiendo entre sí | 🔴 Alta | `ThemeContext`, `useAppTheme`, `useColorScheme` |
| 3 | Cualquiera entra a `(main)` sin sesión | 🔴 Alta | `app/(main)/_layout.tsx` |
| 4 | Contraste insuficiente en la tarjeta de saldo (ya en modo claro) | 🟠 Media | `DashboardScreen.tsx:108-129` |
| 5 | El nombre del contacto es la llave primaria del historial | 🟠 Media | `Subscription.ts`, `ContactService.ts` |
| 6 | La lógica de negocio muta sus argumentos | 🟠 Media | `subscriptionLogic.ts` |
| 7 | Lógica FIFO duplicada en dos sitios | 🟠 Media | `FinanceService.ts:78-99` |
| 8 | `clone()` copiado en los 6 servicios | 🟡 Baja | `src/services/*.ts` |
| 9 | Botones y pantallas muertas | 🟡 Baja | `ProfileScreen`, `add.tsx`, `GoalsScreen` |
| 10 | `ServiceHistory.tsx` con 832 líneas | 🟡 Baja | `src/screens/planning/ServiceDetail/components/` |

---

## 2. Hallazgos 🔴 Alta

### 2.1 El modo oscuro está roto en la mayoría de la UI

`tailwind.config.js` mapea los colores a variables CSS:

```js
colors: { background: "hsl(var(--background))", card: "hsl(var(--card))", ... }
```

Pero `global.css` **solo define esas variables en `:root`** — no existe ningún bloque `.dark`:

```css
:root {
  --background: 0 0% 100%;   /* #FFFFFF — blanco, siempre */
  --card: 210 20% 96%;
  ...
}
/* no hay .dark { ... } */
```

`app/_layout.tsx:66` sí pone la clase (`<View className={theme}>`) y `darkMode: "class"` está bien configurado, pero no hay nada que esa clase pueda sobrescribir. Resultado medido:

- **85 usos** de clases dependientes de esas variables (`bg-background`, `bg-card`, `text-text-primary`, `border-border`…) en `src/` y `app/`.
- **0 usos** de la variante `dark:`.

Es decir: al activar el tema oscuro desde Perfil, el `background` sigue siendo blanco en Dashboard, Metas, Planning y el resto de pantallas que usan clases. Solo se ven correctas las que usan estilos inline con `useAppTheme()` (Perfil y ServiceDetail).

**Además, las variables ya están desincronizadas de `Colors.ts`:** `global.css` define `--text-secondary` como `#8F99A1`, pero `Colors.ts` y el manual de colores usan `#6B7785` (el valor corregido por contraste). Hoy conviven dos "grises secundarios" distintos según el componente.

**Decisión tomada:** unificar todo en `Colors.ts` + `useAppTheme()` como fuente única (ver `docs/07-plan-de-sprints.md`, Sprint 1).

### 2.2 Tres sistemas de tema compitiendo

Conviven tres fuentes de verdad para "¿estamos en oscuro?":

1. **`ThemeContext`** (`src/context/ThemeContext.tsx`) — un `useState` local. Es el que controla el botón de Perfil.
2. **`useColorScheme()` de NativeWind** — usado en `DashboardScreen.tsx:26`, `PlanningScreen.tsx:4`, `LoadingSplash.tsx:32` y `app/_layout.tsx:7`. **Nada lo sincroniza con `ThemeContext`**, así que devuelve siempre el valor del sistema, independientemente de lo que el usuario eligió en la app.
3. **`useAppTheme()`** — deriva de `ThemeContext`, correcto.

Consecuencia concreta: en `DashboardScreen.tsx:27` se declara `const isDark = colorScheme === "dark"` que además **nunca se usa** (código muerto). En `LoadingSplash` sí se usa, así que el splash puede salir en oscuro mientras la app está en claro, o al revés.

Dos problemas adicionales del `ThemeContext` actual:

- **No persiste.** `AsyncStorage` está instalado como dependencia pero **no se usa en ningún archivo del proyecto** (verificado con grep). Cada reinicio vuelve a claro.
- **No respeta la preferencia del sistema.** Arranca siempre en `"light"` hardcodeado (`ThemeContext.tsx:16`), ignorando que el teléfono esté en modo oscuro.

### 2.3 No hay guardia de autenticación

No existe ninguna verificación de sesión en `app/`:

- `app/(main)/_layout.tsx` monta las tabs sin comprobar nada.
- No hay `AuthContext` (solo existe `ThemeContext` en `src/context/`).
- `app/_layout.tsx` declara el `Stack` sin lógica de redirección.

Hoy con mock es inofensivo, pero significa que **navegar directo a una ruta de `(main)` funciona sin login**. Cuando en la Fase 0 esas pantallas empiecen a pedir `uid` a Firestore, van a explotar con `null` en vez de redirigir a login. El `AuthContext` no es opcional: es el prerrequisito para que la migración a Firestore no rompa la navegación.

Relacionado: `AuthService.login` (`src/services/AuthService.ts:19`) **ignora el parámetro `password` por completo** — busca el usuario por correo y lo devuelve. Ya está documentado como riesgo conocido, y se resuelve al migrar a Firebase Auth.

---

## 3. Hallazgos 🟠 Media

### 3.1 La tarjeta de saldo falla contraste — y ya falla hoy, en modo claro

En `DashboardScreen.tsx` la tarjeta principal usa fondo `bg-primary` (`#1F7ECC`) con texto blanco translúcido. Contraste real calculado (WCAG 2.1):

| Elemento | Línea | Efectivo | Ratio | Veredicto |
|---|---|---|---|---|
| Saldo (36px bold) | `:111` | `#FFFFFF` | 4.27:1 | ✅ AA-large |
| `"SALDO TOTAL"` (14px, `text-white/80`) | `:108` | `#D2E5F5` | **3.31:1** | ❌ Falla AA |
| `"vs mes anterior"` (12px, `text-white/60`) | `:127` | `#A5CBEB` | **2.51:1** | ❌ Falla AA |

Y si esa tarjeta se pintara con el `primary` del tema oscuro (`#4FA6E8`), el texto blanco cae a **2.64:1** — falla incluso en su versión sólida.

La causa de fondo es un token faltante: `primary` se usa a la vez como *color de acento* (texto/íconos sobre fondo oscuro, donde necesita ser claro) y como *color de relleno* (fondo de tarjeta con texto blanco encima, donde necesita ser oscuro). Son requisitos opuestos y un solo token no puede cumplir ambos. La solución está en el manual de colores actualizado: separar `primary` de `primarySurface`.

### 3.2 El nombre del contacto es la llave del historial

En `PaymentHistory` (`src/interfaces/Subscription.ts`), tres diccionarios usan el nombre como llave:

```ts
registro_pagos_personas: Record<string, boolean>;  // llave = sub.nombre
cuotas_momento?: Record<string, number>;
montos_pagados?: Record<string, number>;
```

Esto obliga a `ContactService.updateContact` (`:39-63`) a mantener una cascada manual de renombrado sobre las tres estructuras, en cada suscripción y en cada mes del historial. Dos riesgos reales:

1. **Homónimos corrompen datos en silencio.** Dos contactos "Juan" comparten la misma entrada del historial. No hay validación de unicidad de nombre en `createContact`.
2. **La cascada es frágil por construcción.** Cualquier estructura nueva que se indexe por nombre hay que acordarse de agregarla ahí. `pruneOrphanSubscribers` (`:107-131`) ya replica la misma lista de tres diccionarios — si mañana aparece un cuarto, hay dos sitios que actualizar.

Esto importa más de lo que parece porque **la Fase 3 (préstamos personales) va a reutilizar este patrón FIFO**. Migrar después implicaría migrar datos reales de Firestore; migrar ahora es solo cambiar código y mock.

**Decisión tomada:** migrar a `id_suscriptor` antes de Firestore (Sprint 2 del plan).

### 3.3 La lógica de negocio muta sus argumentos

`syncServiceHistory(service)` y `applyFIFOPayment(service, ...)` en `subscriptionLogic.ts` no retornan nada: modifican el objeto recibido. `SubscriptionService.getSubscriptions()` hace justamente esto:

```ts
mockDatabase.subscriptions.forEach(sub => syncServiceHistory(sub));  // muta el "backend"
return clone(mockDatabase.subscriptions);
```

Funciona con mock porque el `clone()` posterior corta la referencia antes de que llegue a React. Pero:

- En React, mutar un objeto y volver a setearlo no dispara re-render (misma referencia). Ya hay un síntoma de esto: `useServiceDetail` expone un `setService` que las pantallas usan para forzar refresco.
- Con Firestore, `syncServiceHistory` va a tener que decidir *qué escribir*, no *mutar y esperar*. Una función que retorna el nuevo estado hace ese paso trivial; una que muta hay que reescribirla entera.

Las funciones puras además ya tienen tests (36 pasando) — convertirlas es de bajo riesgo justamente porque hay red de seguridad.

### 3.4 FIFO duplicado

Hay dos implementaciones del mismo concepto "saldar el mes pendiente más antiguo":

- `applyFIFOPayment` en `subscriptionLogic.ts:200` — la buena, con tests.
- Una reimplementación *inline* dentro de `FinanceService.togglePaymentStatus` (`:78-99`), que **redefine el mapa de meses localmente** y ordena a mano. Incluso conserva un comentario de trabajo en inglés: `// Import compareMesAnioAsc if not imported. Wait, I should implement local ascending sort`.

Dos copias de una regla de negocio financiera es exactamente donde aparecen los bugs que "solo pasan a veces": se arregla una y la otra queda vieja. Además `serviceUtils.ts` ya exporta `compareMesAnioAsc`, que es justo lo que esa copia reimplementa.

Relacionado: `mesesMap` y `mesesNombres` están definidos **dos veces** — en `serviceUtils.ts` (como `MESES_NOMBRES`) y en `serviceHistoryUtils.ts` (como `mesesMap`/`mesesNombres`), más una tercera copia local dentro de `syncServiceHistory` y una cuarta dentro de `FinanceService`.

### 3.5 `clone()` duplicado en los 6 servicios

La misma función `clone<T>()` con el mismo regex de revivir fechas está copiada literalmente en `AuthService`, `AccountService`, `ContactService`, `FinanceService`, `LoanService` y `SubscriptionService`. Igual con `networkDelay`.

Es intrascendente hoy, pero relevante para la Fase 0: cuando cada servicio migre a Firestore, ese `clone` se reemplaza por conversión de `Timestamp` → `Date`. Tener un solo `src/services/_shared.ts` convierte seis ediciones en una.

---

## 4. Hallazgos 🟡 Baja

### 4.1 Elementos muertos o de relleno

| Qué | Dónde | Detalle |
|---|---|---|
| Botón "Cerrar Sesión" | `ProfileScreen.tsx:115` | No tiene `onPress`. Se ve pulsable y no hace nada. |
| Pantalla "Nuevo Movimiento" | `app/(main)/add.tsx` | Placeholder con "Próximamente...". Es una de las 5 tabs. |
| `GoalsScreen` | `src/screens/goals/GoalsScreen.tsx` | 100% hardcodeada ("Nueva Laptop", 65%, $780). No lee ni del mock. |
| `isDark` sin usar | `DashboardScreen.tsx:27` | Variable muerta (ver 2.2). |
| `useColorScheme` sin usar | `app/_layout.tsx:7` | Importado, nunca invocado. |
| `LoanService` | `src/services/LoanService.ts` | Solo `getLoans()`. Sin CRUD. |
| `AccountService` | `src/services/AccountService.ts` | Solo `getAccounts()`. Sin CRUD, pese a que Cuentas es un módulo central. |
| Cliente Gemini | `src/api/gemini.ts` | Configurado y nunca importado por nadie. **Además expone la API key en el bundle** vía `EXPO_PUBLIC_`, justo lo que la Fase 6 dice que no hay que hacer. |
| Datos falsos en Dashboard | `DashboardScreen.tsx:124` | `+12.5% vs mes anterior` está hardcodeado. |
| Fecha falsa en Dashboard | `DashboardScreen.tsx:210` | Toda transacción dice "Hoy". |

Ninguno es urgente, pero conviene decidir explícitamente: o se implementan, o se ocultan. Un botón que no responde se siente peor que un botón ausente.

### 4.2 Componentes grandes

`ServiceHistory.tsx` tiene **832 líneas** y 16 usos de `any` — es el archivo más denso del proyecto por bastante margen (el siguiente es `EditServiceModal.tsx` con 514). Las convenciones del proyecto fijan ~200-250 líneas como señal de extracción.

No es urgente arreglarlo por estética. Sí lo es porque es el archivo donde más va a costar meter mano en la Fase 1, que es justo la fase de estabilizar Suscripciones.

### 4.3 `any` en el código

**112 usos** de `any` en `src/` y `app/`. Concentrados en:

| Archivo | Usos |
|---|---|
| `ServiceHistory.tsx` | 16 |
| `HistoryListView.tsx` | 9 |
| `ContactHistory.tsx` | 7 |
| `ParticipantPaymentView.tsx` | 6 |

Una parte grande viene del patrón `Date | any` en las interfaces, que existe para acomodar el `Timestamp` de Firestore que todavía no llega. Es un `any` con justificación, pero se puede tipar bien: `Date | Timestamp`.

`generarResumenContacto` en `financeLogic.ts` retorna `services: [] as any[]` — una función central de negocio sin tipo de retorno. Vale la pena definirle una interfaz.

### 4.4 Detalles menores

- **`ServiceDetailScreen.tsx`** es un archivo de 3 líneas que solo reexporta `./ServiceDetail`. No es duplicación real, pero son dos nombres para lo mismo; conviene que `app/service/[id].tsx` importe directo y borrar el intermediario.
- **CI apunta a una rama que ya no existe:** `.github/workflows/ci.yml` dispara en `[main, master, Probar-Theme2]`. `Probar-Theme2` es una rama de trabajo vieja y `master` no se usa (el repo usa `main`).
- **`@types/react-native` está instalado** (`package.json` devDependencies) pero React Native ya trae sus propios tipos desde 0.71. Es un paquete obsoleto que puede causar conflictos de tipos.
- **`app/_layout.tsx` declara solo 2 rutas** (`index`, `register`) en el `Stack`, aunque existen `contacts`, `forgot-password`, `service/[id]` y el grupo `(main)`. Expo Router las descubre igual por archivo, así que funciona — pero la lista parcial confunde sobre cuál es la navegación real.

---

## 5. Revisión de arquitectura

### 5.1 Veredicto

**La arquitectura está bien planteada y no necesita rehacerse.** La estructura por capas (`app/` → `screens/` → `logic/` → `services/` → `interfaces/`) es la correcta para esta app, y el proyecto la respeta de verdad. Lo que falta no es rediseñar: es **cerrar tres huecos** que hoy están vacíos.

### 5.2 Los tres huecos

**Hueco 1 — No hay capa de estado global de datos.** Hoy cada pantalla hace su propio `useEffect` + `useState` + `Promise.all` (`DashboardScreen:36-56`, `ProfileScreen:18-30`). Eso significa: sin caché, sin invalidación, refetch completo en cada montaje, y el mismo `AuthService.getUserProfile()` llamado desde Dashboard y desde Perfil por separado.

Con mock se aguanta. Con Firestore, cada montaje es una lectura facturable y una espera de red. La solución estándar es TanStack Query (React Query) o los listeners en tiempo real de Firestore envueltos en contexto. **Recomendación: decidirlo en el Sprint 3, antes de migrar los servicios**, porque migrar servicios dos veces (una a Firestore, otra a Query) es trabajo doble.

**Hueco 2 — No hay capa de contexto de sesión.** Ya descrito en 2.3. `AuthContext` es el prerrequisito de todo lo demás.

**Hueco 3 — No hay frontera de errores.** Los `catch` hacen `console.error` y siguen (`DashboardScreen:49-51`, `ProfileScreen:25-27`). Si `getAccounts` falla, la pantalla queda con `accounts: []` y el usuario ve saldo `S/0.00` — indistinguible de "no tienes dinero". En una app financiera, un error de red que se ve como saldo cero es un problema de confianza, no solo de UX. Hace falta distinguir *cargando* / *error* / *vacío* en las pantallas de datos.

### 5.3 Lo que conviene mantener tal cual

- **`logic/` como lógica pura.** Es el activo más valioso del proyecto. Todo lo que se pueda mover ahí, mejor.
- **Un servicio por dominio.** La forma de `SubscriptionService` mapea casi 1:1 a lo que van a ser las operaciones de Firestore.
- **Tipos en español `snake_case`.** Es consistente y mapea directo a las colecciones de Firestore. Cambiarlo ahora sería puro costo.
- **Hooks por feature** (`logic/serviceDetail/useServiceDetail.ts`). Buen patrón: la pantalla queda declarativa y el hook concentra el estado.

### 5.4 Una observación sobre el modelo de datos

`docs/02-modelo-de-datos.md` decide, correctamente, separar `historial_pagos` en subcolección para evitar el límite de 1MB por documento. Vale la pena anticipar la consecuencia: **`syncServiceHistory` hoy asume que tiene el historial completo en memoria** (lo recorre entero, lo ordena, lo filtra). Con subcolecciones eso deja de ser gratis.

No es un error del diseño — es que esa función va a necesitar una versión "por rango de meses" cuando se migre. Mejor saberlo antes de la Fase 0 que descubrirlo a mitad.

---

## 6. Qué NO está mal (para no arreglar lo que funciona)

Cosas que a primera vista parecen deuda y no lo son:

- **`Date | any` en las interfaces** — es un puente deliberado hacia `Timestamp` de Firestore. Se tipa bien en la Fase 0, no antes.
- **`networkDelay()` en los servicios** — simula latencia para que la UI se diseñe con estados de carga reales. Es buena práctica, no relleno. Se borra al migrar.
- **La complejidad de `syncServiceHistory`** — es alta (≈130 líneas, 5 pasos), pero el dominio *es* complejo: ciclos mixtos mensual/anual, altas a mitad de mes, prorrateo, pagos adelantados. No es complejidad accidental. Merece refactor de forma (funciones puras, pasos separados), no simplificación de fondo.
- **Las 5 tabs con una vacía** — `add.tsx` está vacía, pero la estructura de navegación es correcta y es la Fase 2 la que la llena.

---

## 7. Documentos relacionados

- `docs/07-plan-de-sprints.md` — qué se hace con todo esto y en qué orden.
- `docs/EVA-manual-colores.md` — paleta oscura corregida (hallazgos 2.1 y 3.1).
- `docs/05-convenciones-de-codigo.md` — las reglas que estos hallazgos aplican.
- `docs/01-alcance-y-fases.md` — la visión contra la que se auditó.
