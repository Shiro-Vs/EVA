# EVA — Alcance y Fases

> Documento vivo. Se actualiza cada vez que se cierra o reprioriza una fase. No es un contrato — es el mapa para no perdernos entre features mientras el proyecto crece.
>
> **v2** — Se amplía después de conversar la visión completa con el creador del proyecto. La v1 asumía "app cerrada para un grupo de amigos"; esta versión refleja que EVA está pensada como un producto que **podría escalar a más usuarios** si funciona bien, no solo una herramienta interna.

## 1. Visión

EVA es una app de gestión financiera personal. Cada usuario crea su propia cuenta (correo/contraseña o Google Sign-In) y controla sus propios datos: cuentas bancarias, gastos, suscripciones compartidas con otras personas, préstamos (bancarios y entre personas), metas de ahorro, y un asistente de IA que ayuda a registrar y entender los movimientos con la menor fricción posible.

A diferencia de un ERP como FIVUZA, EVA no tiene organizaciones ni jerarquía de roles — es un producto **B2C de cuenta individual**, similar en espíritu a apps como Fintonic o Wallet, pero adaptado a la forma de pagar de Perú (Yape, Plin, servicios compartidos entre roommates/familia).

**Importante para el diseño técnico:** como existe intención real de escalar más allá de un grupo cerrado, el proyecto se construye desde ahora con la disciplina de seguridad y privacidad de un producto real (reglas de Firestore por usuario, nunca exponer llaves de API en el cliente, scopes mínimos en OAuth), aunque el equipo siga siendo una sola persona. No se trata de sobre-ingeniería — se trata de no acumular deuda que sea cara de pagar después si la app efectivamente crece.

## 2. Módulos del producto

### 2.1 Cuentas y autenticación
Cada usuario se registra con correo/contraseña o Google Sign-In. Sus datos (cuentas, transacciones, suscripciones, préstamos, metas) están aislados por `uid` — nadie más los puede leer.

### 2.2 Cuentas bancarias / billeteras
Registro de cuentas (débito, crédito, billetera digital tipo Yape/Plin), con saldo, día de corte/pago para tarjetas de crédito. Ya modelado en la interfaz `Account`, falta el CRUD completo.

### 2.3 Ingresos y egresos
Registro de transacciones, categorizadas, con desglose opcional (una compra con varios ítems de distintas categorías). Ya existe parcialmente (`FinanceService.createTransaction`, Dashboard parcial).

### 2.4 Presupuestos por categoría
Cada categoría puede tener un `presupuesto_mensual`. La app debe alertar cuando el usuario está por acercarse al límite y cuando ya se pasó. Nuevo — no existe implementación aún, solo el campo en la interfaz.

### 2.5 Suscripciones y servicios compartidos
El módulo más maduro del proyecto (prorrateo, ciclos, pagos FIFO, historial). **Tiene deuda técnica conocida que el propio creador identificó como "no está bien, falta arreglar muchas cosas"** — antes de seguir construyendo funcionalidad nueva sobre este módulo, hay que estabilizarlo (ver Fase 1 y sección 6, "Preguntas abiertas").

### 2.6 Contactos y cobros
Gestión de las personas con las que se comparten servicios o préstamos. Un contacto no es necesariamente un usuario de EVA — es simplemente alguien a quien se le hace seguimiento de deuda.

### 2.7 Préstamos
Dos variantes, en el mismo módulo pero con reglas distintas:

- **Préstamo bancario:** el usuario le debe a una entidad financiera. No necesita ser muy complejo — lo importante es trackear fechas de pago (para alertas), tasa de interés y moras, replicando lo que trae el documento típico que da el banco al desembolsar el préstamo. Este documento, en una fase posterior, se podrá escanear con la cámara (ver 2.9) para autocompletar estos datos.
- **Préstamo entre personas:** el usuario le presta a alguien o alguien le presta al usuario. Configurar interés y fechas es opcional (a diferencia del préstamo bancario, donde sí son obligatorios). Si el usuario es quien presta, la otra persona **debe existir como Contacto** para poder cobrarle de forma automática — este flujo reutiliza gran parte de la lógica que ya existe para el cobro de suscripciones compartidas (FIFO, historial de pagos).

