export function buildSpecs(part: any) {
  const specs: Record<string, unknown> = {};
  (part.spec_keys ?? []).forEach((k: string, i: number) => {
    if (k) specs[k] = part.spec_values?.[i];
  });
  return specs;
}