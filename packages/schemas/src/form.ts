import { z } from 'zod';

export const formFieldTypes = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
] as const;
export const formFieldSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9_]{0,39}$/, 'Field ids are lowercase letters, numbers and underscores'),
  type: z.enum(formFieldTypes),
  label: z.string().min(1).max(80),
  required: z.boolean().default(false),
  placeholder: z.string().max(120).default(''),
  options: z.array(z.string().min(1).max(80)).max(20).default([]),
  maxLength: z.number().int().min(1).max(4000).optional(),
});
export type FormField = z.infer<typeof formFieldSchema>;

export const formSettingsSchema = z.object({
  submitLabel: z.string().min(1).max(40).default('Send'),
  successMessage: z
    .string()
    .min(1)
    .max(300)
    .default('Thanks, we received your message and will reply soon.'),
});
export const formDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  fields: z.array(formFieldSchema).min(1).max(30),
  settings: formSettingsSchema.default({
    submitLabel: 'Send',
    successMessage: 'Thanks, we received your message and will reply soon.',
  }),
});
export type FormDefinition = z.infer<typeof formDefinitionSchema>;

/** Starter forms for the builder. Ids are stable so migrations and analytics can rely on them. */
export const formTemplates: Array<{
  id: string;
  name: string;
  fields: FormField[];
  submitLabel: string;
}> = [
  {
    id: 'contact',
    name: 'Contact',
    submitLabel: 'Send message',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Your name',
        required: true,
        placeholder: '',
        options: [],
      },
      { id: 'email', type: 'email', label: 'Email', required: true, placeholder: '', options: [] },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        placeholder: '',
        options: [],
      },
    ],
  },
  {
    id: 'quote',
    name: 'Quote request',
    submitLabel: 'Request a quote',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Your name',
        required: true,
        placeholder: '',
        options: [],
      },
      { id: 'email', type: 'email', label: 'Email', required: true, placeholder: '', options: [] },
      { id: 'phone', type: 'phone', label: 'Phone', required: false, placeholder: '', options: [] },
      {
        id: 'service',
        type: 'select',
        label: 'What do you need?',
        required: true,
        placeholder: '',
        options: ['Consultation', 'Standard package', 'Premium package', 'Something else'],
      },
      {
        id: 'details',
        type: 'textarea',
        label: 'Details',
        required: false,
        placeholder: '',
        options: [],
      },
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    submitLabel: 'Subscribe',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true,
        placeholder: 'you@example.com',
        options: [],
      },
    ],
  },
  {
    id: 'booking',
    name: 'Booking enquiry',
    submitLabel: 'Request booking',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Your name',
        required: true,
        placeholder: '',
        options: [],
      },
      { id: 'phone', type: 'phone', label: 'Phone', required: true, placeholder: '', options: [] },
      {
        id: 'date',
        type: 'date',
        label: 'Preferred date',
        required: true,
        placeholder: '',
        options: [],
      },
      {
        id: 'guests',
        type: 'select',
        label: 'Guests',
        required: true,
        placeholder: '',
        options: ['1–2', '3–4', '5–6', '7+'],
      },
      {
        id: 'notes',
        type: 'textarea',
        label: 'Anything we should know?',
        required: false,
        placeholder: '',
        options: [],
      },
    ],
  },
  {
    id: 'job',
    name: 'Job application',
    submitLabel: 'Apply',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full name',
        required: true,
        placeholder: '',
        options: [],
      },
      { id: 'email', type: 'email', label: 'Email', required: true, placeholder: '', options: [] },
      { id: 'phone', type: 'phone', label: 'Phone', required: false, placeholder: '', options: [] },
      {
        id: 'role',
        type: 'text',
        label: 'Role you are applying for',
        required: true,
        placeholder: '',
        options: [],
      },
      {
        id: 'about',
        type: 'textarea',
        label: 'Tell us about yourself',
        required: true,
        placeholder: '',
        options: [],
      },
      {
        id: 'consent',
        type: 'checkbox',
        label: 'I agree that you keep my details for this application',
        required: true,
        placeholder: '',
        options: [],
      },
    ],
  },
];
