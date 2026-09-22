import { formDefinitionSchema } from '@siteos/schemas';
import { z } from 'zod';
import { sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const contactFormSchema = z.object({
  variant: z.enum(['stacked', 'card', 'split']),
  ...sectionIntroFields,
  /** The form to render, from the Forms panel. Its definition is inlined into `form` at preview/publish time. */
  formId: z.uuid().nullable().default(null),
  form: formDefinitionSchema.nullable().default(null),
  /** Shown beside the form in the split layout. */
  aside: z.string().max(600).default(''),
  ...sectionStyleFields,
});
export type ContactFormProps = z.output<typeof contactFormSchema>;
