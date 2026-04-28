/**
 * Bold Layers — Neural Workflow Builder
 * n8n-style visual canvas. One idea → auto-generates content for all platforms in parallel.
 * Illustrator (poster) · InDesign (flyer) · After Effects (reel) · Blender (3D render)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { Client, WFNode, WFNodeType, WFEdge, Platform, Blueprint } from '../../types';
import { PLATFORMS } from '../../data/mockData';
import { generateBlueprint, generateProductionScript, PLATFORM_DELIVERABLE } from '../../lib/gemini';

// ─── Node config ──────────────────────────────────────────────────────────────

type NodeCfg = {
  label: string; icon: string; color: string;
  category: 'Data' | 'Input' | 'Process' | 'Platform' | 'Output';
  description: string; hasInput: boolean; hasOutput: boolean;
};

const NODE_CFG: Record<WFNodeType, NodeCfg> = {
  client:       { label: 'Client',        icon: 'Building2',      color: '#6366F1', category: 'Data',     description: 'Agency Hub client',    hasInput: false, hasOutput: true  },
  brief:        { label: 'Brief',         icon: 'FileText',       color: '#10B981', category: 'Input',    description: 'Creative brief / idea', hasInput: true,  hasOutput: true  },
  blueprint:    { label: 'Blueprint',     icon: 'Map',            color: '#F59E0B', category: 'Process',  description: 'AI design blueprint',   hasInput: true,  hasOutput: true  },
  illustrator:  { label: 'Illustrator',   icon: 'Layers',         color: '#FF9A00', category: 'Platform', description: 'Instagram Poster (.jsx)',hasInput: true,  hasOutput: true  },
  indesign:     { label: 'InDesign',      icon: 'LayoutTemplate', color: '#FF3366', category: 'Platform', description: 'Promo Flyer (.jsx)',    hasInput: true,  hasOutput: true  },
  after_effects:{ label: 'After Effects', icon: 'Film',           color: '#9B59FF', category: 'Platform', description: 'Instagram Reel (.jsx)', hasInput: true,  hasOutput: true  },
  blender:      { label: 'Blender',       icon: 'Box',            color: '#00C2FF', category: 'Platform', description: '3D Cinematic (.py)',    hasInput: true,  hasOutput: true  },
  export:       { label: 'Export',        icon: 'Download',       color: '#14B8A6', category: 'Output',   description: 'Download all outputs',  hasInput: true,  hasOutput: false },
};

const PLATFORM_TYPES: WFNodeType[] = ['illustrator', 'indesign', 'after_effects', 'blender'];

function platformForType(t: WFNodeType): Platform {
  if (t === 'indesign') return 'indesign';
  if (t === 'after_effects') return 'after_effects';
  if (t === 'blender') return 'blender';
  return 'illustrator';
}

// ─── Canvas constants ─────────────────────────────────────────────────────────

const NODE_W  = 240;
const PORT_R  = 5;
const PORT_Y  = 42;   // y-center of port from node top

// ─── Example ideas (shown as placeholders in the idea bar) ───────────────────

const EXAMPLE_IDEAS = [
  'Promote Biryani restaurant for Instagram this week',
  'Launch a luxury sneaker collection — bold & minimal',
  'Promote a summer music festival — energetic vibes',
  'Market a new tech SaaS product to enterprise clients',
  'Seasonal menu reveal for a fine dining restaurant',
];

// ─── Fixed-ID idea graph builder ─────────────────────────────────────────────

const IDEA_NODE_IDS = {
  brief:        'wf-brief',
  blueprint:    'wf-blueprint',
  illustrator:  'wf-illustrator',
  indesign:     'wf-indesign',
  after_effects:'wf-after_effects',
  blender:      'wf-blender',
} as const;

function buildIdeaGraph(idea: string): { nodes: WFNode[]; edges: WFEdge[] } {
  const PLATFORM_LIST: Platform[] = ['illustrator', 'indesign', 'after_effects', 'blender'];
  const nodes: WFNode[] = [
    {
      id: IDEA_NODE_IDS.brief,
      type: 'brief',
      position: { x: 60, y: 200 },
      data: { brief: idea },
      status: 'idle',
    },
    {
      id: IDEA_NODE_IDS.blueprint,
      type: 'blueprint',
      position: { x: 370, y: 200 },
      data: {},
      status: 'idle',
    },
    ...PLATFORM_LIST.map((p, i) => ({
      id: `wf-${p}`,
      type: p as WFNodeType,
      position: { x: 680, y: 60 + i * 190 },
      data: {},
      status: 'idle' as const,
    })),
  ];
  const edges: WFEdge[] = [
    { id: 'we-brief-bp',   sourceId: IDEA_NODE_IDS.brief,     targetId: IDEA_NODE_IDS.blueprint },
    ...PLATFORM_LIST.map(p => ({
      id: `we-bp-${p}`,
      sourceId: IDEA_NODE_IDS.blueprint,
      targetId: `wf-${p}`,
    })),
  ];
  return { nodes, edges };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function outPort(n: WFNode) { return { x: n.position.x + NODE_W, y: n.position.y + PORT_Y }; }
function inPort(n: WFNode)  { return { x: n.position.x,          y: n.position.y + PORT_Y }; }

function bezier(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = Math.max(Math.abs(to.x - from.x) * 0.55, 60);
  return `M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;
}

// ─── WorkflowBuilder component ────────────────────────────────────────────────

export function WorkflowBuilder({ clients }: { clients: Client[] }) {
  const [nodes,      setNodes]      = useState<WFNode[]>(() => buildIdeaGraph(EXAMPLE_IDEAS[0]!).nodes);
  const [edges,      setEdges]      = useState<WFEdge[]>(() => buildIdeaGraph(EXAMPLE_IDEAS[0]!).edges);
  const [pan,        setPan]        = useState({ x: 60, y: 40 });
  const [selected,   setSelected]   = useState<string | null>(null);
  const [leftTab,    setLeftTab]    = useState<'nodes' | 'data'>('nodes');
  const [rightTab,   setRightTab]   = useState<'properties' | 'output'>('properties');
  const [isRunning,  setIsRunning]  = useState(false);
  const [progress,   setProgress]   = useState<string>('');
  const [ideaInput,  setIdeaInput]  = useState(EXAMPLE_IDEAS[0]!);
  const [pendingConn,setPendingConn]= useState<{ sourceId: string; wx: number; wy: number } | null>(null);

  // ── Stale-closure–free refs ──────────────────────────────────────────────
  const nodesR = useRef(nodes);   nodesR.current = nodes;
  const edgesR = useRef(edges);   edgesR.current = edges;
  const panR   = useRef(pan);     panR.current   = pan;

  const canvasRef      = useRef<HTMLDivElement>(null);
  const dragRef        = useRef<{ nodeId: string; grabX: number; grabY: number } | null>(null);
  const panDragRef     = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const connectingRef  = useRef<string | null>(null);

  // ── Coordinate helper ────────────────────────────────────────────────────

  const screenToWorld = useCallback((cx: number, cy: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: cx - rect.left - panR.current.x, y: cy - rect.top - panR.current.y };
  }, []);

  // ── Global mouse events ──────────────────────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const w = screenToWorld(e.clientX, e.clientY);
        const { nodeId, grabX, grabY } = dragRef.current;
        setNodes(prev => prev.map(n =>
          n.id === nodeId ? { ...n, position: { x: w.x - grabX, y: w.y - grabY } } : n
        ));
      }
      if (panDragRef.current) {
        const { sx, sy, px, py } = panDragRef.current;
        setPan({ x: px + e.clientX - sx, y: py + e.clientY - sy });
      }
      if (connectingRef.current) {
        const w = screenToWorld(e.clientX, e.clientY);
        setPendingConn({ sourceId: connectingRef.current, wx: w.x, wy: w.y });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      panDragRef.current = null;
      if (connectingRef.current) { connectingRef.current = null; setPendingConn(null); }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [screenToWorld]);

  // ── Keyboard: Delete selected ────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        deleteNode(selected);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // ── Interaction handlers ─────────────────────────────────────────────────

  const startDragNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodesR.current.find(n => n.id === nodeId)!;
    const w = screenToWorld(e.clientX, e.clientY);
    dragRef.current = { nodeId, grabX: w.x - node.position.x, grabY: w.y - node.position.y };
    setSelected(nodeId);
  };

  const startPan = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    panDragRef.current = { sx: e.clientX, sy: e.clientY, px: panR.current.x, py: panR.current.y };
  };

  const startConnection = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    connectingRef.current = sourceId;
    const w = screenToWorld(e.clientX, e.clientY);
    setPendingConn({ sourceId, wx: w.x, wy: w.y });
  };

  const completeConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!connectingRef.current || connectingRef.current === targetId) return;
    const srcId = connectingRef.current;
    if (!edgesR.current.some(ed => ed.sourceId === srcId && ed.targetId === targetId)) {
      setEdges(prev => [...prev, { id: `e${Date.now()}`, sourceId: srcId, targetId }]);
    }
    connectingRef.current = null;
    setPendingConn(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId));
    setSelected(null);
  };

  const addNode = (type: WFNodeType) => {
    const id = `n${Date.now()}`;
    const cx = canvasRef.current?.clientWidth ?? 800;
    const cy = canvasRef.current?.clientHeight ?? 500;
    setNodes(prev => [...prev, {
      id, type,
      position: {
        x: cx / 2 - panR.current.x - NODE_W / 2 + Math.random() * 60 - 30,
        y: cy / 2 - panR.current.y - 60 + Math.random() * 60 - 30,
      },
      data: {}, status: 'idle',
    }]);
    setSelected(id);
  };

  const addClientNode = (client: Client) => {
    const id = `n${Date.now()}`;
    const existing = nodesR.current.filter(n => n.type === 'client').length;
    setNodes(prev => [...prev, {
      id, type: 'client',
      position: { x: 60, y: existing * 170 + 60 },
      data: { clientId: client.id, clientName: client.name, clientColor: client.brandColor, clientLogoUrl: client.logoUrl },
      status: 'idle',
    }]);
  };

  const updateNodeData = (nodeId: string, patch: Partial<WFNode['data']>) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
  };

  // ── Mark node state helper ───────────────────────────────────────────────

  const mark = (id: string, status: WFNode['status'], data?: Partial<WFNode['data']>) => {
    setNodes(prev => prev.map(n =>
      n.id === id ? { ...n, status, ...(data ? { data: { ...n.data, ...data } } : {}) } : n
    ));
  };

  // ── Cascade execution from an idea string ────────────────────────────────
  // This is the core "neural" propagation:
  // Brief (instant) → Blueprint (AI) → [Illustrator, InDesign, AE, Blender] (parallel AI)

  const runFromIdea = useCallback(async (idea: string) => {
    if (!idea.trim() || isRunning) return;
    setIsRunning(true);

    // 1. Build + set the graph
    const { nodes: newNodes, edges: newEdges } = buildIdeaGraph(idea);
    setNodes(newNodes);
    setEdges(newEdges);
    setPan({ x: 60, y: 40 });
    setSelected(null);

    // 2. Wait a tick so React flushes the new node list
    await new Promise(r => setTimeout(r, 80));

    // ── Brief fires immediately ─────────────────────────────────────────
    mark(IDEA_NODE_IDS.brief, 'success');
    setProgress('Brief received');

    // ── Blueprint generation ────────────────────────────────────────────
    mark(IDEA_NODE_IDS.blueprint, 'running');
    setProgress('Generating design blueprint…');
    let baseBp: Blueprint;
    try {
      baseBp = await generateBlueprint(idea, 'illustrator');
      mark(IDEA_NODE_IDS.blueprint, 'success', { blueprintData: baseBp });
      setProgress('Blueprint ready — synthesising platform scripts…');
    } catch {
      mark(IDEA_NODE_IDS.blueprint, 'error');
      setProgress('Blueprint generation failed');
      setIsRunning(false);
      return;
    }

    // ── Platform nodes in parallel ──────────────────────────────────────
    const platforms: Platform[] = ['illustrator', 'indesign', 'after_effects', 'blender'];

    // Mark all as running first (visual feedback)
    platforms.forEach(p => mark(`wf-${p}`, 'running'));

    await Promise.all(
      platforms.map(async (platform) => {
        const nodeId = `wf-${platform}`;
        const d = PLATFORM_DELIVERABLE[platform];

        try {
          // Each platform gets its own augmented brief + platform-correct blueprint
          const augBrief = `${idea}\n\nDeliverable: ${d.briefAugment}`;
          const platformBp = await generateBlueprint(augBrief, platform);
          const out = await generateProductionScript(platformBp);
          mark(nodeId, 'success', {
            script:       out.script,
            svgPreview:   out.svgPreview,
            blueprintData: platformBp,
          });
        } catch {
          mark(nodeId, 'error');
        }
      })
    );

    setProgress('All platform scripts generated ✓');
    setIsRunning(false);
  }, [isRunning]);

  // ── Manual single-node execution ────────────────────────────────────────

  const executeNode = useCallback(async (nodeId: string) => {
    const node = nodesR.current.find(n => n.id === nodeId);
    if (!node || !PLATFORM_TYPES.includes(node.type) && node.type !== 'blueprint') return;

    // Trace brief from graph
    const traceBrief = (startId: string): string => {
      const visited = new Set<string>();
      const queue = [startId];
      while (queue.length) {
        const cur = queue.shift()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        const n = nodesR.current.find(x => x.id === cur);
        if (!n) continue;
        if (n.type === 'brief' && n.data.brief) return n.data.brief;
        edgesR.current.filter(e => e.targetId === cur).forEach(e => queue.push(e.sourceId));
      }
      return '';
    };

    const traceBp = (startId: string): Blueprint | null => {
      const visited = new Set<string>();
      const queue = [startId];
      while (queue.length) {
        const cur = queue.shift()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        const n = nodesR.current.find(x => x.id === cur);
        if (!n) continue;
        if (n.type === 'blueprint' && n.data.blueprintData) return n.data.blueprintData;
        edgesR.current.filter(e => e.targetId === cur).forEach(e => queue.push(e.sourceId));
      }
      return null;
    };

    mark(nodeId, 'running');

    if (node.type === 'blueprint') {
      const brief = traceBrief(nodeId) || 'Professional design brief';
      try {
        const bp = await generateBlueprint(brief, 'illustrator');
        mark(nodeId, 'success', { blueprintData: bp });
      } catch { mark(nodeId, 'error'); }
      return;
    }

    const platform = platformForType(node.type);
    const d = PLATFORM_DELIVERABLE[platform];

    try {
      let bp = traceBp(nodeId);
      const briefText = traceBrief(nodeId) || 'Professional design brief';
      if (!bp) {
        bp = await generateBlueprint(`${briefText}\n\nDeliverable: ${d.briefAugment}`, platform);
      }
      const out = await generateProductionScript({ ...bp, platform });
      mark(nodeId, 'success', { script: out.script, svgPreview: out.svgPreview, blueprintData: { ...bp, platform } });
    } catch { mark(nodeId, 'error'); }
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────

  const selectedNode = nodes.find(n => n.id === selected) ?? null;
  const selectedCfg  = selectedNode ? NODE_CFG[selectedNode.type] : null;

  const runningCount  = nodes.filter(n => n.status === 'running').length;
  const successCount  = nodes.filter(n => n.status === 'success').length;
  const platformsDone = PLATFORM_TYPES.filter(t => nodes.find(n => n.id === `wf-${t}`)?.status === 'success').length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex overflow-hidden bg-[#07090F]">

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#07090F]">
        <div className="flex border-b border-white/[0.06]">
          {(['nodes', 'data'] as const).map(tab => (
            <button key={tab} onClick={() => setLeftTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                leftTab === tab ? 'text-white border-b-2 border-indigo-500' : 'text-white/25 hover:text-white/55'}`}>
              {tab === 'nodes' ? 'Nodes' : 'Data List'}
            </button>
          ))}
        </div>

        {leftTab === 'nodes' ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {(['Data','Input','Process','Platform','Output'] as const).map(cat => {
              const items = Object.entries(NODE_CFG).filter(([,c]) => c.category === cat);
              return (
                <div key={cat}>
                  <p className="text-[9px] uppercase tracking-widest text-white/18 font-bold px-2 mb-1">{cat}</p>
                  {items.map(([type, cfg]) => (
                    <button key={type} onClick={() => addNode(type as WFNodeType)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] text-left group mb-0.5 transition-colors">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '25' }}>
                        <Icon name={cfg.icon} size={12} style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white/60 group-hover:text-white/90 leading-none">{cfg.label}</p>
                        <p className="text-[9px] text-white/20 mt-0.5 truncate">{cfg.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-[9px] uppercase tracking-widest text-white/18 font-bold px-2 mb-2">Clients</p>
            {clients.map(client => (
              <button key={client.id} onClick={() => addClientNode(client)} title="Add as Client node"
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] text-left group mb-1 transition-colors">
                <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${client.brandColor}40` }}>
                  <img src={client.logoUrl} alt="" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/65 group-hover:text-white/90 truncate">{client.name}</p>
                  <p className="text-[9px] text-white/25">{client.industry}</p>
                </div>
                <Icon name="Plus" size={10} className="text-white/15 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div className="px-3 py-2 border-t border-white/[0.04]">
          <p className="text-[9px] text-white/14 leading-relaxed">
            Drag output port (●) to input port (○) to wire nodes. Press Delete to remove selection.
          </p>
        </div>
      </div>

      {/* ── Canvas column ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Idea Command Bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-[#07090F] flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Icon name="Lightbulb" size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Idea</span>
          </div>

          <div className="flex-1 relative">
            <input
              value={ideaInput}
              onChange={e => setIdeaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void runFromIdea(ideaInput); }}
              placeholder={EXAMPLE_IDEAS[1]}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-amber-400/40 transition-colors pr-10"
            />
            {ideaInput && (
              <button onClick={() => setIdeaInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                <Icon name="X" size={12} />
              </button>
            )}
          </div>

          <motion.button
            onClick={() => void runFromIdea(ideaInput)}
            disabled={!ideaInput.trim() || isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider transition-all flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            {isRunning
              ? <><Icon name="Loader2" size={13} className="animate-spin" />Running</>
              : <><Icon name="Zap" size={13} />Generate All</>
            }
          </motion.button>

          <div className="w-px h-6 bg-white/[0.08]" />

          {/* Toolbar actions */}
          {selected && (
            <button onClick={() => deleteNode(selected)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/80 text-[11px] hover:bg-red-500/20 transition-all">
              <Icon name="Trash2" size={11} />
              Delete
            </button>
          )}

          <button
            onClick={() => { const g = buildIdeaGraph(ideaInput || EXAMPLE_IDEAS[0]!); setNodes(g.nodes); setEdges(g.edges); setPan({ x: 60, y: 40 }); setSelected(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/35 text-[11px] hover:text-white/70 transition-all flex-shrink-0">
            <Icon name="RotateCcw" size={11} />
            Reset
          </button>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {(isRunning || progress) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 px-4 py-1.5 bg-amber-500/[0.07] border-b border-amber-500/20 flex-shrink-0"
            >
              {isRunning && <Icon name="Loader2" size={12} className="text-amber-400 animate-spin flex-shrink-0" />}
              {!isRunning && successCount > 0 && <Icon name="CheckCircle2" size={12} className="text-emerald-400 flex-shrink-0" />}
              <span className="text-[11px] text-amber-300/80 flex-1">{progress}</span>
              {isRunning && (
                <span className="text-[10px] text-amber-400/60">
                  {runningCount} running · {successCount} done
                </span>
              )}
              {!isRunning && platformsDone === 4 && (
                <span className="text-[10px] text-emerald-400/80 font-semibold">
                  {platformsDone}/4 scripts ready
                </span>
              )}
              {!isRunning && (
                <button onClick={() => setProgress('')} className="text-white/20 hover:text-white/50 transition-colors">
                  <Icon name="X" size={11} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Canvas ────────────────────────────────────────────────────── */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden select-none"
          style={{ cursor: panDragRef.current ? 'grabbing' : 'default', background: '#07090F' }}
          onMouseDown={startPan}
          onClick={() => setSelected(null)}
        >
          {/* Dot grid */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            <defs>
              <pattern id="wf-dots" x={pan.x % 30} y={pan.y % 30} width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.9" fill="rgba(255,255,255,0.065)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wf-dots)" />
          </svg>

          {/* World (panned) */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${pan.x}px,${pan.y}px)` }}>

            {/* SVG edges */}
            <svg className="absolute overflow-visible pointer-events-none"
              style={{ left: 0, top: 0, width: 0, height: 0, overflow: 'visible' }}>

              {edges.map(edge => {
                const src = nodes.find(n => n.id === edge.sourceId);
                const tgt = nodes.find(n => n.id === edge.targetId);
                if (!src || !tgt) return null;
                const from = outPort(src);
                const to   = inPort(tgt);
                const cfg  = NODE_CFG[src.type];
                const flowing  = tgt.status === 'running';
                const done     = tgt.status === 'success';
                const edgeColor = done ? cfg.color : flowing ? cfg.color : 'rgba(255,255,255,0.1)';
                return (
                  <g key={edge.id}>
                    {/* Fat invisible hitbox for deletion */}
                    <path d={bezier(from, to)} fill="none" stroke="transparent" strokeWidth={14}
                      style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                      onClick={e => { e.stopPropagation(); setEdges(p => p.filter(ed => ed.id !== edge.id)); }} />
                    {/* Animated dash while running */}
                    {flowing && (
                      <path d={bezier(from, to)} fill="none" stroke={cfg.color}
                        strokeWidth={2} strokeDasharray="6 4" opacity={0.35}
                        style={{ animation: 'dash 0.6s linear infinite' }} />
                    )}
                    {/* Main edge */}
                    <path d={bezier(from, to)} fill="none"
                      stroke={edgeColor}
                      strokeWidth={done ? 2 : flowing ? 2 : 1.5}
                      strokeDasharray={flowing ? '6 4' : undefined}
                      style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
                    {/* Arrowhead dot */}
                    {(done || flowing) && (
                      <circle cx={to.x} cy={to.y} r={3.5} fill={cfg.color} opacity={done ? 0.9 : 0.5} />
                    )}
                  </g>
                );
              })}

              {/* Pending connection preview */}
              {pendingConn && (() => {
                const src = nodes.find(n => n.id === pendingConn.sourceId);
                if (!src) return null;
                return (
                  <path d={bezier(outPort(src), { x: pendingConn.wx, y: pendingConn.wy })}
                    fill="none" stroke={NODE_CFG[src.type].color}
                    strokeWidth={2} strokeDasharray="5 3" opacity={0.5} />
                );
              })()}
            </svg>

            {/* Node cards */}
            {nodes.map(node => {
              const cfg    = NODE_CFG[node.type];
              const isSel  = selected === node.id;
              const client = node.data.clientId ? clients.find(c => c.id === node.data.clientId) : null;
              const pd     = PLATFORM_TYPES.includes(node.type) ? PLATFORM_DELIVERABLE[platformForType(node.type)] : null;

              return (
                <div key={node.id} data-node="true"
                  style={{ position: 'absolute', left: node.position.x, top: node.position.y, width: NODE_W, zIndex: isSel ? 20 : 5, pointerEvents: 'all' }}
                  onClick={e => { e.stopPropagation(); setSelected(node.id); setRightTab('properties'); }}>

                  {/* ── Card shell ── */}
                  <div className="rounded-2xl overflow-hidden" style={{
                    background: '#0C0E18',
                    border: `1px solid ${isSel ? cfg.color + 'AA' : 'rgba(255,255,255,0.09)'}`,
                    boxShadow: isSel
                      ? `0 0 0 1px ${cfg.color}30, 0 10px 32px rgba(0,0,0,0.6)`
                      : node.status === 'success' ? `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.color}25` : '0 4px 16px rgba(0,0,0,0.4)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}>
                    {/* Top bar */}
                    <div style={{ height: 3, background: node.status === 'success' ? cfg.color : node.status === 'running' ? cfg.color : 'rgba(255,255,255,0.06)' }} />

                    {/* ── Header (drag handle) ── */}
                    <div className="flex items-center gap-2 px-3 py-2.5 cursor-move"
                      style={{ background: cfg.color + (node.status === 'success' ? '18' : '0C') }}
                      onMouseDown={e => startDragNode(e, node.id)}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '28' }}>
                        <Icon name={cfg.icon} size={13} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white/90 leading-none">{cfg.label}</p>
                        {pd && <p className="text-[10px] mt-0.5 font-semibold" style={{ color: cfg.color + 'CC' }}>{pd.label}</p>}
                      </div>
                      {/* Status */}
                      {node.status === 'running' && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-white/35">running</span>
                          <Icon name="Loader2" size={11} className="animate-spin text-white/30" />
                        </div>
                      )}
                      {node.status === 'success' && (
                        <div className="flex items-center gap-1 flex-shrink-0 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                          <Icon name="Check" size={9} className="text-emerald-400" />
                          <span className="text-[9px] text-emerald-400 font-bold">done</span>
                        </div>
                      )}
                      {node.status === 'error' && (
                        <div className="flex items-center gap-1 flex-shrink-0 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                          <Icon name="AlertCircle" size={9} className="text-red-400" />
                          <span className="text-[9px] text-red-400 font-bold">error</span>
                        </div>
                      )}
                    </div>

                    {/* ── Body ── */}
                    <div className="px-3 py-2.5 text-[11px]">
                      {node.type === 'client' && (
                        <div className="flex items-center gap-2">
                          {(client ?? node.data.clientLogoUrl) && (
                            <img src={client?.logoUrl ?? node.data.clientLogoUrl} className="w-5 h-5 rounded-md flex-shrink-0" alt="" />
                          )}
                          <span className="text-white/65 font-semibold truncate">{node.data.clientName ?? 'No client selected'}</span>
                        </div>
                      )}

                      {node.type === 'brief' && (
                        <p className="text-white/45 line-clamp-2 leading-relaxed italic">
                          {node.data.brief ?? <span className="text-white/20">Edit in properties →</span>}
                        </p>
                      )}

                      {node.type === 'blueprint' && (
                        node.data.blueprintData
                          ? <><p className="text-white/70 font-semibold text-xs truncate">{node.data.blueprintData.title}</p>
                              <p className="text-[10px] text-white/35 mt-0.5">{node.data.blueprintData.artboards.length} artboards · {node.data.blueprintData.colorPalette.length} colours</p></>
                          : <span className="text-white/20 italic">Awaiting brief…</span>
                      )}

                      {PLATFORM_TYPES.includes(node.type) && (
                        node.status === 'success'
                          ? <><p className="text-emerald-400 font-semibold text-xs">Script ready</p>
                              <p className="text-[10px] text-white/30 mt-0.5">
                                {PLATFORMS.find(p => p.id === node.type)?.ext} · click to view
                              </p></>
                          : node.status === 'running'
                          ? <span style={{ color: cfg.color }} className="font-medium">Synthesising {pd?.label}…</span>
                          : <span className="text-white/20 italic">{pd?.label} · awaiting blueprint</span>
                      )}
                    </div>

                    {/* ── SVG Thumbnail (when done) ── */}
                    {node.status === 'success' && node.data.svgPreview && (
                      <div className="mx-3 mb-2 rounded-lg overflow-hidden border border-white/[0.06] cursor-pointer"
                        onClick={e => { e.stopPropagation(); setSelected(node.id); setRightTab('output'); }}
                        title="Click to view full output">
                        <div
                          className="w-full pointer-events-none"
                          style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                          dangerouslySetInnerHTML={{ __html: node.data.svgPreview.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, '') }}
                        />
                      </div>
                    )}

                    {/* ── Run node button ── */}
                    {(PLATFORM_TYPES.includes(node.type) || node.type === 'blueprint') && (
                      <div className="px-3 pb-3">
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); void executeNode(node.id); }}
                          disabled={node.status === 'running'}
                          className="w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                          style={{ color: cfg.color, background: cfg.color + '18', border: `1px solid ${cfg.color}28` }}>
                          {node.status === 'running' ? '● Generating…' : node.status === 'success' ? '↻ Re-generate' : '▶ Run Node'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input port */}
                  {cfg.hasInput && (
                    <div title="Input port — drop connection here"
                      style={{ position: 'absolute', left: -PORT_R-1, top: PORT_Y-PORT_R, width: PORT_R*2, height: PORT_R*2,
                        borderRadius: '50%', background: '#0C0E18', border: '2px solid rgba(255,255,255,0.28)',
                        cursor: 'crosshair', zIndex: 30 }}
                      onMouseUp={e => completeConnection(e, node.id)} />
                  )}

                  {/* Output port */}
                  {cfg.hasOutput && (
                    <div title="Output port — drag to connect"
                      style={{ position: 'absolute', right: -PORT_R-1, top: PORT_Y-PORT_R, width: PORT_R*2, height: PORT_R*2,
                        borderRadius: '50%', background: cfg.color, border: `2px solid ${cfg.color}`,
                        cursor: 'crosshair', zIndex: 30, boxShadow: `0 0 8px ${cfg.color}60` }}
                      onMouseDown={e => startConnection(e, node.id)} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty canvas hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/12 pointer-events-none">
              <Icon name="GitBranch" size={44} className="mb-3" />
              <p className="text-sm font-semibold">Neural Workflow Canvas</p>
              <p className="text-xs mt-1">Type an idea above and click Generate All</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNode && selectedCfg && (
          <motion.div
            key={selectedNode.id}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            className="flex-shrink-0 border-l border-white/[0.06] flex flex-col bg-[#07090F] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: selectedCfg.color + '28' }}>
                  <Icon name={selectedCfg.icon} size={13} style={{ color: selectedCfg.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/85">{selectedCfg.label}</p>
                  {PLATFORM_TYPES.includes(selectedNode.type) && (
                    <p className="text-[9px]" style={{ color: selectedCfg.color + 'AA' }}>
                      {PLATFORM_DELIVERABLE[platformForType(selectedNode.type)].label}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/20 hover:text-white/60 transition-colors">
                <Icon name="X" size={14} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-white/[0.06] flex-shrink-0">
              {(['properties','output'] as const).map(t => (
                <button key={t} onClick={() => setRightTab(t)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    rightTab === t ? 'text-white border-b-2 border-indigo-500' : 'text-white/20 hover:text-white/50'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {rightTab === 'properties' && (
                <>
                  {/* Status */}
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                      selectedNode.status === 'success' ? 'text-emerald-400 bg-emerald-400/10' :
                      selectedNode.status === 'running' ? 'text-amber-400 bg-amber-400/10' :
                      selectedNode.status === 'error'   ? 'text-red-400 bg-red-400/10' :
                      'text-white/30 bg-white/[0.06]'}`}>
                      {selectedNode.status === 'running' && <Icon name="Loader2" size={10} className="animate-spin" />}
                      {selectedNode.status === 'success' && <Icon name="CheckCircle2" size={10} />}
                      {selectedNode.status}
                    </span>
                  </div>

                  {/* Brief editor */}
                  {selectedNode.type === 'brief' && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Brief / Idea</p>
                      <textarea
                        value={selectedNode.data.brief ?? ''}
                        onChange={e => { updateNodeData(selectedNode.id, { brief: e.target.value }); setIdeaInput(e.target.value); }}
                        rows={7}
                        placeholder="e.g. Promote Biryani for Instagram this week…"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/18 outline-none focus:border-emerald-500/50 resize-none leading-relaxed transition-colors"
                      />
                    </div>
                  )}

                  {/* Client selector */}
                  {selectedNode.type === 'client' && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Client</p>
                      <select
                        value={selectedNode.data.clientId ?? ''}
                        onChange={e => {
                          const c = clients.find(x => x.id === e.target.value);
                          updateNodeData(selectedNode.id, { clientId: e.target.value, clientName: c?.name, clientColor: c?.brandColor, clientLogoUrl: c?.logoUrl });
                        }}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white outline-none">
                        <option value="">Select client…</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Blueprint summary */}
                  {selectedNode.type === 'blueprint' && selectedNode.data.blueprintData && (
                    <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2">
                      <p className="text-xs font-bold text-white">{selectedNode.data.blueprintData.title}</p>
                      <p className="text-[11px] text-white/50 leading-relaxed">{selectedNode.data.blueprintData.strategy}</p>
                      <div className="flex gap-1">
                        {selectedNode.data.blueprintData.colorPalette.map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded" style={{ background: c }} title={c} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform deliverable info */}
                  {PLATFORM_TYPES.includes(selectedNode.type) && (() => {
                    const p = PLATFORMS.find(pl => pl.id === selectedNode.type)!;
                    const dd = PLATFORM_DELIVERABLE[platformForType(selectedNode.type)];
                    return (
                      <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: p.bgColor }}>
                            <Icon name={p.icon} size={14} style={{ color: p.color }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{p.name}</p>
                            <p className="text-[10px]" style={{ color: p.color }}>{dd.label}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed">{dd.briefAugment.substring(0, 120)}…</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/25">
                          <span>{dd.artboard.w}×{dd.artboard.h}px</span>
                          <span>·</span>
                          <span>.{p.ext}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Run button */}
                  {(PLATFORM_TYPES.includes(selectedNode.type) || selectedNode.type === 'blueprint') && (
                    <button
                      onClick={() => void executeNode(selectedNode.id)}
                      disabled={selectedNode.status === 'running'}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                      style={{ background: selectedCfg.color + '20', color: selectedCfg.color, border: `1px solid ${selectedCfg.color}30` }}>
                      {selectedNode.status === 'running' ? '● Running…' : selectedNode.status === 'success' ? '↻ Re-run Node' : '▶ Run This Node'}
                    </button>
                  )}
                </>
              )}

              {rightTab === 'output' && (
                selectedNode.data.script ? (
                  <>
                    {/* SVG Preview */}
                    {selectedNode.data.svgPreview && (
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Preview</p>
                        <div className="rounded-xl overflow-hidden border border-white/[0.07]"
                          dangerouslySetInnerHTML={{ __html: selectedNode.data.svgPreview }} />
                      </div>
                    )}

                    {/* Script */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Script</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => navigator.clipboard.writeText(selectedNode.data.script ?? '')}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.05] text-[10px] text-white/40 hover:text-white/80 transition-colors">
                            <Icon name="Copy" size={10} /> Copy
                          </button>
                          <button onClick={() => {
                            const ext = PLATFORMS.find(p => p.id === selectedNode.type)?.ext ?? 'txt';
                            const blob = new Blob([selectedNode.data.script ?? ''], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `boldlayers-${selectedNode.type}.${ext}`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] text-indigo-400 hover:bg-indigo-500/35 transition-colors">
                            <Icon name="Download" size={10} /> Export
                          </button>
                        </div>
                      </div>
                      <pre className="bg-[#060810] border border-white/[0.06] rounded-xl p-3 text-[10px] text-emerald-300/70 overflow-auto max-h-60 leading-relaxed font-mono whitespace-pre-wrap">
                        {selectedNode.data.script.slice(0, 1000)}{selectedNode.data.script.length > 1000 ? '\n…' : ''}
                      </pre>
                    </div>

                    {/* Export all button */}
                    <button
                      onClick={() => {
                        const allPlatformNodes = nodes.filter(n => PLATFORM_TYPES.includes(n.type) && n.data.script);
                        allPlatformNodes.forEach(n => {
                          const ext = PLATFORMS.find(p => p.id === n.type)?.ext ?? 'txt';
                          const blob = new Blob([n.data.script ?? ''], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = `boldlayers-${n.type}.${ext}`; a.click();
                          URL.revokeObjectURL(url);
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold transition-all hover:bg-emerald-500/25">
                      <Icon name="PackageOpen" size={12} className="inline mr-1.5" />
                      Export All Platform Scripts
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-white/20">
                    <Icon name="FileCode2" size={32} className="mb-3" />
                    <p className="text-xs text-center">No output yet<br /><span className="text-[10px]">Run the node or click Generate All</span></p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dash animation keyframe */}
      <style>{`@keyframes dash { to { stroke-dashoffset: -20; } }`}</style>
    </div>
  );
}
