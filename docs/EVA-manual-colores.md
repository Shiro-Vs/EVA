# EVA — Manual de uso de la paleta de colores

Guía de referencia para aplicar los tokens de color de forma consistente en toda la app (pantallas, componentes del design system `EVA*` y estados de UI). Válido para `ThemeContext` en modo claro y oscuro.

> **v2 — Paleta oscura rediseñada y verificada.** Todos los ratios de contraste de este documento están calculados con la fórmula de luminancia relativa de WCAG 2.1, no estimados a ojo. La versión anterior de la paleta oscura tenía tres fallos de accesibilidad medibles, documentados en la sección 14.

---

## 1. Tokens base

| Token | Rol | Claro | Oscuro |
|---|---|---|---|
| `text` | Texto principal | `#0C1B26` | `#F1F5F9` |
| `textSecondary` | Texto secundario | `#6B7785` | `#A8B6C2` |
| `muted` | Texto apagado / deshabilitado | `#78899E` | `#8496A6` |
| `background` | Fondo base | `#FFFFFF` | `#0B141C` |
| `card` | Tarjetas / superficies elevadas | `#F1F4F7` | `#16222E` |
| `elevated` | Modales, bottom sheets, menús | `#FFFFFF` | `#1E2C3A` |
| `border` | Bordes decorativos y separadores | `#E2E8F0` | `#2A3B4D` |
| `borderStrong` | Bordes funcionales (inputs, foco) | `#78899E` | `#5E7B96` |
| `primary` / `tint` | Acento de marca (texto, íconos, links) | `#1F7ECC` | `#5CB0EE` |
| `primarySurface` | Relleno de marca (tarjetas, botones) | `#1A6FB5` | `#14568C` |
| `onPrimary` | Texto/ícono sobre `primarySurface` | `#FFFFFF` | `#FFFFFF` |
| `income` | Ingresos (íconos, chips) | `#4CAF50` | `#5FCB6E` |
| `incomeStrong` | Ingresos (texto, montos) | `#1E8A3C` | `#7BD98A` |
| `expense` | Gastos (íconos, chips) | `#E63946` | `#FF6B76` |
| `expenseStrong` | Gastos (texto, montos) | `#C21F2C` | `#FF8A93` |
| `warning` | Advertencias | `#F59E0B` | `#FBBF24` |

**Regla general:** `income`/`expense`/`warning` en su tono base se usan en íconos, chips y fondos pequeños. Los `-strong` se usan cuando el color va sobre texto (montos, títulos). En modo claro los `-strong` son **más oscuros** que la base; en modo oscuro son **más claros** — la lógica es la misma (alejarse del fondo), el sentido se invierte.

---

## 2. Contraste verificado (modo oscuro)

Ratios calculados sobre `background` `#0B141C` y sobre `card` `#16222E`:

| Token | Valor | vs `background` | vs `card` | Nivel |
|---|---|---|---|---|
| `text` | `#F1F5F9` | 16.95:1 | 14.72:1 | AAA |
| `textSecondary` | `#A8B6C2` | 8.96:1 | 7.78:1 | AAA |
| `muted` | `#8496A6` | 6.10:1 | 5.29:1 | AA |
| `primary` | `#5CB0EE` | 7.87:1 | 6.83:1 | AAA / AA |
| `income` | `#5FCB6E` | 9.07:1 | 7.87:1 | AAA |
| `incomeStrong` | `#7BD98A` | 10.73:1 | 9.32:1 | AAA |
| `expense` | `#FF6B76` | 6.73:1 | 6.12:1 | AA |
| `expenseStrong` | `#FF8A93` | 8.23:1 | 7.15:1 | AAA |
| `warning` | `#FBBF24` | 11.12:1 | 9.66:1 | AAA |
| `onPrimary` sobre `primarySurface` | `#FFFFFF` / `#14568C` | — | 7.67:1 | AAA |
| `borderStrong` | `#5E7B96` | — | 3.65:1 | AA (gráfico) |

Todos los tokens de texto superan el mínimo de 4.5:1. `borderStrong` supera el mínimo de 3:1 que aplica a elementos gráficos.

---

## 3. Escala de superficies (por qué hay tres, no una)

En modo claro la jerarquía se construye con **sombras**: todo es blanco y lo elevado proyecta sombra. En modo oscuro las sombras son casi invisibles — la jerarquía se construye **subiendo la luminosidad** de la superficie.

| Nivel | Token | Oscuro | Separación vs fondo | Cuándo |
|---|---|---|---|---|
| 0 | `background` | `#0B141C` | — | Fondo de pantalla |
| 1 | `card` | `#16222E` | 1.15:1 | Tarjetas, filas de lista, tab bar |
| 2 | `elevated` | `#1E2C3A` | 1.31:1 | Modales, bottom sheets, menús |

