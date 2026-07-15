# EVA — Manual de uso de la paleta de colores

Guía de referencia para aplicar los tokens de color de forma consistente en toda la app (pantallas, componentes del design system `EVA*` y estados de UI). Válido para `ThemeContext` en modo claro y oscuro.

---

## 1. Tokens base

| Token | Rol | Claro | Oscuro |
|---|---|---|---|
| `text` | Texto principal | `#0C1B26` | `#F1F5F9` |
| `textSecondary` | Texto secundario | `#6B7785`* | `#9AA8B4` |
| `muted` | Texto apagado / deshabilitado | `#94A3B8` | `#64748B` |
| `background` | Fondo base | `#FFFFFF` | `#0B141C` |
| `card` | Tarjetas / superficies elevadas | `#F1F4F7` | `#131E29` |
| `border` | Bordes y separadores | `#E2E8F0` | `#223140` |
| `primary` / `tint` | Color de marca / acción principal | `#1F7ECC` | `#4FA6E8` |
| `income` | Ingresos | `#4CAF50` | `#5FCB6E` |
| `income-strong` | Ingresos (uso en texto) | `#1E8A3C` | `#5FCB6E` |
| `expense` | Gastos | `#E63946` | `#FF6B76` |
| `expense-strong` | Gastos (uso en texto) | `#C21F2C` | `#FF6B76` |
| `warning` | Advertencias | `#F59E0B` | `#FBBF24` |

\* Ajustado desde tu valor original `#8F99A1` para cumplir contraste AA sobre fondo blanco.

**Regla general:** `income`/`expense` "base" se usa en íconos, chips y fondos pequeños (no como texto plano, porque su contraste es bajo). Los `-strong` se usan cuando el color va sobre texto (montos, títulos).

---

## 2. Sí, las alertas están contempladas — sistema semántico

Tu pregunta es clave: la paleta base (10 tokens) no alcanza por sí sola para alertas, porque una alerta necesita **4 capas**: fondo suave, borde, ícono/acento y texto. Abajo está el set completo derivado de tus colores base, listo para `EVAAlert` / `EVAModal` (confirmación, error, advertencia, información).

### Success / Confirmación positiva (ej. "Pago registrado")
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(76,175,80,0.12)` | `rgba(95,203,110,0.14)` |
| Borde | `rgba(76,175,80,0.35)` | `rgba(95,203,110,0.35)` |
| Ícono / acento | `#1E8A3C` | `#5FCB6E` |
| Texto | `text` | `text` |

### Error / Peligro (ej. "No se pudo procesar el pago", eliminar servicio)
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo | `rgba(230,57,70,0.10)` | `rgba(255,107,118,0.14)` |
| Borde | `rgba(230,57,70,0.35)` | `rgba(255,107,118,0.35)` |
| Ícono / acento | `#C21F2C` | `#FF6B76` |
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
| Fondo | `rgba(31,126,204,0.10)` | `rgba(79,166,232,0.12)` |
| Borde | `rgba(31,126,204,0.30)` | `rgba(79,166,232,0.30)` |
| Ícono / acento | `primary` | `primary` |
| Texto | `text` | `text` |

**Por qué así:** el fondo nunca es el color sólido —eso se ve como banner agresivo y falla en accesibilidad si hay texto encima—. Usar el color a baja opacidad sobre `background`/`card` da una superficie "tintada" legible, y el texto siempre queda en `text` (nunca en el color semántico), así se garantiza contraste alto sin depender del tono exacto de cada estado.

**Modales de confirmación destructiva** (`EVAModal` para "Eliminar suscripción", "Eliminar contacto"): usar la variante *Error*, con el botón principal en `expense`/`expense-strong` y el botón secundario en `btn-ghost` (ver sección 4).

---

## 3. Jerarquía tipográfica

- `text` → títulos, montos, nombres de contacto, contenido principal.
- `textSecondary` → subtítulos, fechas, descripciones, labels de formulario.
- `muted` → placeholders de `EVAInput`, texto de estados deshabilitados, iconografía inactiva del `EVATabBar`.

