// MOCK: datos ficticios para desarrollar y probar el frontend.
// No representan resultados oficiales ni sustituyen el dataset real.

export const dashboardMock = {
  kpis: {
    modo: "MOCK",
    indicadores: {
      totalSolicitudes: 220,
      totalInstituciones: 12,
      tipoSolicitudPrincipal: "Consulta",
      ubicacionConMayorVolumen: "LIMA-LIMA-JESUS MARIA",
    },
  },

  solicitudesPorTipo: {
    modo: "MOCK",
    datos: [
      { tipo: "Consulta", cantidad: 120 },
      { tipo: "Denuncia", cantidad: 85 },
      { tipo: "Intervencion de oficio", cantidad: 15 },
    ],
  },

  solicitudesPorInstitucion: {
    modo: "MOCK",
    datos: [
      {
        codigoInstitucion: "10002",
        institucion: "SEGURO SOCIAL DE SALUD",
        cantidad: 45,
      },
      {
        codigoInstitucion: "5947",
        institucion:
          "HOSPITAL DE MEDIANA COMPLEJIDAD JOSE AGURTO TELLO",
        cantidad: 30,
      },
    ],
  },

  tendenciaMensual: {
    modo: "MOCK",
    datos: [
      { periodo: "2026-01", cantidad: 70 },
      { periodo: "2026-02", cantidad: 80 },
      { periodo: "2026-03", cantidad: 70 },
    ],
  },

  solicitudesPorUbicacion: {
    modo: "MOCK",
    datos: [
      { ubicacion: "LIMA-LIMA-JESUS MARIA", cantidad: 70 },
      { ubicacion: "LIMA-LIMA-ATE", cantidad: 40 },
    ],
  },

  metadata: {
    modo: "MOCK",
    fuente: "Datos ficticios locales",
    fechaActualizacion: null,
    observacion:
      "Simulación temporal; la API real está pendiente.",
  },
};