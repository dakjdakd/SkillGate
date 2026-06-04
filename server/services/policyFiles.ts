import fs from 'fs/promises';
import path from 'path';
import { generatePolicyBundle } from '../../src/core/generatePolicy';
import { GeneratedPolicyFile, ProjectSkillProfile } from '../../src/types';

type PolicyPreviewResult = {
  files: GeneratedPolicyFile[];
  prompt: string;
  warnings: string[];
};

type PolicyApplyResult = {
  writtenFiles: string[];
  skippedFiles: string[];
  warnings: string[];
};

function resolveProjectRoot(projectPath: string) {
  const root = path.resolve(projectPath || '');
  const parsed = path.parse(root);
  if (!projectPath || root === parsed.root) {
    throw new Error('Project path is required and cannot be a filesystem root.');
  }
  return root;
}

function resolveTargetPath(projectRoot: string, relativePath: string) {
  const target = path.resolve(projectRoot, relativePath);
  const relative = path.relative(projectRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project path: ${relativePath}`);
  }
  return target;
}

async function fileExists(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function previewPolicyFiles(profile: ProjectSkillProfile): Promise<PolicyPreviewResult> {
  const projectRoot = resolveProjectRoot(profile.projectPath);
  const bundle = generatePolicyBundle(profile);
  const warnings: string[] = [];

  const files = await Promise.all(bundle.files.map(async file => {
    const absolutePath = resolveTargetPath(projectRoot, file.path);
    const exists = await fileExists(absolutePath);
    if (exists) warnings.push(`${file.path} already exists and requires confirmation before overwrite.`);
    return {
      ...file,
      path: absolutePath,
      exists,
      willOverwrite: exists
    };
  }));

  return {
    files,
    prompt: bundle.sessionPrompt,
    warnings
  };
}

export async function applyPolicyFiles(profile: ProjectSkillProfile, confirmedPaths: string[]): Promise<PolicyApplyResult> {
  const preview = await previewPolicyFiles(profile);
  const confirmed = new Set(confirmedPaths.map(filePath => path.resolve(filePath)));
  const writtenFiles: string[] = [];
  const skippedFiles: string[] = [];
  const warnings: string[] = [...preview.warnings];

  for (const file of preview.files) {
    const absolutePath = path.resolve(file.path);
    if (!confirmed.has(absolutePath)) {
      skippedFiles.push(absolutePath);
      continue;
    }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, file.content, 'utf8');
    writtenFiles.push(absolutePath);
  }

  return {
    writtenFiles,
    skippedFiles,
    warnings
  };
}
