import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import { PLATFORMS } from '../../data/mockData';
import { generateBlueprint, generateProductionScript } from '../../lib/gemini';
import type { Platform, WorkflowStep, Blueprint, ProductionOutput } from '../../types';

interface SoftwareHubModalProps {
  initialPlatform?: Platform;
  onClose: () => void;
}

const STEPS: WorkflowStep[] = ['INPUT', 'BLUEPRINT', 'PROCESSING', 'FINAL'];
const STEP_LABELS: Record<WorkflowStep, string> = {
  INPUT: 'Brief',
  BLUEPRINT: 'Blueprint',
  PROCESSING: 'Synthesis',
  FINAL: 'Output',
};

const INTENT_KEYWORDS: Record<string, { label: string; color: string }> = {
  movie: { label: 'Cinematic', color: '#9B59FF' },
  luxury: { label: 'Luxury Editorial', color: '#C9A96E' },
  tech: { label: 'Tech Minimal', color: '#00C2FF' },
  nature: { label: 'Organic & Natural', color: '#10B981' },
  sport: { label: 'High Energy', color: '#EF4444' },
  fashion: { label: 'Editorial Fashion', color: '#EC4899' },
  finance: { label: 'Corporate', color: '#6366F1' },
  minimal: { label: 'Clean Minimal', color: '#F8FAFF' },
};

function StepIndicator({ current }: { current: WorkflowStep }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              active ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' :
              done ? 'text-emerald-400' : 'text-white/20'
            }`}>
              {done ? <Icon name="CheckCircle2" size={12} /> : <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]"
                style={{ borderColor: active ? '#6366F1' : 'rgba(255,255,255,0.15)' }}>{i + 1}</span>}
              {STEP_LABELS[step]}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 transition-colors ${done ? 'bg-emerald-400/40' : 'bg-white/[0.08]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputStep({
  brief, setbrief, platform, setPlatform, onGenerate, isLoading,
}: {
  brief: string;
  setbrief: (v: string) => void;
  platform: Platform;
  setPlatform: (v: Platform) => void;
  onGenerate: () => void;
  isLoading: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const detectedIntents = Object.entries(INTENT_KEYWORDS).filter(([kw]) =>
    brief.toLowerCase().includes(kw)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      if (!brief.trim()) {
        setbrief(`Design brief for ${file.name.replace(/\.[^.]+$/, '')}`);
      }
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    setListening((prev) => !prev);
  };

  return (
    <div className="space-y-5">
      {/* Platform selector */}
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Target Platform</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PLATFORMS.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all"
              style={{
                background: platform === p.id ? p.bgColor : 'rgba(255,255,255,0.02)',
                borderColor: platform === p.id ? p.color + '60' : 'rgba(255,255,255,0.07)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon name={p.icon} size={20} style={{ color: platform === p.id ? p.color : 'rgba(255,255,255,0.3)' }} />
              <span className="text-xs font-semibold" style={{ color: platform === p.id ? p.color : 'rgba(255,255,255,0.4)' }}>
                {p.name}
              </span>
              <span className="text-[9px]" style={{ color: platform === p.id ? p.color + 'aa' : 'rgba(255,255,255,0.2)' }}>
                .{p.ext}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Brief textarea */}
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Production Brief</label>
        <div className="relative">
          <textarea
            value={brief}
            onChange={(e) => setbrief(e.target.value)}
            placeholder="Describe your design brief in detail. e.g. 'Create a luxury fashion lookbook layout for a spring collection with bold typography and high-contrast editorial photography...'"
            rows={5}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50 resize-none transition-colors leading-relaxed"
          />
          {/* Intent badges */}
          {detectedIntents.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {detectedIntents.map(([kw, meta]) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                  style={{ color: meta.color, borderColor: meta.color + '40', background: meta.color + '15' }}
                >
                  {meta.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File attach + voice */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white/50 hover:text-white/80 hover:border-white/15 transition-all"
          whileTap={{ scale: 0.96 }}
        >
          <Icon name="Paperclip" size={13} />
          {attachedFile ?? 'Attach Reference'}
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />

        <motion.button
          onClick={toggleVoice}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
            listening
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-white/[0.04] border-white/[0.07] text-white/50 hover:text-white/80'
          }`}
          whileTap={{ scale: 0.96 }}
        >
          <Icon name={listening ? 'MicOff' : 'Mic'} size={13} />
          {listening ? 'Stop Recording' : 'Voice Brief'}
          {listening && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* Generate button */}
      <motion.button
        onClick={onGenerate}
        disabled={!brief.trim() || isLoading}
        className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-white tracking-wide transition-all flex items-center justify-center gap-2"
        whileHover={{ scale: brief.trim() ? 1.01 : 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin" />
            Generating Blueprint...
          </>
        ) : (
          <>
            <Icon name="Sparkles" size={16} />
            Generate Blueprint
          </>
        )}
      </motion.button>
    </div>
  );
}

