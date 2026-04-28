import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import { TEMPLATE_CATEGORIES, type PosterTemplate, type TemplateCategory } from '../../data/templates';
import { MagicLayerEditor } from './MagicLayerEditor';

export function TemplateGallery() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<PosterTemplate | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return TEMPLATE_CATEGORIES;
    const q = search.toLowerCase();
    return TEMPLATE_CATEGORIES.map(cat => ({
      ...cat,
      templates: cat.templates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q)) ||
        cat.label.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.templates.length > 0);
  }, [search]);

  const selectedCategory = activeCategory ? TEMPLATE_CATEGORIES.find(c => c.id === activeCategory) : null;

  const displayedTemplates = useMemo(() => {
    if (!selectedCategory) return [];
    if (!search.trim()) return selectedCategory.templates;
    const q = search.toLowerCase();
    return selectedCategory.templates.filter(t =>
      t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q))
    );
  }, [selectedCategory, search]);

  if (editingTemplate) {
    return (
      <AnimatePresence>
        <MagicLayerEditor
          key={editingTemplate.id}
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#07090F]/90 backdrop-blur border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            {activeCategory && selectedCategory ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-sm"
                >
                  <Icon name="ArrowLeft" size={14} />
                  Templates
                </button>
                <Icon name="ChevronRight" size={12} className="text-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: selectedCategory.color }} />
                  <span className="text-sm font-bold text-white">{selectedCategory.label}</span>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
                  Template Gallery
                </h1>
                <p className="text-xs text-white/30 mt-0.5">
                  {TEMPLATE_CATEGORIES.reduce((a, c) => a + c.templates.length, 0)} AI-generated posters across {TEMPLATE_CATEGORIES.length} brands
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 w-52">
              <Icon name="Search" size={13} className="text-white/30" />
              <input
                className="bg-transparent text-xs text-white placeholder-white/25 outline-none flex-1"
                placeholder="Search templates…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category overview — shown when no category selected */}
      {!activeCategory && (
        <div className="p-6">
          {/* Magic Layer callout */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Magic Layers — Canva-style editing for your posters</p>
              <p className="text-xs text-white/40 mt-0.5">
                Open any template → click <strong className="text-indigo-400">Activate Magic Layers</strong> → AI breaks the flat image into individually editable text, image, and overlay layers. No InDesign needed.
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-indigo-400 text-xs font-semibold">
              <Icon name="Sparkles" size={11} />
              AI-Powered
            </div>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 gap-4">
            {filteredCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onOpen={() => setActiveCategory(cat.id)}
                onEditFirst={() => setEditingTemplate(cat.templates[0])}
              />
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/20">
              <Icon name="SearchX" size={32} />
              <p className="text-sm">No templates match "{search}"</p>
            </div>
          )}
        </div>
      )}

      {/* Template grid — shown when category is selected */}
      {activeCategory && selectedCategory && (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {displayedTemplates.map(template => (
              <motion.div
                key={template.id}
                className="group relative rounded-xl overflow-hidden border border-white/[0.07] cursor-pointer"
                style={{ aspectRatio: '1122/1402' }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                onHoverStart={() => setHovered(template.id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => setEditingTemplate(template)}
              >
                <img
                  src={template.thumb}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <AnimatePresence>
                  {hovered === template.id && (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="text-center px-3">
                        <p className="text-sm font-bold text-white">{template.name}</p>
                        <div className="flex items-center gap-1 justify-center mt-1 flex-wrap">
                          {template.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-colors"
                        onClick={e => { e.stopPropagation(); setEditingTemplate(template); }}
                      >
                        <Icon name="Sparkles" size={12} />
                        Open with Magic Layers
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name badge */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] font-semibold text-white/80 truncate">{template.name}</p>
                </div>
              </motion.div>
            ))}

            {displayedTemplates.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-24 gap-3 text-white/20">
                <Icon name="SearchX" size={32} />
                <p className="text-sm">No templates match "{search}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, onOpen, onEditFirst }: { category: TemplateCategory; onOpen: () => void; onEditFirst: () => void }) {
  const previews = category.templates.slice(0, 4);

  return (
    <motion.div
      className="rounded-2xl border border-white/[0.07] overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.01 }}
      style={{ background: `linear-gradient(135deg, ${category.color}18 0%, transparent 60%)` }}
      onClick={onOpen}
    >
      {/* Preview grid */}
      <div className="grid grid-cols-2 gap-0.5 p-0.5 aspect-[2/1]">
        {previews.map(t => (
          <div key={t.id} className="overflow-hidden rounded-sm">
            <img
              src={t.thumb}
              alt={t.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: category.color + '30', border: `1px solid ${category.color}40` }}
          >
            <Icon name={category.icon} size={13} style={{ color: category.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{category.label}</p>
            <p className="text-[10px] text-white/30">{category.templates.length} templates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
            onClick={e => { e.stopPropagation(); onEditFirst(); }}
          >
            <Icon name="Sparkles" size={10} className="inline mr-1" />
            Quick Edit
          </button>
          <Icon name="ChevronRight" size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
