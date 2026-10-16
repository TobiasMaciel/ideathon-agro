import ContactReveal from './ContactReveal';
import PublishedMeta from './PublishedMeta';

interface Entity {
  id: string;
  origin?: 'curado' | 'publicacion';
  createdAt?: string;
}

/**
 * Debajo de "Tu planta" y del comprador elegido: "Ver contacto" para todos. Publicación: además badge y antigüedad.
 * Si la API no tiene contacto (404), lo dice; en un curado, ofrece ir a Fuentes.
 */
export default function ListingInfo({ entity, onShowSources, className }: { entity: Entity; onShowSources: () => void; className?: string }) {
  const published = entity.origin === 'publicacion';
  return (
    <div className={className} data-testid={`listing-info-${entity.id}`}>
      {published && <PublishedMeta entity={entity} />}
      <ContactReveal id={entity.id} curated={!published} onShowSources={onShowSources} />
    </div>
  );
}
