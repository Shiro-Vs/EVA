export const MESES_NOMBRES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const parseMesAnio = (mesAnio: string) => {
  const [mesStr, anioStr] = mesAnio.split(" ");
  return new Date(parseInt(anioStr), MESES_NOMBRES.indexOf(mesStr), 1);
};

export const compareMesAnioDesc = (a: string, b: string) => {
  return parseMesAnio(b).getTime() - parseMesAnio(a).getTime();
};

export const compareMesAnioAsc = (a: string, b: string) => {
  return parseMesAnio(a).getTime() - parseMesAnio(b).getTime();
};
