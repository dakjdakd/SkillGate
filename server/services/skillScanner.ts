import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import os from 'os';
import { ScanResult, ScanRootReport, SkillEntry } from '../../src/types';

type ScanSkillsOptions = {
  roots: string[];
  projectPath?: string;
};

type ScanMessageBuckets = {
  warnings: string[];
  notices: string[];
};

export const SCANNER_VERSION = 'local-skill-scan-v3';

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function unquoteYamlScalar(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function getDefaultSkillRoots(projectPath?: string) {
  const home = os.homedir();
  const projectRoot = projectPath || process.cwd();
  const envRoots = [
    process.env.CODEX_HOME && path.join(process.env.CODEX_HOME, 'skills'),
    process.env.CODEX_HOME && path.join(process.env.CODEX_HOME, 'plugins', 'cache'),
    process.env.CLAUDE_HOME && path.join(process.env.CLAUDE_HOME, 'skills'),
    process.env.AGENTS_HOME && path.join(process.env.AGENTS_HOME, 'skills'),
    process.env.XDG_CONFIG_HOME && path.join(process.env.XDG_CONFIG_HOME, 'codex', 'skills'),
    process.env.APPDATA && path.join(process.env.APPDATA, 'Codex', 'skills')
  ].filter((root): root is string => Boolean(root));

  return unique([
    path.join(home, '.codex', 'skills'),
    path.join(home, '.agents', 'skills'),
    path.join(home, '.claude', 'skills'),
    path.join(home, '.codex', 'plugins', 'cache'),
    path.join(projectRoot, '.codex', 'skills'),
    path.join(projectRoot, '.agents', 'skills'),
    ...envRoots
  ]);
}

function normalizeRoot(root: string, projectPath?: string) {
  const trimmed = root.trim();
  if (!trimmed) return '';

  if (trimmed === '~') return os.homedir();
  if (trimmed.startsWith('~/') || trimmed.startsWith('~\\')) {
    return path.join(os.homedir(), trimmed.slice(2));
  }
  if (trimmed.startsWith('project/') || trimmed.startsWith('project\\')) {
    return path.join(projectPath || process.cwd(), trimmed.slice('project/'.length));
  }

  return path.resolve(trimmed);
}

function inferCategory(text: string): SkillEntry['category'] {
  const lower = text.toLowerCase();
  if (lower.includes('frontend') || lower.includes('ui') || lower.includes('design')) return 'frontend_design';
  if (lower.includes('browser') || lower.includes('playwright') || lower.includes('screenshot')) return 'browser_testing';
  if (lower.includes('image') || lower.includes('bitmap') || lower.includes('banner')) return 'image_generation';
  if (lower.includes('openai') || lower.includes('api docs')) return 'openai_docs';
  if (lower.includes('docx') || lower.includes('word') || lower.includes('document')) return 'document_editing';
  if (lower.includes('spreadsheet') || lower.includes('excel') || lower.includes('csv')) return 'spreadsheet_analysis';
  if (lower.includes('presentation') || lower.includes('ppt') || lower.includes('slide')) return 'presentation_building';
  if (lower.includes('deploy') || lower.includes('netlify') || lower.includes('publish')) return 'deployment';
  if (lower.includes('storage') || lower.includes('disk')) return 'storage_analysis';
  if (lower.includes('automation') || lower.includes('install') || lower.includes('plugin')) return 'automation';
  return 'generic_coding';
}

function inferRisk(text: string): SkillEntry['risk'] {
  const lower = text.toLowerCase();
  if (lower.includes('deploy') || lower.includes('delete') || lower.includes('storage') || lower.includes('disk')) return 'high';
  if (lower.includes('generate') || lower.includes('install') || lower.includes('write') || lower.includes('plugin')) return 'medium';
  return 'low';
}

function inferActivation(risk: SkillEntry['risk']): SkillEntry['defaultActivation'] {
  if (risk === 'high') return 'disabled_candidate';
  if (risk === 'medium') return 'manual_candidate';
  return 'auto_candidate';
}

function parseSkillMarkdown(filePath: string, content: string): SkillEntry {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const nameFromYaml = lines.find(line => line.startsWith('name:'))?.replace('name:', '').trim();
  const descriptionFromYaml = lines.find(line => line.startsWith('description:'))?.replace('description:', '').trim();
  const heading = lines.find(line => line.startsWith('# '))?.replace(/^#\s+/, '').trim();
  const folderName = path.basename(path.dirname(filePath));
  const name = nameFromYaml ? unquoteYamlScalar(nameFromYaml) : heading || folderName;
  const description = descriptionFromYaml
    ? unquoteYamlScalar(descriptionFromYaml)
    : lines.find(line => line.trim() && !line.startsWith('---'))?.trim() || 'Local skill detected from SKILL.md.';
  const category = inferCategory(`${name}\n${description}\n${normalized.slice(0, 1200)}`);
  const risk = inferRisk(`${name}\n${description}\n${normalized.slice(0, 1200)}`);

  return {
    id: name,
    name,
    platform: 'generic',
    category,
    description,
    sourcePath: path.dirname(filePath),
    sourceFile: filePath,
    defaultActivation: inferActivation(risk),
    risk
  };
}

async function findSkillFiles(root: string, messages: ScanMessageBuckets, depth = 0): Promise<string[]> {
  if (depth > 8) return [];

  let entries: Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const reason = error instanceof Error ? error.message : 'unknown error';
    const message = `Skill root not available: ${root} (${reason})`;
    if (code === 'ENOENT') {
      messages.notices.push(message);
    } else {
      messages.warnings.push(`Cannot read skill root: ${root} (${reason})`);
    }
    return [];
  }

  const skillMd = entries.find(entry => entry.isFile() && entry.name.toLowerCase() === 'skill.md');
  if (skillMd) return [path.join(root, skillMd.name)];

  const nested = await Promise.all(
    entries
      .filter(entry => entry.isDirectory() && (entry.name === '.system' || !entry.name.startsWith('.')) && entry.name !== 'node_modules')
      .filter(entry => !entry.name.startsWith('plugin-backup-'))
      .map(entry => findSkillFiles(path.join(root, entry.name), messages, depth + 1))
  );

  return nested.flat();
}

async function scanRoot(root: string, messages: ScanMessageBuckets): Promise<{ files: string[]; report: ScanRootReport }> {
  try {
    await fs.access(root);
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const reason = error instanceof Error ? error.message : 'unknown error';
    const message = `Skill root not available: ${root} (${reason})`;

    if (code === 'ENOENT') {
      messages.notices.push(message);
      return { files: [], report: { root, status: 'missing', skillFiles: 0, message } };
    }

    const warning = `Cannot read skill root: ${root} (${reason})`;
    messages.warnings.push(warning);
    return { files: [], report: { root, status: 'unreadable', skillFiles: 0, message: warning } };
  }

  const files = await findSkillFiles(root, messages);
  return {
    files,
    report: {
      root,
      status: 'scanned',
      skillFiles: files.length,
      message: files.length > 0 ? `Found ${files.length} SKILL.md file(s).` : 'No SKILL.md files found under this root.'
    }
  };
}

export async function scanSkills(options: ScanSkillsOptions): Promise<ScanResult> {
  const warnings: string[] = [];
  const notices: string[] = [];
  const requestedRoots = options.roots.map(root => normalizeRoot(root, options.projectPath)).filter(Boolean);
  const scannedRoots = unique([...requestedRoots, ...getDefaultSkillRoots(options.projectPath)]);
  const rootScans = await Promise.all(scannedRoots.map(root => scanRoot(root, { warnings, notices })));
  const skillFiles = rootScans.flatMap(scan => scan.files);
  const scannedSkills: SkillEntry[] = [];

  for (const filePath of skillFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      scannedSkills.push({
        ...parseSkillMarkdown(filePath, content),
        sourceType: 'local',
        sourceVerified: true
      });
    } catch (error) {
      warnings.push(`Cannot parse ${filePath}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  return {
    skills: scannedSkills,
    warnings,
    notices,
    scannedRoots,
    rootReports: rootScans.map(scan => scan.report),
    scannedAt: new Date().toISOString(),
    scannerMode: 'local-only',
    scannerVersion: SCANNER_VERSION
  };
}
