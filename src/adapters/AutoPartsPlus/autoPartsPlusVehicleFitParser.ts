export function parseVehicleFit(str: string) {
  const m = str.match(/^(\S+)\s+(\S+)\s+(\d{4})-(\d{4})(?:\s+(.+))?$/);
  if (!m) return null;
  return {
    vehicle_make: m[1],
    vehicle_model: m[2],
    year_from: Number(m[3]),
    year_to: Number(m[4]),
  };
}