**Por qué se subió `card` de `#131E29` a `#16222E`:** el valor anterior daba solo 1.10:1 contra el fondo — en pantallas de móvil con brillo bajo, las tarjetas del Dashboard se fundían con el fondo y la interfaz se leía como un bloque plano. `#16222E` mantiene el mismo tono azul-pizarra de marca y hace la tarjeta perceptible sin volverla gris claro.

**Regla:** nunca uses una sombra como único separador en modo oscuro. Si un elemento tiene que "flotar", súbelo un nivel de superficie; la sombra es refuerzo, no el mecanismo.

---

## 4. `primary` vs `primarySurface` — el token que faltaba

Este es el cambio más importante de la v2, y resuelve un fallo de accesibilidad que existía **también en modo claro**.

El problema: un solo token `primary` estaba cumpliendo dos trabajos con requisitos opuestos.

- Como **acento** (texto de link, ícono activo, spinner) va sobre fondo oscuro → necesita ser **claro**.
- Como **relleno** (tarjeta de saldo con texto blanco encima) → necesita ser **oscuro**, o el blanco encima no contrasta.

Con `#4FA6E8` (el `primary` oscuro anterior), el texto blanco encima daba **2.64:1** — falla incluso para texto grande. Y en modo claro, `#1F7ECC` con blanco da 4.27:1: pasa para el monto grande, pero falla para los labels pequeños de la misma tarjeta.

La solución son dos tokens separados:

| | Claro | Oscuro |
|---|---|---|
| `primary` (acento sobre fondo) | `#1F7ECC` | `#5CB0EE` |
| `primarySurface` (relleno) | `#1A6FB5` | `#14568C` |
| `onPrimary` (encima del relleno) | `#FFFFFF` | `#FFFFFF` |

### Regla crítica: no uses blanco translúcido sobre `primarySurface`

Es el error que hay hoy en la tarjeta de saldo del Dashboard. Medido sobre `primarySurface` claro `#1A6FB5`:

| Uso | Contraste | Veredicto |
|---|---|---|
| `text-white` (100%) | 5.27:1 | ✅ AA |
| `text-white/80` | 3.98:1 | ❌ Falla |
| `text-white/70` | 3.43:1 | ❌ Falla |
| `text-white/60` | 2.51:1 | ❌ Falla |

**Para jerarquía dentro de una superficie de marca, varía el peso y el tamaño de la fuente, no la opacidad.** Un label en `AsapMedium 12px` sobre blanco sólido se lee como secundario sin sacrificar contraste; el mismo label en blanco al 60% es literalmente ilegible para una parte de tus usuarios.

Si necesitas un segundo nivel de texto sobre marca, usa `onPrimaryMuted`:

| Token | Claro | Oscuro |
|---|---|---|
| `onPrimaryMuted` | `#EAF3FB` (4.70:1) | `#DCEBF7` (6.30:1) |

---

## 5. Sistema de alertas semánticas

Una alerta necesita **4 capas**: fondo suave, borde, ícono/acento y texto. Set completo para `EVAAlert` / `EVAModal`.

### Success / Confirmación positiva (ej. "Pago registrado")
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(76,175,80,0.12)` | `rgba(95,203,110,0.14)` |
| Borde | `rgba(76,175,80,0.35)` | `rgba(95,203,110,0.35)` |
| Ícono / acento | `#1E8A3C` | `#7BD98A` |
| Texto | `text` | `text` |

### Error / Peligro (ej. "No se pudo procesar el pago", eliminar servicio)
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(230,57,70,0.10)` | `rgba(255,107,118,0.14)` |
| Borde | `rgba(230,57,70,0.35)` | `rgba(255,107,118,0.35)` |
| Ícono / acento | `#C21F2C` | `#FF8A93` |
| Texto | `text` | `text` |

### Warning / Advertencia (ej. "Suscriptor no ha pagado", "Meta atrasada")
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(245,158,11,0.12)` | `rgba(251,191,36,0.14)` |
| Borde | `rgba(245,158,11,0.35)` | `rgba(251,191,36,0.35)` |
| Ícono / acento | `#B45309` | `#FBBF24` |
| Texto | `text` | `text` |

