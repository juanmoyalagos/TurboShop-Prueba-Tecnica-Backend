export function buildSpecs(part: any) {
    const specs: Record<string, unknown> = {};
    if (part.caracteristicas?.especificaciones) {
      Object.assign(specs, part.caracteristicas.especificaciones);
    }
    return specs;
  }