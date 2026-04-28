import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { PosterTemplate } from '../../data/templates';
import { analyzeTemplateForLayers, type MagicLayer, type MagicLayerResult } from '../../lib/gemini';

interface Props {
  template: PosterTemplate;
  onClose: () => void;
}

const CANVAS_W = 1122;
const CANVAS_H = 1402;

type ToolMode = 'select' | 'text' | 'image';

export function MagicLayerEditor({ template, onClose }: Props) {
  const [result, setResult] = useState<MagicLayerResult | null>(null);
  const [layers, setLayers] = useState<MagicLayer[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<ToolMode>('select');
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [exportProgress, setExportProgress] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);

  // Compute rendered canvas scale
  useEffect(() => {
    const update = () => {
      if (canvasRef.current) {
        scaleRef.current = canvasRef.current.offsetWidth / CANVAS_W;
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeTemplateForLayers(template.file, template.name);
      setResult(res);
      setLayers(res.layers);
      setAnalyzed(true);
    } finally {
      setAnalyzing(false);
    }
  }, [template]);

  const updateLayer = useCallback((id: string, patch: Partial<MagicLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const selectedLayer = layers.find(l => l.id === selectedId) ?? null;

  // Drag logic (world-space: percentages → canvas pixels → scaled to display)
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    const layer = layers.find(l => l.id === id);
    if (!layer || layer.locked) return;
    e.stopPropagation();
    setSelectedId(id);
    setDragging(id);
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = scaleRef.current;
    const layerPxX = (layer.zone.x / 100) * CANVAS_W * scale;
    const layerPxY = (layer.zone.y / 100) * CANVAS_H * scale;
    setDragOffset({ x: e.clientX - rect.left - layerPxX, y: e.clientY - rect.top - layerPxY });
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = scaleRef.current;
    const px = e.clientX - rect.left - dragOffset.x;
    const py = e.clientY - rect.top - dragOffset.y;
    const xPct = Math.max(0, Math.min(95, (px / (CANVAS_W * scale)) * 100));
    const yPct = Math.max(0, Math.min(95, (py / (CANVAS_H * scale)) * 100));
    setLayers(prev => prev.map(l => l.id === dragging ? { ...l, zone: { ...l.zone, x: xPct, y: yPct } } : l));
  }, [dragging, dragOffset]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  // Export as PNG via canvas
  const handleExport = async () => {
    setExportProgress(true);
    await new Promise(r => setTimeout(r, 400));
    // Draw on offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    // Draw base image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = template.file;
    });
    ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    // Draw text layers on top
    layers.filter(l => l.type === 'text' && l.content).forEach(l => {
      const x = (l.zone.x / 100) * CANVAS_W;
      const y = (l.zone.y / 100) * CANVAS_H;
      const w = (l.zone.w / 100) * CANVAS_W;
      const h = (l.zone.h / 100) * CANVAS_H;
      const fs = ((l.fontSize ?? 4) / 100) * CANVAS_H;
      ctx.font = `${l.fontWeight ?? '700'} ${fs}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = l.color ?? '#ffffff';
      ctx.textAlign = (l.textAlign as CanvasTextAlign) ?? 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(l.content!, x + (l.textAlign === 'center' ? w / 2 : 0), y + h / 2, w);
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}-edited.png`;
    a.click();
    setExportProgress(false);
  };

  // Image zone upload
  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateLayer(id, { content: url });
  };

  const LAYER_TYPE_COLOR: Record<string, string> = {
    background: '#6366F1',
    'image-zone': '#10B981',
    text: '#F59E0B',
    logo: '#8B5CF6',
    overlay: '#EF4444',
    shape: '#3B82F6',
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-[#07090F]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Top toolbar ── */}
      <div className="flex items-center gap-3 h-12 px-4 border-b border-white/[0.07] flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm">
          <Icon name="ArrowLeft" size={14} />
          Back
        </button>
        <div className="w-px h-4 bg-white/10" />
        <Icon name="Sparkles" size={14} className="text-indigo-400" />
        <span className="text-sm font-semibold text-white">{template.name}</span>
        <span className="text-xs text-white/30">Magic Layer Editor</span>

        <div className="flex-1" />

        {/* Tool mode */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
          {(['select', 'text', 'image'] as ToolMode[]).map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${tool === t ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              {t === 'select' ? '↖ Select' : t === 'text' ? 'T Text' : '⬜ Image'}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/10" />

        <button
          onClick={() => setLayerPanelOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg bg-white/[0.04]"
        >
          <Icon name="Layers" size={12} />
          Layers
        </button>

        <button
          onClick={handleExport}
          disabled={exportProgress}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {exportProgress ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Download" size={12} />}
          Export PNG
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Canvas area ── */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center bg-[#0a0c14] p-8 relative"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={() => { setSelectedId(null); setEditingId(null); }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* Poster canvas */}
          <div
            ref={canvasRef}
            className="relative shadow-2xl shadow-black/60 flex-shrink-0"
            style={{ width: 'min(560px, 90vw)', aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Base image */}
            <img
              src={template.file}
              alt={template.name}
              className="absolute inset-0 w-full h-full object-cover select-none"
              draggable={false}
            />

            {/* Analyzed layers */}
            {analyzed && layers.map(layer => {
              const isSelected = selectedId === layer.id;
              const isEditing = editingId === layer.id;

              if (layer.type === 'background') return null; // bg is the image itself

              const style: React.CSSProperties = {
                position: 'absolute',
                left: `${layer.zone.x}%`,
                top: `${layer.zone.y}%`,
                width: `${layer.zone.w}%`,
                height: `${layer.zone.h}%`,
                cursor: layer.locked ? 'default' : tool === 'select' ? (dragging === layer.id ? 'grabbing' : 'grab') : 'crosshair',
                boxSizing: 'border-box',
              };

              if (layer.type === 'overlay') {
                return (
                  <div
                    key={layer.id}
                    style={{ ...style, background: layer.color ?? 'rgba(0,0,0,0.3)' }}
                    className={`transition-all ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-0' : 'hover:ring-1 hover:ring-white/20'}`}
                    onMouseDown={e => onMouseDown(e, layer.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(layer.id); }}
                  />
                );
              }

              if (layer.type === 'image-zone') {
                return (
                  <div
                    key={layer.id}
                    style={style}
                    className={`flex flex-col items-center justify-center border-2 border-dashed transition-all group ${isSelected ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 hover:border-emerald-400/50 hover:bg-white/5'}`}
                    onMouseDown={e => onMouseDown(e, layer.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(layer.id); }}
                  >
                    {layer.content ? (
                      <img src={layer.content} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <label className="flex flex-col items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="ImagePlus" size={14} className="text-emerald-400" />
                        <span className="text-[9px] text-emerald-400 font-medium">Replace Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(layer.id, e)} />
                      </label>
                    )}
                    {isSelected && (
                      <label className="absolute bottom-1 right-1 bg-emerald-500 rounded px-1.5 py-0.5 text-[8px] text-white font-bold cursor-pointer">
                        SWAP
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(layer.id, e)} />
                      </label>
                    )}
                  </div>
                );
              }

              if (layer.type === 'text') {
                return (
                  <div
                    key={layer.id}
                    style={{
                      ...style,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: layer.textAlign === 'left' ? 'flex-start' : layer.textAlign === 'right' ? 'flex-end' : 'center',
                    }}
                    className={`transition-all ${isSelected ? 'ring-2 ring-amber-400 ring-offset-0 bg-amber-400/5' : 'hover:ring-1 hover:ring-white/20'}`}
                    onMouseDown={e => onMouseDown(e, layer.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(layer.id); }}
                    onDoubleClick={e => { e.stopPropagation(); setEditingId(layer.id); }}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        className="w-full bg-transparent outline-none text-center"
                        style={{
                          color: layer.color ?? '#fff',
                          fontSize: `${(layer.fontSize ?? 4) / 100 * (canvasRef.current?.offsetHeight ?? 400)}px`,
                          fontWeight: layer.fontWeight ?? '700',
                          textAlign: layer.textAlign ?? 'center',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                        value={layer.content ?? ''}
                        onChange={e => updateLayer(layer.id, { content: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        style={{
                          color: layer.color ?? '#fff',
                          fontSize: `${(layer.fontSize ?? 4) / 100 * (canvasRef.current?.offsetHeight ?? 400)}px`,
                          fontWeight: layer.fontWeight ?? '700',
                          textAlign: layer.textAlign ?? 'center',
                          fontFamily: "'Space Grotesk', sans-serif",
                          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      >
                        {layer.content}
                      </span>
                    )}
                    {isSelected && !isEditing && (
                      <div className="absolute -top-5 left-0 text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                        Double-click to edit
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={layer.id}
                  style={{ ...style, background: layer.color ?? 'rgba(99,102,241,0.1)' }}
                  className={`transition-all ${isSelected ? 'ring-2 ring-indigo-400' : 'hover:ring-1 hover:ring-white/20'}`}
                  onMouseDown={e => onMouseDown(e, layer.id)}
                  onClick={e => { e.stopPropagation(); setSelectedId(layer.id); }}
                />
              );
            })}

            {/* Magic Layer activate overlay — shown before analysis */}
            {!analyzed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div
                  className="flex flex-col items-center gap-4 px-6 py-8 rounded-2xl border border-white/10 bg-white/5"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {analyzing ? (
                    <>
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                        <div className="w-14 h-14 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <Icon name="Sparkles" size={20} className="absolute inset-0 m-auto text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">Analysing layers…</p>
                        <p className="text-xs text-white/40 mt-1">AI is reading the poster structure</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                        <Icon name="Sparkles" size={22} className="text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-white">Magic Layers</p>
                        <p className="text-xs text-white/40 mt-1 max-w-[180px]">AI breaks this poster into<br />individually editable layers</p>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-colors"
                      >
                        <Icon name="Sparkles" size={14} />
                        Activate Magic Layers
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <AnimatePresence>
          {layerPanelOpen && (
            <motion.div
              className="w-64 border-l border-white/[0.07] bg-[#0d0f1a] flex flex-col overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Panel header */}
              <div className="p-3 border-b border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Layers" size={13} className="text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Layers</span>
                  </div>
                  {result && (
                    <span className="text-[10px] text-white/30">{layers.length} layers</span>
                  )}
                </div>
                {result && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: result.primaryColor }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: result.accentColor }} />
                    <span className="text-[10px] text-white/40">{result.brand}</span>
                  </div>
                )}
              </div>

              {/* Layer list */}
              <div className="flex-1 overflow-y-auto">
                {!analyzed ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-white/20">
                    <Icon name="Layers" size={24} />
                    <p className="text-xs text-center px-4">Activate Magic Layers to see layer structure</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {[...layers].reverse().map(layer => (
                      <div
                        key={layer.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group ${selectedId === layer.id ? 'bg-white/10' : 'hover:bg-white/[0.04]'}`}
                        onClick={() => setSelectedId(layer.id === selectedId ? null : layer.id)}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: LAYER_TYPE_COLOR[layer.type] ?? '#fff' }}
                        />
                        <span className="text-[11px] text-white/70 flex-1 truncate">{layer.label}</span>
                        {layer.locked && <Icon name="Lock" size={10} className="text-white/20" />}
                        {layer.type === 'text' && layer.content && (
                          <span className="text-[9px] text-white/25 truncate max-w-[60px]">{layer.content}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Properties panel */}
              {selectedLayer && (
                <div className="border-t border-white/[0.07] p-3 space-y-3">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Properties</p>

                  {selectedLayer.type === 'text' && (
                    <>
                      <div>
                        <label className="text-[10px] text-white/30 mb-1 block">Content</label>
                        <input
                          className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500/50"
                          value={selectedLayer.content ?? ''}
                          onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-white/30 mb-1 block">Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                              value={selectedLayer.color ?? '#ffffff'}
                              onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })}
                            />
                            <span className="text-[10px] text-white/40">{selectedLayer.color ?? '#ffffff'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-white/30 mb-1 block">Size</label>
                          <input
                            type="range" min="1" max="12" step="0.5"
                            className="w-full"
                            value={selectedLayer.fontSize ?? 4}
                            onChange={e => updateLayer(selectedLayer.id, { fontSize: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/30 mb-1 block">Weight</label>
                        <select
                          className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white"
                          value={selectedLayer.fontWeight ?? '700'}
                          onChange={e => updateLayer(selectedLayer.id, { fontWeight: e.target.value })}
                        >
                          {['400','500','600','700','800','900'].map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {selectedLayer.type === 'overlay' && (
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block">Opacity</label>
                      <input
                        type="range" min="0" max="100" step="5"
                        className="w-full"
                        defaultValue={35}
                        onChange={e => updateLayer(selectedLayer.id, { color: `rgba(0,0,0,${parseInt(e.target.value)/100})` })}
                      />
                    </div>
                  )}

                  {/* Position */}
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block">Position</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['x','y','w','h'] as const).map(k => (
                        <div key={k} className="flex items-center gap-1 bg-white/[0.04] rounded px-1.5 py-1">
                          <span className="text-[9px] text-white/30 uppercase">{k}</span>
                          <input
                            className="flex-1 bg-transparent text-[10px] text-white outline-none w-0"
                            value={Math.round(selectedLayer.zone[k])}
                            type="number"
                            onChange={e => updateLayer(selectedLayer.id, { zone: { ...selectedLayer.zone, [k]: parseFloat(e.target.value) } })}
                          />
                          <span className="text-[9px] text-white/20">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
