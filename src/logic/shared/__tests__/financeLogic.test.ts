import {
  calcularDeudaDeContacto,
  contarServiciosActivos,
  generarResumenContacto,
} from "../financeLogic";
import { Subscription, PaymentHistory } from "../../../interfaces/Subscription";

const makeHist = (
  mes_anio: string,
  overrides: Partial<PaymentHistory> = {},
): PaymentHistory => ({
  mes_anio,
  costo_servicio_momento: 50,
  fecha_limite_esperada: new Date(),
  fecha_real_pago: null,
  dias_atraso: 0,
  balance_servicio: 0,
  registro_pagos_personas: {},
  cuotas_momento: {},
  montos_pagados: {},
  frecuencia_momento: "mensual",
  ...overrides,
});

const makeSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: "sub_1",
  nombre: "Netflix",
  costo_total_actual: 50,
  dia_cobro: 5,
  frecuencia: "mensual",
  es_compartido: true,
  id_cuenta_pago: "acc_1",
  fecha_inicio: new Date("2025-01-01"),
  suscriptores: [],
  historial_pagos: [],
  ...overrides,
});

describe("financeLogic", () => {
  describe("calcularDeudaDeContacto", () => {
    it("suma la deuda de cuotas vencidas y no pagadas", () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1); // vencida hace un mes

      const sub = makeSubscription({
        historial_pagos: [
          makeHist("Junio 2026", {
            fecha_limite_esperada: pastDate,
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 25 },
            montos_pagados: { cont_ana: 10 },
          }),
        ],
      });

      expect(calcularDeudaDeContacto([sub], "cont_ana")).toBe(15);
    });

    it("no cuenta cuotas ya pagadas ni cuotas futuras", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const sub = makeSubscription({
        historial_pagos: [
          makeHist("Pagado", {
            fecha_limite_esperada: pastDate,
            registro_pagos_personas: { cont_ana: true },
            cuotas_momento: { cont_ana: 25 },
            montos_pagados: { cont_ana: 25 },
          }),
          makeHist("Futuro", {
            fecha_limite_esperada: futureDate,
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 25 },
            montos_pagados: { cont_ana: 0 },
          }),
        ],
      });

      expect(calcularDeudaDeContacto([sub], "cont_ana")).toBe(0);
    });

    it("retorna 0 cuando el contacto no aparece en ningún historial", () => {
      const sub = makeSubscription({ historial_pagos: [makeHist("Junio 2026")] });
      expect(calcularDeudaDeContacto([sub], "cont_desconocido")).toBe(0);
    });
  });

  describe("contarServiciosActivos", () => {
    it("cuenta solo los servicios donde el contacto es suscriptor actual", () => {
      const subs = [
        makeSubscription({ id: "1", suscriptores: [{ id: "cont_ana", nombre: "Ana", cuota: 10, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date() }] }),
        makeSubscription({ id: "2", suscriptores: [{ id: "cont_luis", nombre: "Luis", cuota: 10, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date() }] }),
        makeSubscription({ id: "3", suscriptores: [{ id: "cont_ana", nombre: "Ana", cuota: 10, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date() }] }),
      ];
      expect(contarServiciosActivos(subs, "cont_ana")).toBe(2);
    });

    it("retorna 0 si no hay coincidencias", () => {
      const subs = [makeSubscription({ suscriptores: [] })];
      expect(contarServiciosActivos(subs, "cont_ana")).toBe(0);
    });
  });

  describe("generarResumenContacto", () => {
    it("solo incluye servicios donde el contacto tiene historial procesable", () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      const subConHistorial = makeSubscription({
        id: "1",
        nombre: "Netflix",
        historial_pagos: [
          makeHist("Junio 2026", {
            fecha_limite_esperada: pastDate,
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 25 },
            montos_pagados: { cont_ana: 0 },
          }),
        ],
      });
      const subSinContacto = makeSubscription({ id: "2", nombre: "Spotify" });

      const resumen = generarResumenContacto([subConHistorial, subSinContacto], "cont_ana");

      expect(resumen.services).toHaveLength(1);
      expect(resumen.services[0].serviceName).toBe("Netflix");
      expect(resumen.totalDebt).toBe(25);
      expect(resumen.services[0].monthsDelay).toBe(1);
    });

    it("retorna resumen vacío cuando el contacto no participa en ningún servicio", () => {
      const sub = makeSubscription({ historial_pagos: [makeHist("Junio 2026")] });
      const resumen = generarResumenContacto([sub], "cont_desconocido");
      expect(resumen.services).toHaveLength(0);
      expect(resumen.totalDebt).toBe(0);
    });
  });
});
