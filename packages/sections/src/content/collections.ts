import type { z } from 'zod';
import { faqItemSchema } from '../faq/schema.ts';
import { locationItemSchema } from '../locations/schema.ts';
import { logoItemSchema } from '../logo-cloud/schema.ts';
import { projectSchema } from '../portfolio/schema.ts';
import type { InspectorField } from '../registry/types.ts';
import { richTextFromPlain } from '../rich-text/schema.ts';
import { serviceItemSchema } from '../services/schema.ts';
import { imageField, linkField, textareaField, textField } from '../shared.ts';
import { statItemSchema } from '../stats/schema.ts';
import { memberSchema } from '../team/schema.ts';
import { testimonialItemSchema } from '../testimonials/schema.ts';

/**
 * Predefined content collections. Each mirrors the item shape of the section(s) that can display it, so an
 * entry drops straight into `items`. Custom collections can be added later without touching sections.
 */
export type CollectionDefinition = {
  id: string;
  label: string;
  singular: string;
  description: string;
  schema: z.ZodType;
  fields: InspectorField[];
  titlePath: string;
  newItem: () => Record<string, unknown>;
};

export const collections: CollectionDefinition[] = [
  {
    id: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    description: 'Customer quotes reused across pages.',
    schema: testimonialItemSchema,
    titlePath: 'name',
    fields: [
      textareaField('quote', 'Quote', 4, 600),
      textField('name', 'Name', 80),
      textField('role', 'Role or source', 80),
      { path: 'rating', label: 'Rating (0–5)', control: 'number', min: 0, max: 5, step: 1 },
      imageField('image', 'Photo'),
    ],
    newItem: () => ({ quote: '', name: '', role: '', image: null, rating: 5 }),
  },
  {
    id: 'services',
    label: 'Services',
    singular: 'Service',
    description: 'What you offer, with prices and photos.',
    schema: serviceItemSchema,
    titlePath: 'title',
    fields: [
      textField('title', 'Name', 80),
      textareaField('description', 'Description', 3, 300),
      textField('price', 'Price', 40),
      imageField('image', 'Photo'),
      linkField('link', 'Link'),
    ],
    newItem: () => ({ title: '', description: '', price: '', image: null, link: null }),
  },
  {
    id: 'team',
    label: 'Team members',
    singular: 'Team member',
    description: 'People, roles and bios.',
    schema: memberSchema,
    titlePath: 'name',
    fields: [
      textField('name', 'Name', 80),
      textField('role', 'Role', 80),
      textareaField('bio', 'Short bio', 3, 300),
      imageField('image', 'Photo'),
      linkField('link', 'Profile link'),
    ],
    newItem: () => ({ name: '', role: '', bio: '', image: null, link: null }),
  },
  {
    id: 'locations',
    label: 'Locations',
    singular: 'Location',
    description: 'Addresses, hours and contact details.',
    schema: locationItemSchema,
    titlePath: 'name',
    fields: [
      textField('name', 'Name', 80),
      textareaField('address', 'Address', 3, 300),
      textField('phone', 'Phone', 32),
      textField('email', 'Email', 120),
      textField('hours', 'Hours summary', 160),
      textField('mapUrl', 'Directions link (https)', 300),
      imageField('image', 'Photo'),
    ],
    newItem: () => ({
      name: '',
      address: '',
      phone: '',
      email: '',
      hours: '',
      mapUrl: null,
      image: null,
    }),
  },
  {
    id: 'faqs',
    label: 'FAQs',
    singular: 'Question',
    description: 'Questions and answers.',
    schema: faqItemSchema,
    titlePath: 'question',
    fields: [
      textField('question', 'Question', 160),
      { path: 'answer', label: 'Answer', control: 'richtext' },
    ],
    newItem: () => ({ question: '', answer: richTextFromPlain('') }),
  },
  {
    id: 'logos',
    label: 'Clients & logos',
    singular: 'Logo',
    description: 'Client, partner and press logos.',
    schema: logoItemSchema,
    titlePath: 'name',
    fields: [
      textField('name', 'Name', 60),
      imageField('image', 'Logo image'),
      linkField('link', 'Link'),
    ],
    newItem: () => ({ name: '', image: null, link: null }),
  },
  {
    id: 'stats',
    label: 'Statistics',
    singular: 'Statistic',
    description: 'Numbers worth repeating.',
    schema: statItemSchema,
    titlePath: 'label',
    fields: [
      textField('value', 'Value', 20),
      textField('label', 'Label', 60),
      textField('description', 'Small print', 120),
    ],
    newItem: () => ({ value: '', label: '', description: '' }),
  },
  {
    id: 'projects',
    label: 'Projects',
    singular: 'Project',
    description: 'Portfolio work and case studies.',
    schema: projectSchema,
    titlePath: 'title',
    fields: [
      textField('title', 'Title', 80),
      textField('category', 'Category', 60),
      imageField('image', 'Cover image'),
      linkField('link', 'Link'),
    ],
    newItem: () => ({ title: '', category: '', image: null, link: null }),
  },
];

export const collectionById = (id: string) => collections.find((c) => c.id === id);
