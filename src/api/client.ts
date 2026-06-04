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

async function requestJson<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Promise<T> {
  const bases = API_BASE_URL ? [API_BASE_URL] : ['', FALLBACK_API_BASE_URL];
  let lastError: unknown = null;

  for (const baseUrl of bases) {
    try {
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
    } catch (error) {
      lastError = error;
      if (options.signal?.aborted || API_BASE_URL || baseUrl === FALLBACK_API_BASE_URL) break;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'Unknown request failure';
  throw new Error(`SkillGate API is unavailable. Start the backend with "npm.cmd run server". Detail: ${detail}`);
}

export function scanSkillsApi(input: {
  roots: string[];
  projectPath?: string;
  includeBuiltIn?: boolean;
}, options?: ApiRequestOptions) {
  return requestJson<ScanResult>('/api/skills/scan', input, options);
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
