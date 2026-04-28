import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { Client } from '../../types';

interface MarketingPlaybookProps {
  clients: Client[];
}

const SOP_SECTIONS = [
  {
    id: 'A',
    title: 'Brand Architecture',
    icon: 'Layers',
    color: '#6366F1',
    content: [
      { heading: 'Visual Identity System', body: 'Maintain brand consistency across all touchpoints. Primary color usage is restricted to focal and interactive elements. Secondary palette provides supporting context.' },
      { heading: 'Typography Hierarchy', body: 'Display: Space Grotesk 800 @ 72px. Heading: Space Grotesk 700 @ 48px. Subheading: Inter 600 @ 32px. Body: Inter 400 @ 18px. Caption: Inter 400 @ 14px.' },
      { heading: 'Logo Clearspace', body: 'Maintain minimum 60px clearspace on all sides of the primary logo mark. The wordmark must never be used on backgrounds below 4.5:1 contrast ratio.' },
    ],
  },
  {
    id: 'B',
    title: 'Content Strategy',
    icon: 'FileText',
    color: '#10B981',
    content: [
      { heading: 'Content Pillars', body: 'Allocate content production across three pillars: 40% Educational (thought leadership, tutorials), 35% Brand (campaigns, identity), 25% Community (UGC amplification, engagement).' },
      { heading: 'Publishing Cadence', body: 'LinkedIn: 3×/week. Instagram: 5×/week. Twitter/X: 7×/week. YouTube: 1×/month. Blog: 2×/month. All content requires sign-off 72hrs before publishing.' },
      { heading: 'Tone of Voice', body: 'Authoritative but approachable. Technical precision without jargon. First-person plural ("we build", "our approach"). Never use superlatives without data backing.' },
    ],
  },
  {
    id: 'C',
    title: 'Production Workflow',
    icon: 'GitBranch',
    color: '#F59E0B',
    content: [
      { heading: 'Brief Intake Process', body: 'All projects begin with a structured brief covering: objective, audience, deliverables, timeline, budget, and brand constraints. Verbal briefs are not accepted — all briefs must be documented.' },
      { heading: 'Review Gates', body: 'Internal review at 50% completion. Client review at 85% completion. Final approval required 48hrs before delivery. Rush delivery (< 24hrs) carries a 40% surcharge.' },
      { heading: 'Revision Policy', body: 'Two rounds of revisions included in all project scopes. Additional rounds billed at $150/hr. Scope changes after approval require a new project order.' },
    ],
  },
  {
    id: 'D',
    title: 'Adobe CC Protocols',
    icon: 'Layout',
    color: '#FF9A00',
    content: [
      { heading: 'File Naming Convention', body: '[ClientCode]_[ProjectID]_[Artboard]_v[Version].[ext]. Example: NXD_Q2CAMP_HERO_v03.ai. Never use spaces or special characters in file names.' },
      { heading: 'Document Setup Standards', body: 'Color mode: CMYK for print, RGB for digital. Resolution: 300 DPI print, 72 DPI web. Bleed: 3mm all sides for print. All fonts must be outlined in final delivery files.' },
      { heading: 'Asset Management', body: 'All linked assets must be embedded or packaged on delivery. Raw layered source files retained for 24 months. Compressed archives delivered to clients within 2 business days of approval.' },
    ],
  },
  {
    id: 'E',
    title: 'Motion & Video',
    icon: 'Film',
    color: '#9B59FF',
    content: [
      { heading: 'Animation Principles', body: 'All motion work adheres to: 12 fps minimum for character animation, 24 fps for product/UI animation, 60 fps for interactive motion. Easing curves: cubic-bezier(0.16, 1, 0.3, 1) for entrances.' },
      { heading: 'After Effects Standards', body: 'Project frame rate: 24fps or 30fps. Composition codec: ProRes 4444 for internal, H.264 for delivery. All comps must have a pre-render version for client review.' },
      { heading: 'Audio & Sound Design', body: 'Minimum -14 LUFS integrated loudness for social. Broadcast standard at -23 LUFS. All sound assets must be royalty-free or licensed. Source files delivered alongside final renders.' },
    ],
  },
  {
    id: 'F',
    title: '3D & Spatial Design',
    icon: 'Box',
    color: '#00C2FF',
    content: [
      { heading: 'Blender Project Setup', body: 'Unit system: Metric. Render engine: Cycles for final, EEVEE for previews. Polygon budget: <500k tris for hero assets, <50k for supporting. All materials must use PBR workflow.' },
      { heading: 'Lighting Standards', body: 'Three-point lighting as baseline. HDRi environment maps at minimum 4K resolution. Final renders at minimum 2K, client delivery in 4K. Denoise with OptiX for GPU renders.' },
      { heading: 'Export & Delivery', body: 'Rendered sequences as PNG 16-bit. Final compositing in After Effects. Source .blend files packaged with all textures and assets. Materials library shared via studio asset server.' },
    ],
  },
  {
    id: 'G',
    title: 'Client Communication',
    icon: 'MessageSquare',
    color: '#EC4899',
    content: [
      { heading: 'Response Time SLA', body: 'Email: 4 business hours. Slack: 2 business hours (during 9-6 local time). Urgent (flagged): 1 business hour. All client communications logged in project management system.' },
      { heading: 'Meeting Protocols', body: 'All meetings require agenda shared 24hrs prior. Meetings recorded with client consent. Action items distributed within 2 hours of call. No meetings Fridays after 3pm.' },
      { heading: 'Feedback Collection', body: 'Use structured feedback forms for all reviews. Vague feedback ("make it pop") is always clarified before actioning. All design decisions documented with rationale.' },
    ],
  },
  {
    id: 'H',
    title: 'Billing & Contracts',
    icon: 'Receipt',
    color: '#14B8A6',
    content: [
      { heading: 'Payment Terms', body: 'Retainer invoices issued on 1st of each month, due Net-15. Project work: 50% upfront, 50% on delivery. Rush projects: 100% upfront. Late payments accrue 1.5% monthly interest.' },
      { heading: 'Scope of Work', body: 'All project scopes documented before work begins. Scope changes require written approval and may affect timeline and budget. "Kill fees" apply at 25% of remaining value if client cancels mid-project.' },
      { heading: 'IP & Ownership', body: 'All work remains property of the studio until final payment is received. Upon full payment, client receives full IP ownership. Raw source files transferred separately per contract.' },
    ],
  },
  {
    id: 'I',
    title: 'Quality Assurance',
    icon: 'ShieldCheck',
    color: '#8B5CF6',
    content: [
      { heading: 'Pre-Delivery Checklist', body: 'Verify: all layers named, all fonts packaged, all links resolved, color profiles embedded, file naming convention met, version number correct, approval signature present.' },
      { heading: 'Accessibility Standards', body: 'Digital work must meet WCAG 2.1 AA minimum. Color contrast minimum 4.5:1. Interactive elements minimum 44×44px touch target. Alt text required for all images in digital deliverables.' },
      { heading: 'Brand Compliance Review', body: 'Internal brand compliance check on all deliverables before client review. Use brand review checklist v2.4. Non-compliant items flagged and corrected before submission.' },
    ],
  },
  {
    id: 'J',
    title: 'Analytics & Reporting',
    icon: 'BarChart3',
    color: '#F97316',
    content: [
      { heading: 'Monthly Performance Reports', body: 'All active clients receive monthly reports covering: campaign performance metrics, content engagement rates, production velocity, budget utilization, and upcoming pipeline.' },
      { heading: 'KPI Framework', body: 'Standard KPIs tracked: reach, engagement rate, conversion events, brand share of voice, production turnaround time, revision rate, client satisfaction score.' },
      { heading: 'Data Sources & Tools', body: 'Social analytics: native platform dashboards + Sprout Social. Web analytics: Google Analytics 4. Ad performance: Meta Business Suite, Google Ads. Internal: Bold Layers production reports.' },
    ],
  },
];

