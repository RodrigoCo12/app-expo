import { create } from "zustand";

export const useGuardiasStore = create((set) => ({
  guardiasActualizados: false,
  tipoActualizacion: null, // 'entrada' o 'salida'
  guardiaAfectado: null, // número del guardia afectado
  setGuardiasActualizados: (tipo, guardia) =>
    set({
      guardiasActualizados: true,
      tipoActualizacion: tipo,
      guardiaAfectado: guardia,
    }),
  resetGuardiasActualizados: () =>
    set({
      guardiasActualizados: false,
      tipoActualizacion: null,
      guardiaAfectado: null,
    }),
}));
