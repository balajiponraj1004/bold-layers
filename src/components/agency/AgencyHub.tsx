import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import { ClientDetail } from './ClientDetail';
import type { Client } from '../../types';
import { MOCK_CLIENTS } from '../../data/mockData';

interface AgencyHubProps {
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
  onOpenHub: (platform?: string, clientId?: string) => void;
}

const INDUSTRY_ICONS: Record<string, string> = {
  Technology: 'Cpu',
  'Luxury Fashion': 'Gem',
  Biotech: 'Dna',
  'Sports & Automotive': 'Zap',
  default: 'Building2',
};

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const activeProjects = client.projects.filter((p) => p.status !== 'Completed').length;
  const totalTasks = client.projects.flatMap((p) => p.tasks).length;
  const doneTasks = client.projects.flatMap((p) => p.tasks).filter((t) => t.status === 'Done').length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      onClick={onClick}
      className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 cursor-pointer overflow-hidden"
      whileHover={{ y: -2, borderColor: client.brandColor + '60' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{ '--brand': client.brandColor } as React.CSSProperties}
    >
      {/* Brand glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: client.brandColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: client.brandColor + '20', border: `1px solid ${client.brandColor}40` }}
          >
            <img src={client.logoUrl} alt={client.name} className="w-full h-full" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-['Space_Grotesk']">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon name={INDUSTRY_ICONS[client.industry] ?? INDUSTRY_ICONS.default} size={11} className="text-white/30" />
              <span className="text-xs text-white/40">{client.industry}</span>
            </div>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
          client.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
          client.status === 'Paused' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
          'text-sky-400 bg-sky-400/10 border-sky-400/20'
        }`}>
          {client.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4">{client.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/30">{doneTasks}/{totalTasks} tasks complete</span>
          <span className="text-xs font-medium" style={{ color: client.brandColor }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: client.brandColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex gap-4">
          <div>
            <div className="text-sm font-bold text-white">{activeProjects}</div>
            <div className="text-[10px] text-white/30">Projects</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">{client.branches.length}</div>
            <div className="text-[10px] text-white/30">Branches</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">{client.teamSize}</div>
            <div className="text-[10px] text-white/30">Team</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold" style={{ color: client.brandColor }}>
            ${(client.retainerValue / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-white/30">/ month</div>
        </div>
      </div>
    </motion.div>
  );
}

function AddClientModal({ onAdd, onClose }: { onAdd: (client: Client) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', industry: '', location: '', description: '', brandColor: '#6366F1' });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const newClient: Client = {
      ...MOCK_CLIENTS[0]!,
      id: `c${Date.now()}`,
      name: form.name,
      industry: form.industry || 'Technology',
      location: form.location || 'Global',
      description: form.description || `${form.name} — a forward-thinking brand.`,
      brandColor: form.brandColor,
      brandFont: 'Inter',
      logoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=${form.brandColor.replace('#', '')}`,
      projects: [],
      branches: [{ id: `b${Date.now()}`, name: 'HQ', location: form.location || 'Global', country: 'Global', timezone: 'UTC' }],
      calendarEvents: [],
      teamSize: 1,
      retainerValue: 5000,
      status: 'Prospect',
    };
    onAdd(newClient);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0F1118] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">New Client</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/80 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { key: 'name', label: 'Client Name', placeholder: 'e.g. Nexus Dynamics' },
            { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
            { key: 'location', label: 'Location', placeholder: 'e.g. San Francisco, CA' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the client..."
              rows={2}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/60 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.brandColor}
                onChange={(e) => setForm((f) => ({ ...f, brandColor: e.target.value }))}
                className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 cursor-pointer bg-transparent"
              />
              <span className="text-sm text-white/50 font-mono">{form.brandColor}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold text-white transition-colors"
          >
            Add Client
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AgencyHub({ clients, onClientsChange, onOpenHub }: AgencyHubProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Paused' | 'Prospect'>('All');

  const filtered = filter === 'All' ? clients : clients.filter((c) => c.status === filter);

  const handleAddClient = (client: Client) => {
    onClientsChange([...clients, client]);
  };

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onOpenHub={onOpenHub}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">Agency Hub</h1>
          <p className="text-sm text-white/40 mt-1">{clients.filter((c) => c.status === 'Active').length} active clients · {clients.length} total</p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Icon name="Plus" size={15} />
          New Client
        </motion.button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 bg-white/[0.03] rounded-xl w-fit border border-white/[0.06]">
        {(['All', 'Active', 'Paused', 'Prospect'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Client grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ClientCard client={client} onClick={() => setSelectedClient(client)} />
          </motion.div>
        ))}
        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20">
            <Icon name="Building2" size={40} className="mb-3" />
            <p className="text-sm">No clients found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddClientModal onAdd={handleAddClient} onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
