import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { applyPolicyApi, previewPolicyApi } from '../api/client';
import ScrambleText from '../components/ScrambleText';
import { generatePolicyBundle } from '../core/generatePolicy';
import { useStore } from '../store';
import { GeneratedPolicyFile } from '../types';
import { exportPolicyZip } from '../utils/zipExporter';
import { soundEngine } from '../utils/useSound';

type OutputTab = 'agents' | 'claude' | 'json' | 'prompt' | 'policy';

export default function OutputPreview() {
  const profile = useStore(state => state.profile);
  const settings = useStore(state => state.settings);
  const outputPrefs = settings.outputPrefs;
  const [activeTab, setActiveTab] = useState<OutputTab>('prompt');
  const [copied, setCopied] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<GeneratedPolicyFile[]>([]);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [applyStatus, setApplyStatus] = useState('');
  const [policyError, setPolicyError] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!outputPrefs.includes('prompt') && outputPrefs.length > 0) {
      const first = outputPrefs[0] === 'profile' ? 'json' : outputPrefs[0];
      setActiveTab(first as OutputTab);
    }
  }, [outputPrefs]);

  const generated = useMemo(() => profile ? generatePolicyBundle(profile) : null, [profile]);

  useEffect(() => {
    if (!profile) return;

    const controller = new AbortController();
    setIsPreviewing(true);
    setPolicyError('');
    previewPolicyApi(profile, { signal: controller.signal })
      .then(result => {
        setPreviewFiles(result.files);
        setPreviewWarnings(result.warnings);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setPreviewFiles([]);
        setPreviewWarnings([]);
        setPolicyError(error instanceof Error ? error.message : 'Policy preview failed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPreviewing(false);
      });

    return () => controller.abort();
  }, [profile]);

  if (!profile || !generated) {
    return (
      <div className="border border-solid border-ink p-8 text-center bg-blueprint-grid">
        <p className="font-serif text-lg mb-6">No policy to preview. Please generate one first.</p>
        <Link to="/setup" className="btn-terminal primary">Go to Project Setup</Link>
      </div>
    );
  }

  const getActiveContent = () => {
    switch (activeTab) {
      case 'agents': return generated.agentsMd || '';
      case 'claude': return generated.claudeMd || '';
      case 'policy': return generated.skillPolicyMd;
      case 'json': return generated.profileJson;
      case 'prompt': return generated.sessionPrompt;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameByTab: Record<OutputTab, string> = {
      agents: 'AGENTS.md',
      claude: 'CLAUDE.md',
      policy: 'skill-policy.md',
      json: 'profile.json',
      prompt: 'session_prompt.md'
    };

    const blob = new Blob([getActiveContent()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameByTab[activeTab];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    soundEngine.playSuccess();
    exportPolicyZip(profile, settings, {
      agents: generated.agentsMd || '',
      claude: generated.claudeMd || '',
      policy: generated.skillPolicyMd,
      prompt: generated.sessionPrompt
    });
  };

  const handleApplyToProject = async () => {
    const files = previewFiles.length > 0 ? previewFiles : generated.files;
    const summary = files
      .map(file => `${file.exists || file.willOverwrite ? '[OVERWRITE]' : '[WRITE]'} ${file.path}`)
      .join('\n');
    const confirmation = window.confirm(
      `Apply SkillGate policy files to this project?\n\n${summary}\n\nExisting files require confirmation and may be overwritten.`
    );

    if (!confirmation) {
      setApplyStatus('Apply canceled. No files were written.');
      return;
    }

    setIsApplying(true);
    setPolicyError('');
    setApplyStatus('');
    try {
      const confirmedPaths = files.map(file => file.path);
      const result = await applyPolicyApi({ profile, confirmedPaths });
      setApplyStatus(`Wrote ${result.writtenFiles.length} files. Skipped ${result.skippedFiles.length}.`);
      setPreviewWarnings([...previewWarnings, ...result.warnings].filter(Boolean));
      soundEngine.playSuccess();
      await previewPolicyApi(profile).then(next => {
        setPreviewFiles(next.files);
        setPreviewWarnings(next.warnings);
      });
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Policy apply failed.');
      soundEngine.playError();
    } finally {
      setIsApplying(false);
    }
  };

  const filesForSummary = previewFiles.length > 0 ? previewFiles : generated.files;

  return (
    <div className="space-y-12 pt-4 reveal-text">
      <header className="border-b-2 border-solid border-ink pb-4">
        <h2 className="text-display min-h-[1.2em] border-l-8 border-ink pl-4"><ScrambleText text="OUTPUT PREVIEW" /></h2>
        <div className="font-mono text-sm uppercase flex justify-between mt-4">
          <span>Targets: {profile.targets.join(', ')}</span>
          <span className="bg-ink text-paper px-2 py-0.5">Enforcement Level: Soft Policy</span>
        </div>
      </header>

      <section className="border border-solid border-ink bg-paper p-6 relative">
        <div className="absolute top-0 right-0 bg-ink text-paper font-mono text-caption px-2 py-1 uppercase">
          FIG_01: SUMMARY
        </div>
        <h3 className="font-mono text-sm uppercase font-bold mb-4">Generated Outputs:</h3>
        <ul className="list-none m-0 pl-0 font-mono text-sm space-y-2">
          {filesForSummary.map(file => (
            <li key={file.path} className="flex items-center gap-2">
              <span className={file.exists || file.willOverwrite ? 'bg-ink text-paper px-1' : 'text-blueprint-blue'}>
                {file.exists || file.willOverwrite ? '!' : '*'}
              </span>
              <span className="break-all">{file.path}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 font-mono text-sm">
          {isPreviewing && <div className="text-muted">Previewing project write targets...</div>}
          {previewWarnings.slice(0, 3).map(warning => (
            <div key={warning} className="text-muted">WARN: {warning}</div>
          ))}
          {policyError && <div className="text-red-600">ERROR: {policyError}</div>}
          {applyStatus && <div className="text-blueprint-blue font-bold">{applyStatus}</div>}
        </div>
      </section>

      <section>
        <div className="ascii-divider !mt-0 !mb-8">========== GENERATED ARTIFACTS ==========</div>

        <div className="border border-solid border-ink bg-paper flex flex-col min-h-[600px]">
          <div className="flex border-b border-solid border-ink overflow-x-auto">
            {outputPrefs.includes('prompt') && (
              <button
                onClick={() => setActiveTab('prompt')}
                className={`px-4 py-3 font-mono text-sm uppercase whitespace-nowrap transition-none border-r border-solid border-ink ${activeTab === 'prompt' ? 'bg-blueprint-blue text-paper' : 'hover:bg-blueprint-blue-dim'}`}
              >
                Session Prompt
              </button>
            )}
            {outputPrefs.includes('agents') && (
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-3 font-mono text-sm uppercase whitespace-nowrap transition-none border-r border-solid border-ink ${activeTab === 'agents' ? 'bg-ink text-paper' : 'hover:bg-blueprint-blue-dim'}`}
              >
                AGENTS.md
              </button>
            )}
            {outputPrefs.includes('claude') && (
              <button
                onClick={() => setActiveTab('claude')}
                className={`px-4 py-3 font-mono text-sm uppercase whitespace-nowrap transition-none border-r border-solid border-ink ${activeTab === 'claude' ? 'bg-ink text-paper' : 'hover:bg-blueprint-blue-dim'}`}
              >
                CLAUDE.md
              </button>
            )}
            {outputPrefs.includes('policy') && (
              <button
                onClick={() => setActiveTab('policy')}
                className={`px-4 py-3 font-mono text-sm uppercase whitespace-nowrap transition-none border-r border-solid border-ink ${activeTab === 'policy' ? 'bg-ink text-paper' : 'hover:bg-blueprint-blue-dim'}`}
              >
                skill-policy.md
              </button>
            )}
            {outputPrefs.includes('profile') && (
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-3 font-mono text-sm uppercase whitespace-nowrap transition-none border-r border-solid border-ink ${activeTab === 'json' ? 'bg-ink text-paper' : 'hover:bg-blueprint-blue-dim'}`}
              >
                profile.json
              </button>
            )}
            <div className="flex-1 bg-blueprint-grid min-w-[20px]"></div>
          </div>

          <div className="flex-1 p-0 relative bg-[#f9f9f9]">
            <textarea
              readOnly
              value={getActiveContent()}
              className="w-full h-full min-h-[500px] p-6 font-mono text-sm leading-relaxed resize-none outline-none bg-transparent"
            />
          </div>

          <div className="border-t border-solid border-ink p-4 bg-paper flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="font-mono text-sm text-muted">
              {activeTab === 'agents' && 'Put this file in your project root as AGENTS.md'}
              {activeTab === 'claude' && 'Put this file in your project root as CLAUDE.md'}
              {activeTab === 'policy' && 'Generic policy text for .skillgate/skill-policy.md'}
              {activeTab === 'json' && 'Machine-readable state for .skillgate/profile.json'}
              {activeTab === 'prompt' && 'Paste this directly into your agent chat session.'}
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <button className="btn-terminal flex-1 sm:flex-none border-b-2" onClick={() => { soundEngine.playClick(); handleDownload(); }}>
                [ SAVE CURRENT ]
              </button>
              <button className="btn-terminal primary flex-1 sm:flex-none border-b-2" onClick={handleDownloadAll}>
                [ DOWNLOAD FULL ZIP ]
              </button>
              <button
                className="btn-terminal primary flex-1 sm:flex-none border-b-2"
                onClick={handleApplyToProject}
                disabled={isApplying || isPreviewing}
              >
                {isApplying ? '[ APPLYING ]' : '[ APPLY TO PROJECT ]'}
              </button>
              <button className={`btn-terminal flex-1 sm:flex-none border-b-2 ${copied ? 'bg-ink text-paper' : ''}`} onClick={() => { soundEngine.playClick(); handleCopy(); }}>
                {copied ? 'COPIED!' : 'COPY CONFIRMED'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