### Info / Confirmación neutra (ej. "¿Deseas continuar?", tips)
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(31,126,204,0.10)` | `rgba(92,176,238,0.12)` |
| Borde | `rgba(31,126,204,0.30)` | `rgba(92,176,238,0.30)` |
| Ícono / acento | `primary` | `primary` |
| Texto | `text` | `text` |

**Por qué así:** el fondo nunca es el color sólido —eso se ve como banner agresivo y falla en accesibilidad si hay texto encima—. Usar el color a baja opacidad sobre `background`/`card` da una superficie "tintada" legible, y el texto siempre queda en `text` (nunca en el color semántico), así se garantiza contraste alto sin depender del tono exacto de cada estado.

**Nota para modo oscuro:** las capas tintadas se calculan sobre la superficie donde se apoyan. Una alerta dentro de un modal (`elevated`) queda ligeramente más clara que la misma alerta sobre `background`; es correcto y refuerza la jerarquía.

**Modales de confirmación destructiva** (`EVAModal` para "Eliminar suscripción", "Eliminar contacto"): usar la variante *Error*, con el botón principal en `expense` y el botón secundario en ghost (ver sección 7).

---

## 6. Jerarquía tipográfica

- `text` → títulos, montos, nombres de contacto, contenido principal.
- `textSecondary` → subtítulos, fechas, descripciones, labels de formulario.
- `muted` → placeholders de `EVAInput`, texto de estados deshabilitados, iconografía inactiva del `EVATabBar`.

No uses `textSecondary` y `muted` de forma intercambiable: si el usuario puede necesitar leerlo con atención (una fecha, un subtítulo), es `textSecondary`; si es decorativo o de apoyo (placeholder, ícono inactivo), es `muted`.

> **Cambio en v2:** `muted` se aclaró en ambos temas (`#94A3B8` → `#78899E` en claro, `#64748B` → `#8496A6` en oscuro). El valor oscuro anterior daba 3.90:1 — por debajo del mínimo de 4.5:1 para texto. Como `muted` se usa en placeholders de input, era texto real fallando contraste, no decoración.

---

## 7. Botones (`EVAActionButton`)

| Variante | Fondo | Texto | Borde |
|---|---|---|---|
| Primary | `primarySurface` | `onPrimary` | — |
| Secondary / Ghost | transparente | `text` | `borderStrong` |
| Danger | `expense` | `#FFFFFF` | — |
| Disabled | `card` | `muted` | `border` |

**Nota:** el borde del botón secundario usa `borderStrong`, no `border`. Un borde es lo único que define un botón fantasma — si no llega a 3:1 contra el fondo, el botón desaparece visualmente. `border` es para separadores decorativos.

---

## 8. Inputs (`EVAInput`)

| Estado | Borde | Texto ayuda |
|---|---|---|
| Default | `borderStrong` | `textSecondary` |
| Focus | `primary` (2px) | `textSecondary` |
| Error | `expense` | `expenseStrong` |
| Disabled | `border` | `muted`, fondo `card` |

El borde de un input es un elemento gráfico funcional: comunica dónde se puede escribir. Necesita 3:1 mínimo, por eso `borderStrong` y no `border`.

---

## 9. Navegación (`EVATabBar`)

- Ítem activo: ícono + label en `primary`.
- Ítem inactivo: ícono + label en `muted`.
- Fondo de la barra: `card` con borde superior `border`.

---

## 10. Datos financieros (Dashboard, `ServiceHistory`, `ParticipantTimeline`)

- Montos positivos (ingresos, pagos recibidos): `incomeStrong` como texto; `income` como fondo de ícono circular.
- Montos negativos (gastos, cuotas): `expenseStrong` como texto; `expense` como fondo de ícono.
- Balance principal / tarjeta destacada: fondo `primarySurface`, texto `onPrimary`. **Nunca** `text` sobre marca, y nunca blanco translúcido (sección 4).

**Regla de daltonismo:** en torno al 8% de los hombres tiene alguna forma de daltonismo rojo-verde, y `income`/`expense` son exactamente ese par. Un monto **nunca** debe distinguirse solo por color: acompaña siempre con el signo (`+`/`-`), un ícono direccional (`trending-up`/`trending-down`), o ambos. Esto ya se hace bien en el Dashboard actual — mantenerlo al construir pantallas nuevas.

---

## 11. Metas (`GoalsScreen`)

- Barra de progreso: pista en `border`, relleno en `primary`.
- Meta completada (100%): relleno puede cambiar a `income` para reforzar el logro.
- Meta vencida o en riesgo: usar el patrón *Warning* de la sección 5 en la tarjeta de la meta.

---

## 12. Avatares, separadores y carga

- `EVAAvatar` con iniciales (sin foto): fondo `card`, texto `textSecondary`, borde `border`.
- `EVASeparator`: siempre `border`, sin excepción, incluso dentro de tarjetas.
- Skeletons: base `card`, brillo/shimmer con `elevated`. *(En v1 decía base `border` — en oscuro eso creaba un bloque más claro que la tarjeta que lo contiene, invirtiendo la jerarquía.)*
- Spinner: `primary`.
- Fondo de `LoadingSplash`: `background`, logo centrado (SVG claro en tema claro, PNG oscuro en tema oscuro).