No uses `textSecondary` y `muted` de forma intercambiable: si el usuario puede necesitar leerlo con atención (una fecha, un subtítulo), es `textSecondary`; si es decorativo o de apoyo (placeholder, ícono inactivo), es `muted`.

---

## 4. Botones (`EVAActionButton`)

| Variante | Fondo | Texto | Borde |
|---|---|---|---|
| Primary | `primary` | blanco | — |
| Secondary / Ghost | transparente | `text` | `border` |
| Danger | `expense` | blanco | — |
| Disabled | `border` | `muted` | — |

---

## 5. Inputs (`EVAInput`)

| Estado | Borde | Texto ayuda |
|---|---|---|
| Default | `border` | `textSecondary` |
| Focus | `primary` | `textSecondary` |
| Error | `expense` | `expense-strong` |
| Disabled | `border` | `muted`, fondo `card` |

---

## 6. Navegación (`EVATabBar`)

- Ítem activo: ícono + label en `primary`.
- Ítem inactivo: ícono + label en `muted`.
- Fondo de la barra: `card` con borde superior `border`.

---

## 7. Datos financieros (Dashboard, `ServiceHistory`, `ParticipantTimeline`)

- Montos positivos (ingresos, pagos recibidos): `income-strong` como texto; `income` como fondo de ícono circular con el símbolo en blanco.
- Montos negativos (gastos, cuotas): `expense-strong` como texto; `expense` como fondo de ícono.
- Balance principal / tarjeta destacada: fondo `primary`, texto blanco (no uses `text` sobre `primary`, el contraste es insuficiente).

---

## 8. Metas (`GoalsScreen`)

- Barra de progreso: pista en `border`, relleno en `primary`.
- Meta completada (100%): relleno puede cambiar a `income` para reforzar el logro.
- Meta vencida o en riesgo: usar el patrón *Warning* de la sección 2 en la tarjeta de la meta.

---

## 9. Avatares (`EVAAvatar`) y separadores (`EVASeparator`)

- Avatar con iniciales (sin foto): fondo `card`, texto `textSecondary`, borde `border`.
- `EVASeparator`: siempre `border`, sin excepción, incluso dentro de tarjetas.

---

## 10. Estados de carga (`EVALoading`, `LoadingSplash`)

- Skeletons: base `border`, brillo/shimmer con `card`.
- Spinner: `primary`.
- Fondo de `LoadingSplash`: `background`, logo centrado (usar el SVG claro en tema claro, el PNG oscuro en tema oscuro).

---

## 11. Contactos (`ContactList`, `AddSubscriberModal`, historial)

- Fila de contacto: fondo `card`, nombre en `text`, último pago/estado en `textSecondary`.
- Estado "al día": chip con patrón *Success*.
- Estado "pendiente de pago": chip con patrón *Warning*.
- Estado "moroso / sin responder": chip con patrón *Error*.

---

## 12. Accesibilidad — mínimos a respetar

- Texto normal sobre `background`/`card`: contraste ≥ 4.5:1 → por eso `text`, `textSecondary` (ajustado) e `income-strong`/`expense-strong` están calibrados para esto.
- Texto grande (≥18px bold o ≥24px regular) y elementos gráficos (íconos, bordes de input): contraste ≥ 3:1 → aquí sí puedes usar `income`/`expense`/`warning` en su tono base.
- Nunca poner `muted` como único indicador de estado (ej. error solo con texto gris): siempre acompañar con ícono o color semántico.

---

## 13. Qué NO hacer

- No uses `income`/`expense`/`warning` como color de fondo sólido a pantalla completa o en banners grandes — solo en su versión tintada (sección 2) o en superficies pequeñas (chips, íconos).
- No mezcles `textSecondary` y `muted` para el mismo tipo de contenido en pantallas distintas — rompe la jerarquía.
- No apliques `text` directamente sobre `primary` — usa blanco.
- No definas un quinto tono de gris "por si acaso" — todo grises intermedios ya están cubiertos por `card`, `border`, `textSecondary`, `muted`.
