import {
  calculateProratedQuota,
  applyFIFOPayment,
  syncServiceHistory,
} from "../subscriptionLogic";
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

describe("subscriptionLogic", () => {
  describe("calculateProratedQuota", () => {
    it("aplica cortesía (gratis) cuando faltan menos de 5 días para el próximo cobro", () => {
      const joinDate = new Date(2026, 0, 1); // 1 Ene 2026
      const result = calculateProratedQuota(30, joinDate, 5); // cobro el día 5
      expect(result).toEqual({ quota: 0, isCourtesy: true });
    });

    it("cobra el monto completo cuando faltan 28 días o más para el próximo cobro", () => {
      const joinDate = new Date(2026, 0, 6); // 6 Ene 2026, cobro es el día 5
      const result = calculateProratedQuota(30, joinDate, 5);
      // getDate() (6) > billingDay (5) -> el próximo cobro se corre a Feb 5 (~30 días)
      expect(result).toEqual({ quota: 30, isCourtesy: false });
    });

    it("calcula un monto proporcional para periodos intermedios", () => {
      const joinDate = new Date(2026, 0, 1); // 1 Ene 2026
      const result = calculateProratedQuota(30, joinDate, 20); // cobro el día 20 -> 19 días
      expect(result.isCourtesy).toBe(false);
      expect(result.quota).toBeCloseTo(19, 2); // (30/30) * 19
    });
  });

  describe("applyFIFOPayment", () => {
    it("salda primero los meses pendientes más antiguos", () => {
      const service = makeSubscription({
        suscriptores: [
          { id: "cont_ana", nombre: "Ana", cuota: 20, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date("2025-01-01") },
        ],
        historial_pagos: [
          makeHist("Febrero 2026", {
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 20 },
            montos_pagados: { cont_ana: 0 },
          }),
          makeHist("Enero 2026", {
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 20 },
            montos_pagados: { cont_ana: 0 },
          }),
        ],
      });

      const result = applyFIFOPayment(service, "cont_ana", 1);

      const enero = result.historial_pagos!.find((h) => h.mes_anio === "Enero 2026")!;
      const febrero = result.historial_pagos!.find((h) => h.mes_anio === "Febrero 2026")!;

      expect(enero.registro_pagos_personas["cont_ana"]).toBe(true);
      expect(enero.montos_pagados!["cont_ana"]).toBe(20);
      // Febrero, al ser posterior, debe seguir pendiente
      expect(febrero.registro_pagos_personas["cont_ana"]).toBe(false);

      // No debe mutar el objeto original (funcion pura)
      expect(service.historial_pagos!.find((h) => h.mes_anio === "Enero 2026")!.registro_pagos_personas["cont_ana"]).toBe(false);
    });

    it("adelanta 'pagado_hasta' cuando se pagan más meses de los que hay pendientes", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 6, 15)); // 15 Julio 2026

      const service = makeSubscription({
        suscriptores: [
          { id: "cont_ana", nombre: "Ana", cuota: 20, es_cortesia: false, pagado_hasta: null, fecha_inicio: new Date("2025-01-01") },
        ],
        historial_pagos: [
          makeHist("Julio 2026", {
            registro_pagos_personas: { cont_ana: false },
            cuotas_momento: { cont_ana: 20 },
            montos_pagados: { cont_ana: 0 },
          }),
        ],
      });

      // Paga 3 meses: 1 salda Julio (pendiente), sobran 2 -> se adelanta pagado_hasta
      const result = applyFIFOPayment(service, "cont_ana", 3);

      const sub = result.suscriptores!.find((s) => s.id === "cont_ana")!;
      const pagadoHasta = new Date(sub.pagado_hasta);

      // Base: mes actual (Julio 2026) + 2 meses restantes -> Septiembre 2026
      expect(pagadoHasta.getFullYear()).toBe(2026);
      expect(pagadoHasta.getMonth()).toBe(8); // Septiembre (0-indexed)

      // No debe mutar el suscriptor original (funcion pura)
      expect(service.suscriptores!.find((s) => s.id === "cont_ana")!.pagado_hasta).toBeNull();

      jest.useRealTimers();
    });

    it("no falla si el suscriptor no existe en el servicio", () => {
      const service = makeSubscription({ suscriptores: [], historial_pagos: [] });
      expect(() => applyFIFOPayment(service, "cont_fantasma", 1)).not.toThrow();
    });
  });

  describe("syncServiceHistory", () => {
    it("genera el historial desde fecha_inicio hasta el ciclo actual, sin duplicar meses", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 2, 15)); // 15 Marzo 2026

      const service = makeSubscription({
        fecha_inicio: new Date(2026, 0, 1), // Enero 2026
        dia_cobro: 5,
        historial_pagos: [],
      });

      const result = syncServiceHistory(service);

      const meses = result.historial_pagos!.map((h) => h.mes_anio);
      const mesesUnicos = new Set(meses);

      expect(result.historial_pagos!.length).toBeGreaterThan(0);
      expect(mesesUnicos.size).toBe(meses.length); // sin duplicados
      expect(meses).toContain("Enero 2026");

      // El historial queda ordenado de más reciente a más antiguo
      expect(result.historial_pagos![0].mes_anio).not.toBe(
        result.historial_pagos![result.historial_pagos!.length - 1].mes_anio,
      );

      // No debe mutar el objeto original (funcion pura)
      expect(service.historial_pagos).toEqual([]);

      jest.useRealTimers();
    });

    it("no genera entradas duplicadas al ejecutarse dos veces seguidas", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 2, 15));

      const service = makeSubscription({
        fecha_inicio: new Date(2026, 0, 1),
        historial_pagos: [],
      });

      const firstResult = syncServiceHistory(service);
      const secondResult = syncServiceHistory(firstResult);

      expect(secondResult.historial_pagos!.length).toBe(firstResult.historial_pagos!.length);

      jest.useRealTimers();
    });
  });
});