function BlueprintStep({ blueprint, onSynthesize, isLoading }: { blueprint: Blueprint; onSynthesize: () => void; isLoading: boolean }) {
  const platform = PLATFORMS.find((p) => p.id === blueprint.platform);
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">{blueprint.title}</h3>
          {platform && (
            <span className="text-xs px-2 py-0.5 rounded font-semibold mt-1 inline-block" style={{ color: platform.color, background: platform.bgColor }}>
              {platform.name} · .{platform.ext}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {blueprint.colorPalette.map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-md border border-white/10" style={{ background: c }} title={c} />
          ))}
        </div>
      </div>

      {/* Strategy */}
      <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
        <div className="text-xs text-white/35 uppercase tracking-widest mb-2 font-semibold">Design Strategy</div>
        <p className="text-sm text-white/70 leading-relaxed">{blueprint.strategy}</p>
      </div>

      {/* Typography */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <div className="text-xs text-white/30 mb-1">Heading Font</div>
          <div className="text-sm font-semibold text-white" style={{ fontFamily: blueprint.typography.heading }}>{blueprint.typography.heading}</div>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <div className="text-xs text-white/30 mb-1">Body Font</div>
          <div className="text-sm font-semibold text-white">{blueprint.typography.body}</div>
        </div>
      </div>

      {/* Artboards */}
      <div>
        <div className="text-xs text-white/35 uppercase tracking-widest mb-2 font-semibold">{blueprint.artboards.length} Artboard{blueprint.artboards.length !== 1 ? 's' : ''}</div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {blueprint.artboards.map((ab) => (
            <div key={ab.id} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{ab.name}</span>
                <span className="text-xs text-white/30 font-mono">{ab.width}×{ab.height}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ab.layers.map((layer, li) => (
                  <span key={li} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40 border border-white/[0.05]">
                    {layer.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design notes */}
      <div className="p-3 bg-amber-400/[0.06] border border-amber-400/20 rounded-xl">
        <div className="text-xs text-amber-400/80 uppercase tracking-widest mb-2 font-semibold flex items-center gap-1.5">
          <Icon name="AlertTriangle" size={11} />
          Design Notes
        </div>
        <ul className="space-y-1">
          {blueprint.designNotes.map((note, i) => (
            <li key={i} className="text-xs text-white/55 flex items-start gap-2">
              <span className="text-amber-400/60 mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>

      <motion.button
        onClick={onSynthesize}
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-sm font-bold text-white tracking-wide transition-all flex items-center justify-center gap-2"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin" />
            Synthesizing Production...
          </>
        ) : (
          <>
            <Icon name="Code2" size={16} />
            Synthesize Production Script
          </>
        )}
      </motion.button>
    </div>
  );
}

function ProcessingStep({ platform }: { platform: Platform }) {
  const p = PLATFORMS.find((pl) => pl.id === platform);
  const steps = [
    'Analyzing design brief...',
    'Optimizing layer structure...',
    'Generating production script...',
    'Building SVG preview...',
    'Finalizing export configurations...',
  ];
  const [currentStep] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Animated ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={p?.color ?? '#6366F1'}
            strokeWidth="6"
            strokeDasharray="276"
            strokeDashoffset="200"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name={p?.icon ?? 'Sparkles'} size={28} style={{ color: p?.color ?? '#6366F1' }} />
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-white font-['Space_Grotesk'] mb-1">Synthesizing Production</div>
        <div className="text-sm text-white/40">{steps[currentStep]}</div>
      </div>

      <div className="w-64 space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p?.color ?? '#6366F1' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
            />
            <span className="text-xs text-white/35">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FinalStep({ output, blueprint, onClose }: { output: ProductionOutput; blueprint: Blueprint; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'script' | 'preview'>('script');
  const [copied, setCopied] = useState(false);
  const p = PLATFORMS.find((pl) => pl.id === blueprint.platform);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = p?.ext ?? 'txt';
    const blob = new Blob([output.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blueprint.title.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: 'Layout', label: 'Artboards', value: output.artboardCount },
          { icon: 'Layers', label: 'Platform', value: p?.name ?? blueprint.platform },
          { icon: 'FileCode', label: 'Format', value: `.${p?.ext ?? 'jsx'}` },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
            <Icon name={stat.icon} size={16} className="text-indigo-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/30">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg w-fit border border-white/[0.05]">
        {(['script', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab === 'script' ? `Script (.${p?.ext ?? 'jsx'})` : 'SVG Preview'}
          </button>
        ))}
      </div>

      {activeTab === 'script' ? (
        <div className="relative">
          <pre className="bg-[#060810] border border-white/[0.07] rounded-xl p-4 text-[11px] text-emerald-300/80 overflow-auto max-h-64 leading-relaxed font-mono whitespace-pre-wrap">
            {output.script}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.07] rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={12} className={copied ? 'text-emerald-400' : ''} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <div className="bg-[#060810] border border-white/[0.07] rounded-xl overflow-hidden">
          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: output.svgPreview }}
          />
        </div>
      )}

      {/* Export actions */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-bold text-white transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon name="Download" size={15} />
          Export .{p?.ext ?? 'jsx'}
        </motion.button>
        <motion.button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
          whileTap={{ scale: 0.97 }}
        >
          Done
        </motion.button>
      </div>
    </div>
  );
}

export function SoftwareHubModal({ initialPlatform = 'illustrator', onClose }: SoftwareHubModalProps) {
  const [step, setStep] = useState<WorkflowStep>('INPUT');
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [brief, setBrief] = useState('');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [output, setOutput] = useState<ProductionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateBlueprint = async () => {
    setIsLoading(true);
    try {
      const bp = await generateBlueprint(brief, platform);
      setBlueprint(bp);
      setStep('BLUEPRINT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSynthesize = async () => {
    if (!blueprint) return;
    setIsLoading(true);
    setStep('PROCESSING');
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const out = await generateProductionScript(blueprint);
      setOutput(out);
      setStep('FINAL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.25 }}
        className="bg-[#0B0D14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Icon name="Sparkles" size={15} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-['Space_Grotesk']">Production Hub</div>
              <div className="text-[10px] text-white/30">AI-Powered Script Synthesis</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/80 transition-colors p-1">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {step === 'INPUT' && (
              <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <InputStep
                  brief={brief}
                  setbrief={setBrief}
                  platform={platform}
                  setPlatform={setPlatform}
                  onGenerate={handleGenerateBlueprint}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {step === 'BLUEPRINT' && blueprint && (
              <motion.div key="blueprint" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <BlueprintStep blueprint={blueprint} onSynthesize={handleSynthesize} isLoading={isLoading} />
              </motion.div>
            )}
            {step === 'PROCESSING' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProcessingStep platform={platform} />
              </motion.div>
            )}
            {step === 'FINAL' && output && blueprint && (
              <motion.div key="final" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <FinalStep output={output} blueprint={blueprint} onClose={onClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
