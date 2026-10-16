import { Label } from '@/components/ui/label';
import type { ListingField } from './form';
import { fieldId } from './form-ui';

interface FieldProps {
  field: ListingField;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (aria: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode;
}

/** Label visible arriba, control, y abajo la ayuda o el error (los dos vinculados con aria-describedby). */
export function Field({ field, label, optional, hint, error, className, children }: FieldProps) {
  const id = fieldId(field);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-small leading-snug font-medium text-fg-muted">
        {label} {optional && <span className="font-normal text-fg-subtle">(opcional)</span>}
      </Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="mt-1 text-caption text-bad">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1 text-caption text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="eyebrow float-left mb-0.5 w-full">{title}</legend>
      {description && <p className="clear-both text-small text-fg-muted">{description}</p>}
      <div className="clear-both space-y-3">{children}</div>
    </fieldset>
  );
}