---

## 13. Contactos (`ContactList`, `AddSubscriberModal`, historial)

- Fila de contacto: fondo `card`, nombre en `text`, último pago/estado en `textSecondary`.
- Estado "al día": chip con patrón *Success*.
- Estado "pendiente de pago": chip con patrón *Warning*.
- Estado "moroso / sin responder": chip con patrón *Error*.

---

## 14. Qué cambió en v2 y por qué

| Token | v1 | v2 | Motivo |
|---|---|---|---|
| `card` (oscuro) | `#131E29` | `#16222E` | 1.10:1 contra el fondo era imperceptible en móvil |
| `muted` (oscuro) | `#64748B` | `#8496A6` | 3.90:1 — fallaba el mínimo de texto, y se usa en placeholders |
| `muted` (claro) | `#94A3B8` | `#78899E` | Mismo problema en claro |
| `textSecondary` (oscuro) | `#9AA8B4` | `#A8B6C2` | Sube de AA a AAA, sin costo visual |
| `expenseStrong` (oscuro) | `#FF6B76` | `#FF8A93` | En v1 era idéntico a `expense`, así que la distinción base/strong no existía en oscuro |
| `incomeStrong` (oscuro) | `#5FCB6E` | `#7BD98A` | Mismo caso |
| `primarySurface` | — | **nuevo** | Un solo `primary` no puede ser acento y relleno a la vez (sección 4) |
| `onPrimary` / `onPrimaryMuted` | — | **nuevo** | Elimina el blanco translúcido, que fallaba contraste en ambos temas |
| `elevated` | — | **nuevo** | En oscuro las sombras no separan; hace falta un tercer nivel de superficie |
| `borderStrong` | — | **nuevo** | Los bordes de input necesitan 3:1; `border` a 1.62:1 no alcanza |

---

## 15. Accesibilidad — mínimos a respetar

- Texto normal sobre `background`/`card`/`elevated`: contraste ≥ 4.5:1.
- Texto grande (≥18px bold o ≥24px regular) y elementos gráficos (íconos, bordes funcionales de input): ≥ 3:1.
- Nunca poner `muted` como único indicador de estado (ej. error solo con texto gris): siempre acompañar con ícono o color semántico.
- Nunca usar color como único portador de información financiera (ver regla de daltonismo, sección 10).

---

## 16. Qué NO hacer

- No uses `income`/`expense`/`warning` como color de fondo sólido a pantalla completa o en banners grandes — solo en su versión tintada (sección 5) o en superficies pequeñas (chips, íconos).
- No mezcles `textSecondary` y `muted` para el mismo tipo de contenido en pantallas distintas — rompe la jerarquía.
- No apliques `text` directamente sobre `primarySurface` — usa `onPrimary`.
- **No uses opacidad para crear jerarquía de texto sobre color de marca** — usa peso y tamaño de fuente (sección 4).
- No definas un sexto tono de gris "por si acaso" — `card`, `elevated`, `border`, `borderStrong`, `textSecondary` y `muted` ya cubren toda la escala.
- No uses `#000000` puro como fondo oscuro ni `#FFFFFF` puro como texto en oscuro: el contraste extremo produce *halation* (el texto "vibra") en pantallas OLED. Por eso `background` es `#0B141C` y `text` es `#F1F5F9`.

---

## 17. Implementación

Estos tokens viven en `src/constants/Colors.ts` y se consumen **exclusivamente** vía el hook `useAppTheme()`:

```tsx
const { colors } = useAppTheme();
<View style={{ backgroundColor: colors.card, borderColor: colors.border }}>
  <Text style={{ color: colors.text }}>Saldo</Text>
</View>
```

**No uses las clases de color de NativeWind** (`bg-card`, `text-text-primary`, etc.) para color. Esas clases leen variables CSS de `global.css` que solo están definidas para modo claro, así que no responden al cambio de tema. NativeWind se sigue usando para layout, espaciado y tipografía (`flex-1`, `px-6`, `font-asap-bold`) — solo el color sale de `Colors.ts`.

Ver `docs/06-auditoria-tecnica.md` sección 2.1 para el detalle de por qué, y `docs/07-plan-de-sprints.md` Sprint 1 para la migración.

---

## 18. Documentos relacionados

- `docs/05-convenciones-de-codigo.md` — convenciones de los componentes `EVA*`.
- `docs/06-auditoria-tecnica.md` — hallazgos de contraste y del sistema de temas.
- `docs/07-plan-de-sprints.md` — cuándo se aplica esta paleta.
