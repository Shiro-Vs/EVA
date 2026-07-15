# EVA — Roadmap, Sprints e Issues

> Depende de `docs/01-alcance-y-fases.md`, `docs/02-modelo-de-datos.md` y `docs/03-implementacion-firebase.md`. Este documento traduce las fases ya definidas en tareas puntuales listas para un tablero de GitHub, para trabajar en equipo.

## 1. Estructura elegida

- **1 Milestone de GitHub por Fase** (Fase 0 a Fase 7, tal como están definidas en `01-alcance-y-fases.md`). Sin duración fija — un milestone se cierra cuando su fase se completa, no en una fecha calendario.
- **1 Issue por tarea puntual** dentro de cada fase. Cada issue trae contexto, checklist de tareas, criterios de aceptación y referencias a la documentación — pensado para que se pueda asignar a cualquier persona del equipo (o a Claude Code) sin tener que releer todos los `.md` primero.
- **Labels** para filtrar el tablero por tipo y por área, independientemente de la fase:

| Prefijo | Valores | Para qué |
|---|---|---|
| `type:` | `feature`, `chore`, `bug`, `spike`, `docs` | Naturaleza de la tarea. `spike` = investigación/decisión antes de poder codear (ver Fase 1 y las fases con preguntas abiertas). |
| `area:` | `auth`, `cuentas`, `suscripciones`, `contactos`, `prestamos`, `metas`, `dashboard`, `ia`, `notificaciones`, `correo`, `infra` | Módulo del producto, para poder filtrar sin importar en qué fase está. |
| `fase:` | `fase-0` … `fase-7` | Redundante con el milestone, pero útil como filtro rápido en la vista de tablero (Projects no siempre muestra el milestone como columna). |

## 2. Qué tan detallada está cada fase

No todas las fases tienen el mismo nivel de definición todavía — y las issues lo reflejan tal cual, en vez de simular una decisión que no se ha tomado:

- **Fase 0**: completamente detallada — sigue paso a paso `docs/03-implementacion-firebase.md`. 12 issues.
- **Fase 1**: solo el spike de investigación. La tarea de refactor real no se detalla hasta que ese spike defina si es "arreglar bugs puntuales" o "refactor de fondo" (pregunta abierta en `01-alcance-y-fases.md`, sección 6).
- **Fase 2 y 4**: detalladas, son extensiones directas de módulos ya modelados.
- **Fase 3**: detallada en estructura, pero la issue de cronograma de cuotas marca explícitamente la pregunta abierta sobre cálculo de interés (simple/compuesto/francés vs. monto manual).
- **Fase 5**: una sola issue-epic, porque depende de que existan préstamos/presupuestos/metas reales (fases anteriores) y tiene una pregunta abierta sobre días de anticipación configurable.
- **Fase 6**: detallada en las 4 sub-features + la Cloud Function proxy como prerrequisito de todas.
- **Fase 7**: una sola issue-epic con la pregunta abierta sobre Gmail API propio vs. proveedor tipo Plaid/Belvo, y la alternativa de arrancar con "sube el screenshot de Yape" reutilizando Gemini Vision de la Fase 6.

Cuando conversen y resuelvan una pregunta abierta, se actualiza la issue correspondiente (o se abren las issues hijas que falten) — no hace falta regenerar el script.

## 3. Cómo usarlo

Prerrequisito: tener [GitHub CLI](https://cli.github.com/) instalado y autenticado (`gh auth login`) con permisos de escritura sobre el repo.

```bash
cd EVA   # o donde esté el checkout del repo
chmod +x scripts/create-github-issues.sh
./scripts/create-github-issues.sh
```

El script:
1. Crea los labels (si ya existen, los actualiza — es seguro correrlo más de una vez).
2. Crea los 8 milestones (uno por fase).
3. Crea todas las issues, cada una con su milestone y sus labels ya asignados.

Si el repo no es `Shiro-Vs/EVA` (por ejemplo, corren esto contra un fork), cambien la variable `REPO` al inicio del script.

## 4. Cómo lo usa Claude Code

La idea es que cada issue sea autocontenida: alguien (persona o Claude Code) la toma, y con el contexto + checklist + referencias que trae puede ejecutarla sin tener que preguntar "¿y esto qué significa?". Un flujo típico:

```
Lee la issue #<número> del repo EVA y trabájala completa:
crea una rama, implementa lo que pide el checklist,
corre typecheck y tests, y déjame el PR listo.
```

Para las issues marcadas `type:spike`, el resultado esperado no es código — es una respuesta escrita a las preguntas planteadas (como comentario en la propia issue o como actualización a la sección "Preguntas abiertas" de `01-alcance-y-fases.md`), que luego destrabe la(s) issue(s) de implementación relacionadas.
