import {
  GeneratedPolicyFile,
  ProjectSkillProfile,
  ProjectSkillState,
  RequirementClassification,
  ScanResult,
  SkillEntry
} from '../types';

type RecommendProfileResult = {
  profile: ProjectSkillProfile;
  classification: RequirementClassification;
  warnings: string[];
};

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

type ApiRequestOptions = {
  signal?: AbortSignal;
};

const API_BASE_URL = import.meta.env.VITE_SKILLGATE_API_URL || '';
const FALLBACK_API_BASE_URL = 'http://localhost:8787';
const FALLBACK_SCAN_BASE_URLS = [
  FALLBACK_API_BASE_URL,
  'http://localhost:8788',
  'http://localhost:8789',
  'http://localhost:8790'
];
const EXPECTED_SCANNER_VERSION = 'local-skill-scan-v3';

type ApiHealth = {
  ok?: boolean;
  name?: string;
  scannerVersion?: string;
};

let verifiedApiBaseUrl: string | null = null;

function getApiBaseUrls() {
  if (API_BASE_URL) return [API_BASE_URL];
  return Array.from(new Set(['', ...FALLBACK_SCAN_BASE_URLS]));
}

function getScanBaseUrls() {
  return API_BASE_URL ? [API_BASE_URL] : Array.from(new Set(['', ...FALLBACK_SCAN_BASE_URLS]));
}

async function isCurrentSkillGateBackend(baseUrl: string, options: ApiRequestOptions = {}) {
  const response = await fetch(`${baseUrl}/api/health`, { signal: options.signal });
  if (!response.ok) return false;

  const health = await response.json() as ApiHealth;
  return health.name === 'skillgate-api' && health.scannerVersion === EXPECTED_SCANNER_VERSION;
}

async function getVerifiedApiBaseUrl(options: ApiRequestOptions = {}) {
  if (verifiedApiBaseUrl) return verifiedApiBaseUrl;

  let lastError: unknown = null;
  for (const baseUrl of getApiBaseUrls()) {
    try {
      if (await isCurrentSkillGateBackend(baseUrl, options)) {
        verifiedApiBaseUrl = baseUrl;
        return baseUrl;
      }
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted || API_BASE_URL) break;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'No current local-only SkillGate backend answered /api/health';
  throw new Error(`SkillGate API is unavailable. Start the backend with "npm.cmd run server" or "npm.cmd run dev". Detail: ${detail}`);
}

async function requestJsonFromBase<T>(baseUrl: string, path: string, body: unknown, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options.signal
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return await response.json() as T;
}

async function requestJson<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Promise<T> {
  try {
    const baseUrl = await getVerifiedApiBaseUrl(options);
    return await requestJsonFromBase<T>(baseUrl, path, body, options);
  } catch (error) {
    verifiedApiBaseUrl = null;
    if (options.signal?.aborted) throw error;
  }

  const baseUrl = await getVerifiedApiBaseUrl(options);
  return await requestJsonFromBase<T>(baseUrl, path, body, options);
}

function normalizeScanResult(result: ScanResult) {
  const realLocalSkills = result.skills
    .filter(skill => Boolean(skill.sourceFile))
    .map(skill => ({
      ...skill,
      sourceType: 'local' as const,
      sourceVerified: skill.sourceVerified ?? true
    }));

  const unavailableRootWarnings: string[] = [];
  const warnings = result.warnings.filter(warning => {
    const isUnavailableRoot = warning.includes('ENOENT') && warning.includes('skill root');
    if (isUnavailableRoot) unavailableRootWarnings.push(warning.replace(/^Cannot read skill root: /, 'Skill root not available: '));
    return !isUnavailableRoot;
  });

  return {
    ...result,
    skills: realLocalSkills,
    warnings,
    notices: [...(result.notices || []), ...unavailableRootWarnings],
    scannerMode: result.scannerMode || 'local-only',
    scannerVersion: result.scannerVersion || 'client-local-filter-v1'
  };
}

function isLegacySeedScanResult(result: ScanResult) {
  return !result.scannerVersion && result.skills.length > 0 && !result.skills.some(skill => Boolean(skill.sourceFile));
}

export function scanSkillsApi(input: {
  roots: string[];
  projectPath?: string;
}, options?: ApiRequestOptions) {
  return (async () => {
    let lastError: unknown = null;
    let sawLegacyBackend = false;

    for (const baseUrl of getScanBaseUrls()) {
      try {
        const result = await requestJsonFromBase<ScanResult>(baseUrl, '/api/skills/scan', input, options);
        if (isLegacySeedScanResult(result)) {
          sawLegacyBackend = true;
          continue;
        }
        return normalizeScanResult(result);
      } catch (error) {
        lastError = error;
        if (options?.signal?.aborted || API_BASE_URL) break;
      }
    }

    if (sawLegacyBackend) {
      throw new Error(
        'SkillGate found an older backend returning built-in sample skills without SKILL.md paths. Start the updated backend with "npm.cmd run dev" or "npm.cmd run server"; if port 8787 is occupied, the new server can fall back to 8788/8789/8790.'
      );
    }

    const detail = lastError instanceof Error ? lastError.message : 'Unknown request failure';
    throw new Error(`SkillGate API is unavailable. Start the backend with "npm.cmd run dev" or "npm.cmd run server". Detail: ${detail}`);
  })();
}

export function recommendProfileApi(input: {
  profileDraft: Partial<ProjectSkillProfile>;
  requirement: string;
  skills?: SkillEntry[];
  userOverrides?: ProjectSkillState[];
}, options?: ApiRequestOptions) {
  return requestJson<RecommendProfileResult>('/api/profile/recommend', input, options);
}

export function previewPolicyApi(profile: ProjectSkillProfile, options?: ApiRequestOptions) {
  return requestJson<PolicyPreviewResult>('/api/policy/preview', { profile }, options);
}

export function applyPolicyApi(input: {
  profile: ProjectSkillProfile;
  confirmedPaths: string[];
}, options?: ApiRequestOptions) {
  return requestJson<PolicyApplyResult>('/api/policy/apply', input, options);
}
