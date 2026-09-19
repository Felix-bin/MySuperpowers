import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import extension from '../../.pi/extensions/superpowers.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('Pi exposes skills without lifecycle or context injection', async () => {
  const handlers = new Map();
  extension({ on: (name, handler) => handlers.set(name, handler) });
  assert.deepEqual([...handlers.keys()], ['resources_discover']);
  assert.deepEqual(await handlers.get('resources_discover')(), {
    skillPaths: [resolve(root, 'skills')],
  });
});
