export function parseVehicleFit(fit: any) {
    const desde = fit?.anios?.desde;
    const hasta = fit?.anios?.hasta;
    if (!fit?.fabricante || !fit?.modelo || !desde || !hasta) return null;
    return {
      vehicle_make: fit.fabricante,
      vehicle_model: fit.modelo,
      year_from: Number(desde),
      year_to: Number(hasta),
    };
  }