# EVA — Convenciones de Código

> Documento vivo. Describe cómo ya se está trabajando en el proyecto (para no perder consistencia) y fija criterio para lo que falta construir. No introduce cambios retroactivos obligatorios sobre código existente que funciona — aplica hacia adelante, y como guía al tocar código viejo.

## 1. Idioma y nombres

- **Dominio de datos en español, `snake_case`:** nombres de campos en interfaces (`nombre_pantalla`, `fecha_inicio`, `costo_servicio_momento`), nombres de colecciones de Firestore (`users`, `services`, `contacts`). Ya es el patrón consistente en todo `src/interfaces/` — se mantiene así, no se mezcla con inglés a mitad de proyecto.
- **Identificadores de código en inglés:** nombres de funciones, variables, componentes, tipos TS (`Subscription`, `calculateProratedQuota`, `AuthService`). Es el patrón ya usado — la única "mezcla" intencional es que los *campos dentro* de esos tipos están en español (sección de arriba), porque describen el dominio del negocio, no la mecánica del código.
- **Componentes del design system:** prefijo `EVA` (`EVAActionButton`, `EVAModal`, `EVAInput`) — ya establecido en `src/components/common/`. Todo componente reusable de UI que no sea específico de una pantalla va con este prefijo.
- **Archivos de componente:** `PascalCase.tsx` igual al nombre del componente exportado.
- **Hooks:** `useNombreDescriptivo.ts`, siempre con el prefijo `use` (ya usado: `useAppTheme`, `useLogin`, `useRegister`).
- **Servicios:** `NombreService.ts`, uno por dominio (`AuthService`, `AccountService`) — ya establecido, se mantiene también al migrar a Firebase real (Fase 0).

## 2. Estructura de carpetas

```
app/                    # Rutas de Expo Router (navegación)
  (main)/                 # Rutas protegidas (requieren sesión)
  service/                # Rutas de detalle de servicio

src/
  api/                   # Clientes de servicios externos (firebase.ts, gemini.ts)
  components/
    common/                # Design system EVA* — reusable en toda la app
    layout/                # Estructura de pantalla (headers, contenedores)
  constants/             # Valores fijos compartidos
  context/               # React Context (ThemeContext, y el futuro AuthContext)
  data/mock/             # Datos de prueba — se retira progresivamente en la Fase 0
  hooks/                 # Hooks genéricos no ligados a una pantalla
  interfaces/            # Tipos TS del dominio (un archivo por entidad)
  logic/                 # Lógica de negocio pura, sin JSX ni llamadas a servicios
    shared/                 # La que ya tiene tests (subscriptionLogic, financeLogic, etc.)
    <feature>/              # Lógica específica de una feature (auth, contacts, serviceDetail)
  screens/                # Pantallas completas, organizadas por feature
  services/               # Acceso a datos (hoy mock, Fase 0 en adelante Firestore)
  utils/                  # Utilidades genéricas sin estado de negocio
```

**Regla para dónde va código nuevo:** si toma decisiones (calcula, valida, transforma datos) va en `logic/`; si solo pinta UI va en `screens/` o `components/`; si lee o escribe datos va en `services/`. Esta separación ya existe y es una de las cosas mejor logradas del proyecto — el objetivo es no romperla según se agreguen features nuevas (préstamos, metas, IA).

## 3. Componentes: tamaño y extracción

Se identificaron componentes de más de 800 líneas (`ServiceHistory.tsx`) en el código actual. Criterio hacia adelante:

- Si un componente de pantalla supera ~200-250 líneas, es señal de que hay que extraer subcomponentes (ya hay buen precedente en `src/screens/planning/ServiceDetail/components/`) o mover lógica a un hook dedicado en `logic/`.
- Un componente no debería mezclar más de un "motivo para cambiar": si cambia porque cambió el diseño visual Y porque cambió una regla de negocio, esas dos cosas van separadas (JSX en el componente, regla de negocio en `logic/`).

## 4. TypeScript

- `strict: true` ya está activo en `tsconfig.json` — se mantiene.
- **Evitar `any`.** Si el tipo real es complejo o viene de Firestore (`Timestamp`), se tipa explícitamente (`Date | Timestamp`) en vez de usar `any` como escape. Hoy existen ~95 usos de `any` en el código heredado — no hace falta una cruzada para eliminarlos todos de una vez, pero código nuevo no debería agregar más, y al tocar una función que ya tiene `any`, es buen momento para tipar bien esa parte.
- Los tipos de dominio viven en `src/interfaces/`, un archivo por entidad, coincidiendo con las colecciones de `docs/02-modelo-de-datos.md`.

## 5. Estado y mutabilidad

- **No mutar objetos de estado directamente.** Se encontró este patrón en `subscriptionLogic.ts` (`service.historial_pagos = ...`) — funciona con mock porque no hay React state real de por medio en las pruebas actuales, pero es una fuente clásica de bugs silenciosos en React (el componente no se re-renderiza porque la referencia del objeto no cambió). Hacia adelante: siempre retornar un objeto/array nuevo (`{ ...service, historial_pagos: [...] }`) en vez de mutar el original. Esto se corrige de forma natural al migrar `subscriptionLogic.ts` en la Fase 1 (estabilización de Suscripciones).

## 6. Tests

- Los tests de lógica de negocio pura viven junto al código que prueban, en una carpeta `__tests__/` (ej. `src/logic/shared/__tests__/`), no en una carpeta `__tests__` centralizada en la raíz.
- **Qué se testea con prioridad:** funciones en `logic/` (son puras, fáciles de probar, y son donde vive la complejidad real del negocio — prorrateo, FIFO, cálculo de deuda). No es objetivo por ahora tener cobertura de componentes de UI (`screens/`) — el retorno de inversión es menor para un proyecto de este tamaño.
- Fechas dinámicas (`new Date()` dentro de la función bajo prueba) se controlan con `jest.useFakeTimers()` + `jest.setSystemTime(...)`, nunca dejando que el test dependa de la fecha real de ejecución.
- Ver `docs/03-implementacion-firebase.md` sección 2.4 para el plan de Firebase Local Emulator Suite una vez que los servicios dejen de ser mock.

## 7. Git: ramas, commits y PRs

- **`main` no recibe commits directos.** Todo cambio va por una rama descriptiva y un Pull Request.
- **Convención de nombres de rama:** `feature/<descripcion-corta>` para código nuevo, `docs/<descripcion-corta>` para documentación, `fix/<descripcion-corta>` para corrección de bugs puntuales.
- **Mensajes de commit:** primera línea en formato `tipo: descripción corta en imperativo` (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`), seguida de una línea en blanco y bullets explicando el *por qué*, no solo el *qué* — el diff ya muestra el qué.
- **Un PR, un propósito.** Se evita mezclar, por ejemplo, un fix de bug con una feature nueva en el mismo PR, para que sea revisable de un vistazo.

## 8. CI

- Todo PR corre typecheck (`tsc --noEmit`), tests (`jest`) y audit (`npm audit --audit-level=high`) reales antes de poder mergear — ver `.github/workflows/ci.yml`. Un PR con typecheck o tests en rojo no se mergea, aunque sea documentación acompañando el cambio (si el PR toca código).

## 9. Documentos relacionados

- `docs/01-alcance-y-fases.md` — visión y roadmap.
- `docs/02-modelo-de-datos.md` — modelo de Firestore.
- `docs/03-implementacion-firebase.md` — plan técnico de la Fase 0.
- `EVA-manual-colores.md` — design system de colores (complementa la sección 1 de este documento en cuanto a componentes `EVA*`).
