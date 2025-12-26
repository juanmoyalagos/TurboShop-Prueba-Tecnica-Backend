import { Provider } from "../models/Provider";

export async function getProviderIdByCode(code: string): Promise<number> {
    const provider = await Provider.findOne({ where: { code } });
    if (!provider) throw new Error(`Proveedor no encontrado para el código: ${code}`);
    return provider.id;
  }