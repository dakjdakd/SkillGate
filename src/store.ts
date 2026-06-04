import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { classifyRequirement } from './core/classifyRequirement';
import { detectConflicts } from './core/detectConflicts';
import { knownSkills } from './core/knownSkills';
import { resolveSkills } from './core/resolveSkills';
import { GlobalSettings, ProjectSkillProfile, ProjectSkillState } from './types';

export { knownSkills };

const LOCAL_STORAGE_KEY = 'skillgate-v1-storage';

interface SkillGateState {
  profile: ProjectSkillProfile | null;
  recentProfiles: ProjectSkillProfile[];
  settings: GlobalSettings;
  lastScanTime: string | null;
  setProfile: (profile: ProjectSkillProfile) => void;
  deleteProfile: (id: string) => void;
  loadProfile: (id: string) => void;
  updateSkillState: (skillId: string, updates: Partial<ProjectSkillState>) => void;
  analyzeRequirement: (requirement: string) => void;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  resetAll: () => void;
  setLastScanTime: (time: string) => void;
}

const defaultSettings: GlobalSettings = {
  skillSources: '~/.codex/skills\n~/.agents/skills\n~/.claude/skills\nproject/.codex/skills\nproject/.agents/skills',
  defaultTargets: ['codex', 'claude-code'],
  outputPrefs: ['agents', 'claude', 'profile', 'policy', 'prompt'],
  isCRT: false,
  hasBooted: false
};

export const useStore = create<SkillGateState>()(
  persist(
    (set) => ({
      profile: null,
      recentProfiles: [],
      settings: defaultSettings,
      lastScanTime: null,

      setProfile: (profile) => set((state) => {
        const existingIdx = state.recentProfiles.findIndex(p => p.id === profile.id);
        let newRecents = [...state.recentProfiles];
        if (existingIdx >= 0) {
          newRecents[existingIdx] = profile;
        } else {
          newRecents = [profile, ...newRecents].slice(0, 50);
        }
        return { profile, recentProfiles: newRecents };
      }),

      deleteProfile: (id) => set((state) => ({
        recentProfiles: state.recentProfiles.filter(p => p.id !== id),
        profile: state.profile?.id === id ? null : state.profile
      })),

      loadProfile: (id) => set((state) => ({
        profile: state.recentProfiles.find(p => p.id === id) || null
      })),

      updateSkillState: (skillId, updates) => set((state) => {
        if (!state.profile) return state;

        const newSkills = state.profile.skills.map(skill =>
          skill.skillId === skillId ? { ...skill, ...updates } : skill
        );

        const conflictResult = detectConflicts({ selectedSkills: newSkills, registry: knownSkills });
        const updatedProfile = {
          ...state.profile,
          skills: newSkills,
          conflicts: conflictResult.conflicts,
          updatedAt: new Date().toISOString()
        };

        return {
          profile: updatedProfile,
          recentProfiles: state.recentProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        };
      }),

      analyzeRequirement: (requirement: string) => set((state) => {
        if (!state.profile) return state;

        const classification = classifyRequirement(requirement);
        const newSkills = resolveSkills({ skills: knownSkills, classification });
        const updatedProfile = {
          ...state.profile,
          requirement,
          detectedProjectType: classification.projectType,
          skills: newSkills,
          conflicts: detectConflicts({ selectedSkills: newSkills, registry: knownSkills }).conflicts,
          updatedAt: new Date().toISOString()
        };

        return {
          profile: updatedProfile,
          recentProfiles: state.recentProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        };
      }),

      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      resetAll: () => set({
        profile: null,
        recentProfiles: [],
        settings: defaultSettings,
        lastScanTime: null
      }),

      setLastScanTime: (time) => set({ lastScanTime: time })
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);
