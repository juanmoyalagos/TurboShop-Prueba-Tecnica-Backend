export function parseVehicleFit(fit: any) {
    const start = fit?.YearRange?.StartYear;
    const end = fit?.YearRange?.EndYear;
    if (!fit?.Manufacturer?.Name || !fit?.Model?.Name || !start || !end) return null;
    return {
      vehicle_make: fit.Manufacturer.Name,
      vehicle_model: fit.Model.Name,
      year_from: Number(start),
      year_to: Number(end),
    };
  }