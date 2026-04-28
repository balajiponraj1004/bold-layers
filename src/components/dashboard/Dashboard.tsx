import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { Client, Project } from '../../types';
import { PLATFORMS } from '../../data/mockData';

interface DashboardProps {
  clients: Client[];
  onOpenHub: (platform?: string) => void;
  onNavigateAgency: () => void;
}

const STATUS_COLOR: Record<Project['status'], string> = {
  Briefing: 'text-sky-400 bg-sky-400/10',
  Strategy: 'text-amber-400 bg-amber-400/10',
  Production: 'text-indigo-400 bg-indigo-400/10',
  Revision: 'text-orange-400 bg-orange-400/10',
  Completed: 'text-emerald-400 bg-emerald-400/10',
};

function StatCard({ label, value, delta, icon, color }: { label: string; value: string; delta?: string; icon: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white font-['Space_Grotesk']">{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
        {delta && <div className="text-xs text-emerald-400 mt-1">{delta}</div>}
      </div>
    </motion.div>
  );
}

export function Dashboard({ clients, onOpenHub, onNavigateAgency }: DashboardProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const allProjects = clients.flatMap((c) => c.projects.map((p) => ({ ...p, clientName: c.name, clientColor: c.brandColor })));
  const activeTasks = clients.flatMap((c) => c.projects.flatMap((p) => p.tasks)).filter((t) => t.status !== 'Done');
  const totalBudget = allProjects.reduce((sum, p) => sum + p.budget, 0);

  const today = new Date();
  const upcoming = clients
    .flatMap((c) => c.calendarEvents.map((e) => ({ ...e, clientName: c.name, clientColor: c.brandColor })))
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const eventTypeIcon: Record<string, string> = {
    post: 'Send',
    meeting: 'Video',
    deadline: 'Flag',
    review: 'Eye',
  };
  const eventTypeColor: Record<string, string> = {
    post: '#6366F1',
    meeting: '#10B981',
    deadline: '#EF4444',
    review: '#F59E0B',
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">
          Production Overview
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Clients" value={String(clients.filter((c) => c.status === 'Active').length)} delta="+1 this month" icon="Building2" color="#6366F1" />
        <StatCard label="Live Projects" value={String(allProjects.filter((p) => p.status !== 'Completed').length)} icon="Briefcase" color="#10B981" />
        <StatCard label="Open Tasks" value={String(activeTasks.length)} icon="CheckSquare" color="#F59E0B" />
        <StatCard label="Monthly Retainers" value={`$${(totalBudget / 1000).toFixed(0)}k`} icon="TrendingUp" color="#EC4899" />
      </div>

      {/* Main bento grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Active Projects — wide */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-12 lg:col-span-7 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase font-['Space_Grotesk']">Active Projects</h2>
            <button onClick={onNavigateAgency} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {allProjects.filter((p) => p.status !== 'Completed').slice(0, 5).map((project) => {
              const doneTasks = project.tasks.filter((t) => t.status === 'Done').length;
              const progress = project.tasks.length > 0 ? (doneTasks / project.tasks.length) * 100 : 0;
              const platform = PLATFORMS.find((pl) => pl.id === project.platform);
              return (
                <motion.div
                  key={project.id}
                  onHoverStart={() => setHoveredProject(project.id)}
                  onHoverEnd={() => setHoveredProject(null)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {/* Client color bar */}
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: project.clientColor }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{project.title}</span>
                      {platform && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider" style={{ color: platform.color, background: platform.bgColor }}>
                          {platform.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">{project.clientName}</div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-white/[0.08] rounded-full w-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: project.clientColor }}
                        initial={{ width: 0 }}
                        animate={{ width: hoveredProject === project.id ? `${progress}%` : `${progress}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[project.status]}`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-white/30">{doneTasks}/{project.tasks.length} tasks</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase font-['Space_Grotesk']">Upcoming</h2>
            <span className="text-xs text-white/30">{upcoming.length} events</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {upcoming.map((event) => {
              const d = new Date(event.date);
              const isToday = d.toDateString() === today.toDateString();
              const isTomorrow = d.toDateString() === new Date(today.getTime() + 86400000).toDateString();
              const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: eventTypeColor[event.type] + '20' }}>
                    <Icon name={eventTypeIcon[event.type] ?? 'Calendar'} size={14} style={{ color: eventTypeColor[event.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/85 truncate">{event.title}</div>
                    <div className="text-xs text-white/30">{event.clientName}</div>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${isToday ? 'text-red-400' : isTomorrow ? 'text-amber-400' : 'text-white/30'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Production Tools */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-12 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase font-['Space_Grotesk']">AI Production Tools</h2>
            <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full font-semibold">Gemini Powered</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => onOpenHub(platform.id)}
                className="group flex flex-col gap-2 p-4 rounded-xl border transition-all text-left cursor-pointer"
                style={{
                  background: platform.bgColor,
                  borderColor: platform.color + '30',
                }}
                whileHover={{ scale: 1.02, borderColor: platform.color + '80' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: platform.color + '25' }}>
                  <Icon name={platform.icon} size={18} style={{ color: platform.color }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-['Space_Grotesk']">{platform.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: platform.color }}>{platform.tagline}</div>
                  <div className="text-xs text-white/35 mt-1">{platform.focus}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