export function MarketingPlaybook({ clients }: MarketingPlaybookProps) {
  const [activeSection, setActiveSection] = useState('A');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const active = SOP_SECTIONS.find((s) => s.id === activeSection) ?? SOP_SECTIONS[0]!;

  const filteredSections = searchQuery
    ? SOP_SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.some((c) => c.heading.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SOP_SECTIONS;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left nav */}
      <div className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="p-4 border-b border-white/[0.06]">
          <h1 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">Marketing Playbook</h1>
          <p className="text-xs text-white/30 mt-1">Standard Operating Procedures</p>
        </div>

        {/* Client filter */}
        <div className="px-3 pt-3 pb-2">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/70 outline-none"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Icon name="Search" size={12} className="absolute left-2.5 top-2 text-white/25" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search procedures..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/20 outline-none"
            />
          </div>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filteredSections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all ${
                activeSection === section.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'
              }`}
              whileHover={{ x: 2 }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: section.color + '20' }}
              >
                <Icon name={section.icon} size={13} style={{ color: section.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: section.color + 'cc' }}>
                  §{section.id}
                </div>
                <div className={`text-xs font-medium truncate ${activeSection === section.id ? 'text-white' : 'text-white/50'}`}>
                  {section.title}
                </div>
              </div>
              {activeSection === section.id && (
                <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: section.color }} />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main content — luxury editorial layout */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-8 py-8"
        >
          {/* Section header */}
          <div className="mb-8 pb-6 border-b border-white/[0.06]">
            <div
              className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
              style={{ color: active.color }}
            >
              Section {active.id} — {active.title}
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: active.color + '20', border: `1px solid ${active.color}40` }}
              >
                <Icon name={active.icon} size={22} style={{ color: active.color }} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight font-['Space_Grotesk']">{active.title}</h1>
                <p className="text-sm text-white/35 mt-1">{active.content.length} procedures · Last updated Apr 2026</p>
              </div>
            </div>
          </div>

          {/* Procedures */}
          <div className="space-y-6">
            {active.content.map((item, i) => (
              <motion.div
                key={item.heading}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  {/* Section number */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black mt-0.5"
                    style={{ background: active.color + '20', color: active.color }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-2 font-['Space_Grotesk']">{item.heading}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{item.body}</p>
                  </div>
                </div>
                {i < active.content.length - 1 && (
                  <div className="mt-5 ml-11 h-px bg-white/[0.04]" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={() => {
                const idx = SOP_SECTIONS.findIndex((s) => s.id === active.id);
                if (idx > 0) setActiveSection(SOP_SECTIONS[idx - 1]!.id);
              }}
              disabled={SOP_SECTIONS[0]?.id === active.id}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              Previous Section
            </button>
            <span className="text-xs text-white/20">§{active.id} of {SOP_SECTIONS.length}</span>
            <button
              onClick={() => {
                const idx = SOP_SECTIONS.findIndex((s) => s.id === active.id);
                if (idx < SOP_SECTIONS.length - 1) setActiveSection(SOP_SECTIONS[idx + 1]!.id);
              }}
              disabled={SOP_SECTIONS[SOP_SECTIONS.length - 1]?.id === active.id}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
            >
              Next Section
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
