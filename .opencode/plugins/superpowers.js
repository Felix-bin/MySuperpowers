// 仅注册技能，保留 OpenCode V1/V2 的按需加载。
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Skills directory shared by V1 (config hook) and V2 (setup/ctx.skill.transform)
const superpowersSkillsDir = path.resolve(__dirname, '../../skills');

// Simple frontmatter extraction (avoid dependency on skills-core for
// skill registration). Handles plain `key: value` lines, quoted values (including
// quotes that close on an indented continuation line), YAML block scalar
// markers (`>`, `|`) with indented continuation lines, and CRLF line
// endings. Not a full YAML parser — nested maps flatten into their parent
// key's value, which is fine for the name/description fields consumed here.
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};
  let lastKey = null;

  for (const rawLine of frontmatterStr.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !/^\s/.test(line)) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      // Block scalar markers (>, |, optionally with +/- chomping) carry no
      // value themselves; the indented lines that follow do.
      frontmatter[key] = /^(>[+-]?|\|[+-]?)$/.test(value) ? '' : value;
      lastKey = key;
    } else if (lastKey !== null && line.trim() !== '') {
      // Continuation of a multi-line value: append rather than drop so long
      // descriptions survive parsing. Newlines collapse to spaces — good
      // enough for the single-line name/description fields consumed here.
      frontmatter[lastKey] = `${frontmatter[lastKey]} ${line.trim()}`.trim();
    }
  }

  // A quoted value may close on a continuation line, so unquote only once
  // the value is fully assembled: strip exactly one matching surrounding
  // pair and leave unbalanced quotes alone.
  for (const key of Object.keys(frontmatter)) {
    frontmatter[key] = frontmatter[key].replace(/^(["'])([\s\S]*)\1$/, '$2');
  }

  return { frontmatter, content: body };
};

export const SuperpowersPlugin = async () => {
  return {
    // Inject skills path into live config so OpenCode discovers superpowers skills
    // without requiring manual symlinks or config file edits.
    config: async (config) => {
      // V2: skills is a flat array — skip, setup() handles V2 skill registration
      if (Array.isArray(config.skills)) return;

      // V1: skills is { paths: [...] }
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }
    },

  };
};

/**
 * V2 Setup Function (default.setup)
 *
 * Called by V2 PluginSupervisor (packages/core/src/plugin/supervisor.ts).
 * Registers skills without injecting session context:
 *
 * 1. Registers every skills/<name>/SKILL.md as a native Skill.Info object
 *    via ctx.skill.transform((draft) => draft.add(info)).
 *    V2 removed the old draft.source() directory registration; the draft API
 *    is now { list, add, update, remove } where add() decodes plain objects
 *    against the host's Skill.Info schema (OpenCode 2.0.4 contract):
 *    { id, name, description?, autoinvoke?, path, content }. The file field
 *    is `path` — renamed from `location` in upstream commit 199aabe9e2,
 *    first released in v2.0.4.
 *    See packages/core/src/plugin/skill.ts and packages/schema/src/skill.ts.
 */
async function setup(ctx) {
  // V1 (observed on opencode 1.18.18) also invokes default.setup, but with a
  // V1-shaped ctx that lacks the skill/session domains. Detect it and return
  // quietly — V1 is served entirely by the SuperpowersPlugin named export.
  if (!ctx || !ctx.skill || typeof ctx.skill.transform !== 'function') {
    return;
  }

  // 1. Register skills (one transform; one draft.add per skill)
  try {
    const skills = [];
    if (fs.existsSync(superpowersSkillsDir)) {
      for (const entry of fs.readdirSync(superpowersSkillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const skillPath = path.join(superpowersSkillsDir, entry.name, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;
        const { frontmatter, content } = extractAndStripFrontmatter(fs.readFileSync(skillPath, 'utf8'));
        skills.push({
          id: entry.name,
          name: frontmatter.name || entry.name,
          ...(frontmatter.description ? { description: frontmatter.description } : {}),
          // Skill.Info renamed its required file field `location` -> `path`
          // in OpenCode v2.0.4 (upstream commit 199aabe9e2).
          path: skillPath,
          content,
        });
      }
    }
    await ctx.skill.transform((draft) => {
      // draft.add() decodes against the host's Skill.Info schema and throws
      // synchronously on a mismatch. A throw escaping this callback is what
      // the host escalates into an asynchronous hard-disable of the entire
      // plugin ("Plugin disabled after skill.transform failed") — the
      // try/catch around ctx.skill.transform never sees it. Contain failures
      // per skill so the remaining skills stay available.
      for (const skill of skills) {
        try {
          draft.add(skill);
        } catch (err) {
          console.error(`[superpowers] skill "${skill.id}" rejected by host, skipping:`, err);
        }
      }
    });
  } catch (err) {
    // Never break plugin activation: one failing plugin takes down the whole
    // V2 generation (including provider/catalog plugins => no models in TUI).
    console.error('[superpowers] skill registration failed:', err);
  }

}

/**
 * Default Export: { id, server, setup }
 *
 * V2 PluginSupervisor reads { id, setup }.
 * V1 reads named export SuperpowersPlugin.
 * server() is exported for V1 compatibility.
 */
export default {
  id: 'superpowers',
  server: SuperpowersPlugin,
  setup,
};
