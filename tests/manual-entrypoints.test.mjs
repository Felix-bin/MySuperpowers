import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const root = process.env.SUPERPOWERS_TEST_ROOT || fileURLToPath(new URL('../', import.meta.url));
const json = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const removed = ['using-superpowers', 'diagnosing-superpowers'];
const skills = readdirSync(resolve(root, 'skills')).filter(name =>
  existsSync(resolve(root, 'skills', name, 'SKILL.md')));

test('removed skills are not discoverable; other skills remain', () => {
  for (const name of removed) {
    assert.ok(!skills.includes(name));
    assert.ok(!existsSync(resolve(root, 'skills', name)));
  }
  for (const name of ['writing-plans', 'brainstorming', 'systematic-debugging']) {
    assert.ok(skills.includes(name));
  }
});

test('manifests register no automatic workflow hooks', () => {
  assert.deepEqual(json('hooks/hooks.json').hooks, {});
  assert.deepEqual(json('hooks/hooks-cursor.json').hooks, {});
  assert.equal(json('.kimi-plugin/plugin.json').sessionStart, undefined);
  const muse = json('.muse-plugin/plugin.json').capabilities;
  assert.deepEqual(muse.hooks, []);
  assert.deepEqual(muse.skills.map(s => s.id).sort(), skills.sort());
  for (const skill of muse.skills) assert.ok(existsSync(resolve(root, skill.path)));
  assert.ok(!readFileSync(resolve(root, 'GEMINI.md'), 'utf8').includes('@./skills/'));
});

test('OpenCode V1 discovers skills without message transforms', async () => {
  const mod = await import(pathToFileURL(resolve(root, '.opencode/plugins/superpowers.js')));
  const plugin = await mod.SuperpowersPlugin({});
  assert.deepEqual(Object.keys(plugin), ['config']);
  const config = { skills: { paths: ['existing-skills'] } };
  await plugin.config(config);
  await plugin.config(config);
  assert.deepEqual(config.skills.paths, ['existing-skills', resolve(root, 'skills')]);
});

test('OpenCode V2 registers all remaining skills without session hooks', async () => {
  const mod = await import(pathToFileURL(resolve(root, '.opencode/plugins/superpowers.js')));
  const added = [];
  const hooks = [];
  await mod.default.setup({
    skill: { transform: async callback => callback({ add: value => added.push(value) }) },
    session: { hook: async (...args) => hooks.push(args) },
  });
  assert.deepEqual(hooks, []);
  assert.deepEqual(added.map(s => s.id).sort(), skills.sort());
  for (const skill of added) assert.ok(skill.content.length > 0);
});