### 2.8 Metas de ahorro
Siempre personales (no compartidas entre varios usuarios, al menos no en esta etapa). Hoy la pantalla existe pero está hardcodeada — no lee del mock ni de nada real.

### 2.9 Asistente de IA (Gemini)
Es el módulo más ambicioso y con más partes móviles. Incluye:
- **Análisis de gastos y tips de gestión de dinero:** sugerencias personalizadas en base a los datos reales del usuario (patrones de gasto, categorías donde más gasta, comparación mes a mes).
- **Escaneo de documentos con la cámara:** boletas/recibos para registrar transacciones automáticamente, y documentos de préstamos bancarios para autocompletar el módulo de préstamos (2.7).
- **Reportes en PDF:** generación de reportes descargables/compartibles con el resumen financiero del usuario.
- Todo esto pasa por una Cloud Function como intermediaria — la API key de Gemini nunca se llama directo desde el cliente (ver sección 6).

### 2.10 Notificaciones push
Alertas que lleguen aunque la app esté cerrada: próximo pago de un préstamo o suscripción, alguien te debe, meta atrasada, presupuesto por pasarse o ya sobrepasado. Requiere Firebase Cloud Messaging + Cloud Functions programadas (no puede resolverse solo desde el cliente).

### 2.11 Lectura de correo (Yape, Plin, transferencias)
Cada usuario conecta su propia cuenta de correo (la que recibe las notificaciones de sus pagos). El objetivo final es cubrir Yape, Plin y transferencias bancarias en general — se empieza por Yape porque tiene el formato de correo más predecible, y se expande después. El correo trae casi todo el dato (ingreso/egreso, monto, contraparte, fecha/hora): la idea es que EVA lo pre-rellene automáticamente, pero **el usuario siempre confirma antes de que se guarde** — nunca se registra un movimiento sin que la persona lo vea primero.

## 3. Estado actual del código (auditado, no asumido)

Leyenda: ✅ Implementado y funcional (sobre mock) · 🟡 Parcial / solo scaffolding · ⬜ No existe

| Módulo | Interfaz (tipo) | Servicio (mock) | Pantalla / UI | Notas |
|---|---|---|---|---|
| Autenticación | ✅ `User` | 🟡 `AuthService` | ✅ Login/Registro/Recuperar | Login no valida password. Sin persistencia de sesión. Falta Google Sign-In. |
| Suscripciones / servicios compartidos | ✅ `Subscription` | ✅ `SubscriptionService` + `subscriptionLogic.ts` | ✅ Planning, detalle, historial, pagos | Funcional pero con deuda técnica que el propio creador quiere sanear antes de seguir. |
| Contactos / cobros | ✅ `Contact` | ✅ `ContactService` | ✅ Lista, historial, recordatorios | Cubierto por tests. Falta soportar que un Contacto también sea deudor de un préstamo personal (2.7). |
| Cuentas (bancos, billeteras) | ✅ `Account` | 🟡 Solo `getAccounts` | 🟡 Se leen en Dashboard, sin gestión | Ya contempla crédito y billetera digital. |
| Transacciones (ingresos/egresos) | ✅ `Transaction` | 🟡 `getTransactions`/`createTransaction` ya existen | ⬜ Sin pantalla de creación manual | `entrada_ia_cruda` y `url_comprobante` ya anticipan IA y fotos de comprobante. |
| Presupuestos por categoría | Campo en `Category` | ⬜ | ⬜ | Solo el campo `presupuesto_mensual` existe, sin lógica de alerta. |
| Dashboard | — | — | 🟡 Muestra saldo total + últimas 5 transacciones | Falta gráficos, filtros por periodo. |
| Préstamos | ✅ `Loan`/`LoanSchedule` | 🟡 Solo `getLoans` | ⬜ | Falta distinguir bancario vs. personal en el modelo (hoy es un solo tipo genérico). |
| Metas de ahorro | ✅ `Goal` | ⬜ No existe `GoalService` | 🟡 Hardcodeada, no lee nada real | La más atrasada del proyecto. |
| Asistente IA (Gemini) | — | 🟡 Cliente configurado, sin usar | ⬜ | Ninguna de las 3 subfeatures (análisis, OCR, PDF) iniciada. |
| Notificaciones push | — | ⬜ | ⬜ | No iniciado. |
| Lectura de correo | — | ⬜ | ⬜ | No iniciado — la feature más compleja de todo el roadmap. |
| Persistencia real (Firebase) | ✅ Cliente configurado | ⬜ Ningún servicio lo usa | — | Todo corre sobre `mockDatabase` en memoria. |
| Tests / CI | — | — | — | ✅ Resuelto (`feature/real-ci-and-tests`): 36 tests, CI real. |
| Design system de colores | — | — | — | ✅ Documentado en `EVA-manual-colores.md`. |

