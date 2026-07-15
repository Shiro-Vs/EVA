import {
  MESES_NOMBRES,
  parseMesAnio,
  compareMesAnioAsc,
  compareMesAnioDesc,
} from "../serviceUtils";

describe("serviceUtils", () => {
  describe("MESES_NOMBRES", () => {
    it("contiene los 12 meses en español, en orden", () => {
      expect(MESES_NOMBRES).toHaveLength(12);
      expect(MESES_NOMBRES[0]).toBe("Enero");
      expect(MESES_NOMBRES[11]).toBe("Diciembre");
    });
  });

  describe("parseMesAnio", () => {
    it("convierte 'Marzo 2026' en una fecha del 1 de marzo de 2026", () => {
      const date = parseMesAnio("Marzo 2026");
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(2); // 0-indexed
      expect(date.getDate()).toBe(1);
    });

    it("interpreta correctamente Enero y Diciembre (límites del array)", () => {
      expect(parseMesAnio("Enero 2025").getMonth()).toBe(0);
      expect(parseMesAnio("Diciembre 2025").getMonth()).toBe(11);
    });
  });

  describe("compareMesAnioAsc", () => {
    it("ordena de más antiguo a más reciente", () => {
      const meses = ["Marzo 2026", "Enero 2025", "Diciembre 2025"];
      const sorted = [...meses].sort(compareMesAnioAsc);
      expect(sorted).toEqual(["Enero 2025", "Diciembre 2025", "Marzo 2026"]);
    });

    it("retorna 0 para el mismo mes/año", () => {
      expect(compareMesAnioAsc("Julio 2026", "Julio 2026")).toBe(0);
    });
  });

  describe("compareMesAnioDesc", () => {
    it("ordena de más reciente a más antiguo", () => {
      const meses = ["Marzo 2026", "Enero 2025", "Diciembre 2025"];
      const sorted = [...meses].sort(compareMesAnioDesc);
      expect(sorted).toEqual(["Marzo 2026", "Diciembre 2025", "Enero 2025"]);
    });
  });
});
