import { registry } from '@siteos/sections';
import { describe, expect, it } from 'vitest';
import { renderableTypes } from '../src/sections/map.ts';

describe('section renderer map', () => {
  it('has exactly one Astro renderer per registered section type', () => {
    expect([...renderableTypes].sort()).toEqual(
      registry
        .list()
        .map((d) => d.type)
        .sort(),
    );
  });
});