## 4. Fases (orden recomendado)

El orden prioriza: primero lo que bloquea todo lo demás (datos reales), luego estabilizar lo que ya existe y es lo más usado, luego completar el core financiero, y al final las features de IA/integraciones externas — que son las más complejas y las que más dependen de que ya haya datos reales fluyendo por la app.

### Fase 0 — Firestore real + autenticación multi-usuario (bloqueante)
- Migrar todos los servicios de `mockDatabase` a Firestore.
- Auth con correo/contraseña **y** Google Sign-In.
- Reglas de seguridad (`firestore.rules`) con aislamiento estricto por `uid`.
- Persistencia de sesión (hoy no existe ni con mock).
- Documento correspondiente: `docs/02-modelo-de-datos.md` (siguiente a redactar).

### Fase 1 — Estabilizar Suscripciones
Antes de construir más funcionalidad (como préstamos personales, que van a reutilizar esta lógica), sanear el módulo que ya existe. Requiere una sesión aparte contigo para mapear específicamente qué se siente "mal" — bugs puntuales, componentes difíciles de modificar, o ambos (ver sección 6).

### Fase 2 — Ingresos/Egresos, Dashboard y Presupuestos
- Pantalla de creación/edición manual de transacciones.
- Gestión de cuentas (crear, editar, eliminar).
- Gestión de categorías + lógica de alerta de presupuesto (acercándose / sobrepasado).
- Completar Dashboard (gráficos, filtro por periodo, balance por cuenta).

### Fase 3 — Préstamos (bancarios y personales)
- Separar en el modelo de datos préstamo bancario vs. préstamo personal (comparten estructura de cronograma, difieren en obligatoriedad de interés/fechas y en que el personal se vincula a un Contacto).
- Reutilizar patrón FIFO de `subscriptionLogic.ts` para el cobro de préstamos personales.
- UI de creación, cronograma y registro de pagos.

### Fase 4 — Metas de ahorro
Conectar `GoalsScreen` a un `GoalService` real. La más simple de las que faltan; puede adelantarse si hay tiempo libre entre fases.

### Fase 5 — Notificaciones push
Depende de que ya existan préstamos, presupuestos y metas reales sobre los que alertar. Firebase Cloud Messaging + Cloud Functions programadas para: pago próximo, deuda de contacto, meta atrasada, presupuesto excedido.

### Fase 6 — Asistente IA (Gemini)
En este orden interno, porque cada una depende de la anterior teniendo datos reales:
1. Análisis de gastos y tips (necesita transacciones reales de la Fase 2).
2. Escaneo de boletas/recibos con cámara (alimenta transacciones).
3. Escaneo de documentos de préstamo bancario con cámara (alimenta la Fase 3).
4. Reportes en PDF.

Todo vía Cloud Function-proxy — nunca Gemini directo desde el cliente.

### Fase 7 — Lectura de correo (Yape → Plin/transferencias)
La más compleja de todas: OAuth de Gmail por usuario, backend con webhook o polling, parseo de formato de correo (empezando por Yape). Se evalúa si, dado el esfuerzo, conviene primero cubrir el mismo caso de uso con "sube el screenshot del Yape y que Gemini Vision lo lea" (reutilizando la Fase 6.2) antes de meterse a integrar Gmail API completo.

