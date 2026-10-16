import type { MaterialId } from '../enums';

const MATERIAL_LABEL: Record<MaterialId, string> = {
  aserrin: 'aserrín',
  chips: 'chips',
  costaneros: 'costaneros',
  cascarilla: 'cascarilla de arroz',
};

/** Link de WhatsApp (wa.me) con el teléfono solo en dígitos y prefijo 54 si falta. */
export function waLink(phone: string, text: string): string {
  let digits = phone.replace(/\D/g, '').replace(/^00/, '');
  if (!digits.startsWith('54')) digits = `54${digits.replace(/^0+/, '')}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Link de WhatsApp para escribirle a quien publicó, con el material en el mensaje. */
export function whatsappUrl(phone: string, materialId: MaterialId): string {
  return waLink(phone, `Hola, vi tu publicación de ${MATERIAL_LABEL[materialId]} en Circular NEA`);
}
