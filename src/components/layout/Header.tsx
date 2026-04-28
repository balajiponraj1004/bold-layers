import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { Client } from '../../types';

interface HeaderProps {
  activeClient: Client | null;
  clients: Client[];
  onClientSelect: (client: Client) => void;
}

export function Header({ activeClient, clients, onClientSelect }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const filtered = query
    ? clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.industry.toLowerCase().includes(query.toLowerCase()))
    : [];

  const notifications = [
    { id: 1, icon: 'CheckCircle2', color: 'text-emerald-400', text: 'Lumière Lookbook export ready', time: '2m ago' },
    { id: 2, icon: 'AlertCircle', color: 'text-amber-400', text: 'Verdant deadline in 3 days', time: '1h ago' },
    { id: 3, icon: 'Sparkles', color: 'text-indigo-400', text: 'Blueprint generated for Nexus', time: '3h ago' },
    { id: 4, icon: 'Users', color: 'text-sky-400', text: 'New brief from Apex Motorsport', time: '1d ago' },
  ];

  return (
    <header className="flex items-center h-16 px-6 border-b border-white/[0.06] bg-[#07090F]/95 backdrop-blur-sm relative z-10">
      {/* Brand + Active Client */}
      <div className="flex items-center gap-3 flex-1">
        <span className="font-['Space_Grotesk'] font-700 text-sm tracking-[0.15em] uppercase text-white/90">
          Bold Layers
        </span>
        {activeClient && (
          <>
            <span className="text-white/20">/</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex-shrink-0 overflow-hidden"
                style={{ background: activeClient.brandColor + '30', border: `1px solid ${activeClient.brandColor}60` }}
              >
                <img src={activeClient.logoUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-white/60 font-medium">{activeClient.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <motion.button
            onClick={() => { setSearchOpen(!searchOpen); setQuery(''); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="Search" size={16} />
          </motion.button>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                className="absolute right-10 top-0 h-9 overflow-hidden"
              >
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clients, projects..."
                  className="w-full h-9 bg-white/[0.06] border border-white/10 rounded-lg px-3 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50"
                />
                {filtered.length > 0 && (
                  <div className="absolute top-10 right-0 w-full bg-[#0F1118] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onClientSelect(c); setSearchOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                          <img src={c.logoUrl} alt="" className="w-full h-full" />
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">{c.name}</div>
                          <div className="text-xs text-white/40">{c.industry}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all relative"
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="Bell" size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute right-0 top-11 w-80 bg-[#0F1118] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">Notifications</span>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                    <Icon name={n.icon} size={16} className={`mt-0.5 flex-shrink-0 ${n.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80">{n.text}</p>
                      <p className="text-xs text-white/30 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 cursor-pointer hover:border-indigo-500/50 transition-colors">
          <img
            src="https://api.dicebear.com/9.x/initials/svg?seed=BP&backgroundColor=6366f1"
            alt="Profile"
            className="w-full h-full"
          />
        </div>
      </div>
    </header>
  );
}