## 5. Fuera de alcance por ahora

- Organizaciones, equipos o roles de usuario — EVA es de cuenta individual, no tiene jerarquía tipo FIVUZA.
- Multi-moneda con conversión real (por ahora `moneda_principal` es un campo simple, sin tipo de cambio).
- Monetización / planes de pago — no es parte de esta etapa de construcción.
- Publicación formal en stores — mientras se valide con Expo Go o builds internas.

## 6. Riesgos y preguntas abiertas

### Riesgos técnicos
- `AuthService.login` no valida contraseña — se resuelve en la Fase 0 al migrar a Firebase Auth, pero hay que confirmarlo, no asumirlo.
- La API key de Gemini nunca debe llamarse directo desde el cliente — todas las features de IA pasan por Cloud Function.
- `.env` está trackeado en git con placeholders — renombrar a `.env.example` antes de que alguien pegue una key real ahí.
- **Nuevo, por el cambio de alcance:** dar acceso de lectura a Gmail es un scope sensible ante Google — cuando se llegue a la Fase 7, Google puede exigir una revisión de seguridad de la app antes de aprobar el acceso en producción (no solo en modo de prueba con cuentas propias). Vale la pena investigarlo quinto antes de invertir tiempo en construir esa integración.
- Si la app efectivamente escala más allá de un grupo cerrado, hay que revisar en algún momento qué obligaciones aplican bajo la Ley de Protección de Datos Personales (Ley N.º 29733) en Perú, dado que se van a manejar datos financieros y de correo de terceros. No es bloqueante para seguir construyendo, pero sí antes de abrir la app a usuarios que no conoces personalmente.

### Preguntas abiertas (no bloquean el trabajo actual, pero hay que resolverlas antes de sus fases correspondientes)
- **Suscripciones (Fase 1):** ¿qué específicamente se siente mal? ¿Son bugs concretos que reproduces, o es que el código es difícil de modificar sin romper algo? Esto define si la Fase 1 es una sesión de debugging dirigido o una refactorización más de fondo.
- **Préstamos (Fase 3):** cuando configuras interés en un préstamo personal, ¿quieres que EVA calcule automáticamente el monto de la cuota con interés compuesto/simple, o el interés es solo informativo y tú ingresas el monto de cuota manualmente?
- **Notificaciones (Fase 5):** ¿con cuántos días de anticipación quieres la alerta de un pago próximo? ¿Es configurable por el usuario o un valor fijo para empezar (ej. 3 días antes)?
- **Lectura de correo (Fase 7):** cuando definamos esa fase en detalle, ¿el correo se procesa completo en un backend tuyo, o hay apertura a usar un servicio ya armado para esto (algunos fintechs usan proveedores tipo Plaid/Belvo para Latam) en vez de parsear el HTML del correo a mano?

## 7. Decisiones ya tomadas

- **Stack:** Expo + React Native + TypeScript + NativeWind, Firebase (Auth + Firestore + Storage + Cloud Messaging + Cloud Functions), Gemini para IA.
- **Modelo de cuentas:** B2C, cuenta individual por usuario (no hay organizaciones ni multi-tenant estilo FIVUZA). El aislamiento de datos en Firestore es por `uid`, vía reglas de seguridad — no por schema separado como en el Postgres de FIVUZA (Firestore no soporta ese patrón; el equivalente correcto en NoSQL es scoping por reglas).
- **Paleta de colores y tokens de UI:** ver `EVA-manual-colores.md`.
- **Idioma del dominio de datos:** español, `snake_case`, consistente en todas las interfaces existentes.
- **CI/CD:** GitHub Actions con typecheck, tests (Jest) y audit reales.

## 8. Documentos relacionados

- `EVA-manual-colores.md` — Design system de colores. ✅ Existente.
- `docs/02-modelo-de-datos.md` — Modelo de datos de Firestore (colecciones, subcolecciones, reglas de seguridad, incluyendo el nuevo alcance multi-usuario). 🔜 Siguiente documento a redactar.
