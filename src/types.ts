export type SkillActivation = "enabled" | "manual_only" | "disabled";

export type SkillEntry = {
  id: string;
  name: string;
  platform: "codex" | "claude-code" | "generic";
  category: string;
  description: string;
  sourcePath?: string;
  sourceFile?: string;
  sourceType?: "local";
  sourceVerified?: boolean;
  defaultActivation: "auto_candidate" | "manual_candidate" | "disabled_candidate";
  risk: "low" | "medium" | "high";
  tags?: string[];
};

export type ProjectSkillState = {
  skillId: string;
  activation: SkillActivation;
  reason?: string;
};

export type SkillConflictRule = {
  id: string;
  skills: string[];
  resolution: "prefer" | "split_responsibility" | "manual" | "disable_all";
  preferredSkillId?: string;
  responsibilities?: Record<string, string>;
  reason?: string;
};

export type ProjectSkillProfile = {
  id: string;
  version: string;
  projectName: string;
  projectPath: string;
  description?: string;
  repositoryType?: string;
  framework?: string;
  language?: string;
  defaultMode: string;
  requirement?: string;
  detectedProjectType?: string;
  targets: Array<"codex" | "claude-code" | "generic">;
  skills: ProjectSkillState[];
  conflicts: SkillConflictRule[];
  createdAt: string;
  updatedAt: string;
};

export type GlobalSettings = {
  skillSources: string;
  defaultTargets: Array<"codex" | "claude-code" | "generic">;
  outputPrefs: string[];
  isCRT?: boolean;
  hasBooted?: boolean;
};

export type RequirementClassification = {
  projectType: string;
  matchedCategories: string[];
  confidence: number;
  reasons: string[];
};

export type GeneratedPolicyFile = {
  path: string;
  content: string;
  exists?: boolean;
  willOverwrite?: boolean;
};

export type GeneratedPolicyBundle = {
  agentsMd?: string;
  claudeMd?: string;
  skillPolicyMd: string;
  profileJson: string;
  sessionPrompt: string;
  files: GeneratedPolicyFile[];
};

export type ScanResult = {
  skills: SkillEntry[];
  warnings: string[];
  notices?: string[];
  scannedRoots: string[];
  rootReports?: ScanRootReport[];
  scannedAt: string;
  scannerMode?: string;
  scannerVersion?: string;
};

export type ScanRootReport = {
  root: string;
  status: "scanned" | "missing" | "unreadable";
  skillFiles: number;
  message?: string;
};
