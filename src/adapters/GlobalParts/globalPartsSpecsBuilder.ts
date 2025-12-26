export function buildSpecs(item: any) {
    const specs: Record<string, unknown> = {};
    const list = item?.TechnicalSpecifications?.SpecificationList ?? [];
    for (const spec of list) {
      if (spec?.SpecificationName) {
        specs[spec.SpecificationName] = spec.SpecificationValue;
      }
    }
    return specs;
  }