import { createCn } from 'cn/config';

/**
 * `cn` de shadcn, con los tamaños de texto propios del tema registrados como font-size.
 * Sin esto, `text-caption text-fg-muted` se lee como dos colores y el merge descarta el tamaño.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['overline', 'caption', 'small', 'body', 'heading', 'title', 'figure', 'display', 'input'] }],
    },
  },
});
