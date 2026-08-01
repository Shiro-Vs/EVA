import {
  sumValues,
  getSortedHistoryAsc,
  getMesFin,
  calculateTotalMonto,
  getPeriodDisplayLabel,
} from "../serviceHistoryUtils";
import { PaymentHistory } from "../../../interfaces/Subscription";

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

describe("serviceHistoryUtils", () => {
  describe("sumValues", () => {
    it("suma los valores numéricos de un objeto", () => {
      expect(sumValues({ a: 10, b: 20, c: 5.5 })).toBe(35.5);
    });

    it("ignora valores no numéricos y trata undefined/null como 0", () => {
      expect(sumValues({ a: 10, b: "no-numero" as any, c: undefined })).toBe(
        10,
      );
    });

    it("retorna 0 para objeto vacío, null o undefined", () => {
      expect(sumValues({})).toBe(0);
      expect(sumValues(null)).toBe(0);
      expect(sumValues(undefined)).toBe(0);
    });
  });

  describe("getSortedHistoryAsc", () => {
    it("ordena el historial de más antiguo a más reciente sin mutar el original", () => {
      const original = [
        makeHist("Marzo 2026"),
        makeHist("Enero 2025"),
        makeHist("Diciembre 2025"),
      ];
      const sorted = getSortedHistoryAsc(original);

      expect(sorted.map((h) => h.mes_anio)).toEqual([
        "Enero 2025",
        "Diciembre 2025",
        "Marzo 2026",
      ]);
      // El array original no debe mutarse
      expect(original.map((h) => h.mes_anio)).toEqual([
        "Marzo 2026",
        "Enero 2025",
        "Diciembre 2025",
      ]);
    });

    it("retorna un array vacío si no se pasa historial", () => {
      expect(getSortedHistoryAsc(undefined as any)).toEqual([]);
    });
  });

  describe("getMesFin", () => {
    const historial = [
      makeHist("Enero 2026", { frecuencia_momento: "mensual" }),
      makeHist("Febrero 2026", { frecuencia_momento: "mensual" }),
      makeHist("Marzo 2026", { frecuencia_momento: "mensual" }),
    ];

    it("calcula el mes final tras avanzar N meses mensuales desde el mes de inicio", () => {
      // Desde Enero 2026, 2 meses -> cubre Enero y Febrero -> termina en Febrero 2026
      expect(getMesFin("Enero 2026", 2, "mensual", historial)).toBe(
        "Febrero 2026",
      );
    });

    it("retorna cadena vacía si no hay mes de inicio o historial", () => {
      expect(getMesFin(undefined, 3, "mensual", historial)).toBe("");
      expect(getMesFin("Enero 2026", 3, "mensual", undefined as any)).toBe(
        "",
      );
    });

    it("respeta la frecuencia anual sumando años en vez de meses", () => {
      const anual = [
        makeHist("Enero 2026", { frecuencia_momento: "anual" }),
      ];
      // 1 periodo anual desde Enero 2026 -> Enero 2027
      expect(getMesFin("Enero 2026", 1, "anual", anual)).toBe("Enero 2027");
    });
  });

  describe("calculateTotalMonto", () => {
    const suscriptores = [{ id: "cont_ana", nombre: "Ana", cuota: 25 }];

    it("suma la cuota histórica registrada por persona cuando existe", () => {
      const historial = [
        makeHist("Enero 2026", { cuotas_momento: { cont_ana: 10 } }),
        makeHist("Febrero 2026", { cuotas_momento: { cont_ana: 15 } }),
      ];
      expect(
        calculateTotalMonto("cont_ana", 2, "Enero 2026", historial, suscriptores),
      ).toBe(25);
    });

    it("usa la cuota base del suscriptor si no hay historial para ese mes", () => {
      // numMeses excede el historial disponible, debe rellenar con cuotaBase (25)
      const historial = [makeHist("Enero 2026", { cuotas_momento: { cont_ana: 10 } })];
      const total = calculateTotalMonto(
        "cont_ana",
        2,
        "Enero 2026",
        historial,
        suscriptores,
      );
      expect(total).toBe(10 + 25);
    });

    it("retorna 0 si no hay mes de inicio", () => {
      expect(
        calculateTotalMonto("cont_ana", 2, undefined, [], suscriptores),
      ).toBe(0);
    });
  });

  describe("getPeriodDisplayLabel", () => {
    it("etiqueta correctamente un periodo de solo meses", () => {
      const historial = [
        makeHist("Enero 2026", { frecuencia_momento: "mensual" }),
        makeHist("Febrero 2026", { frecuencia_momento: "mensual" }),
      ];
      expect(
        getPeriodDisplayLabel("Enero 2026", 2, "mensual", historial),
      ).toBe("2 meses");
    });

    it("usa singular cuando corresponde a 1 mes", () => {
      const historial = [makeHist("Enero 2026", { frecuencia_momento: "mensual" })];
      expect(
        getPeriodDisplayLabel("Enero 2026", 1, "mensual", historial),
      ).toBe("1 mes");
    });

    it("combina años y meses cuando hay ciclos mixtos", () => {
      const historial = [
        makeHist("Enero 2026", { frecuencia_momento: "anual" }),
        makeHist("Enero 2027", { frecuencia_momento: "mensual" }),
      ];
      expect(
        getPeriodDisplayLabel("Enero 2026", 2, "mensual", historial),
      ).toBe("1 año y 1 mes");
    });

    it("retorna cadena vacía sin mes de inicio", () => {
      expect(getPeriodDisplayLabel(undefined, 2, "mensual", [])).toBe("");
    });
  });
});
