import type { CuratedContact } from './types';

// Contactos corporativos públicos (páginas oficiales, relevadas 2026-10-16). Solo áreas o empresas:
// nunca personas ni datos inventados. El resto de los establecimientos curados no tiene contacto.

const lasMarias: Omit<CuratedContact, 'entityId'> = {
  name: 'Establecimiento Las Marías',
  website: 'https://www.lasmarias.com.ar',
  email: 'atclientes@lasmarias.com.ar',
  sourceIds: ['contacto-las-marias'],
};

export const curatedContacts: CuratedContact[] = [
  {
    entityId: 'molinos-ala-mercedes',
    name: 'Adecoagro Argentina (oficina comercial)',
    website: 'https://www.molinosala.com.ar',
    phone: '+54 11 4836 8600',
    email: 'info_ar@adecoagro.com',
    sourceIds: ['contacto-adecoagro', 'contacto-molinos-ala'],
  },
  { entityId: 'las-marias-aserrin', ...lasMarias },
  { entityId: 'las-marias-costaneros', ...lasMarias },
  { entityId: 'las-marias-yerba', ...lasMarias },
  {
    entityId: 'fresa-virasoro',
    name: 'FRESA (Grupo Insud)',
    website: 'https://www.fresa.com.ar',
    phone: '+54 11 4872-1100',
    email: 'info@fresa.com.ar',
    sourceIds: ['contacto-fresa'],
  },
  {
    entityId: 'playadito-liebig',
    name: 'Cooperativa Agrícola de Colonia Liebig',
    website: 'https://www.cooperativaliebig.com.ar',
    phone: '+54 9 3758 422182',
    email: 'atconsumidores@cooperativaliebig.com.ar',
    sourceIds: ['contacto-liebig'],
  },
  {
    entityId: 'rosamonte-apostoles',
    name: 'Rosamonte (Hreñuk S.A.)',
    website: 'https://www.rosamonte.com.ar',
    phone: '(03758) 422220',
    email: 'info@rosamonte.com.ar',
    sourceIds: ['contacto-rosamonte'],
  },
  {
    entityId: 'as-de-bastos',
    name: 'As de Bastos',
    website: 'https://www.asdebastos.com.ar',
    phone: '+54 37 5565-9300',
    email: 'contacto@asdebastos.com.ar',
    sourceIds: ['contacto-as-de-bastos'],
  },
];
