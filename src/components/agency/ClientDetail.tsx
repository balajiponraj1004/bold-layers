import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { Client, Project, Task } from '../../types';
import { PLATFORMS } from '../../data/mockData';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onOpenHub: (platform?: string, clientId?: string) => void;
}

const TASK_STATUS_ORDER: Task['status'][] = ['ToDo', 'InProgress', 'Review', 'Done'];
const TASK_STATUS_COLOR: Record<Task['status'], string> = {
  ToDo: 'text-white/40 bg-white/[0.06]',
  InProgress: 'text-sky-400 bg-sky-400/10',
  Review: 'text-amber-400 bg-amber-400/10',
  Done: 'text-emerald-400 bg-emerald-400/10',
};
const PRIORITY_COLOR: Record<Task['priority'], string> = {
  Low: 'text-white/30',
  Medium: 'text-sky-400',
  High: 'text-amber-400',
  Critical: 'text-red-400',
};

function ProjectPanel({ project, brandColor, onOpenHub }: { project: Project; brandColor: string; onOpenHub: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const platform = PLATFORMS.find((p) => p.id === project.platform);
  const doneTasks = project.tasks.filter((t) => t.status === 'Done').length;
  const progress = project.tasks.length > 0 ? (doneTasks / project.tasks.length) * 100 : 0;
  const spent = (project.spent / project.budget) * 100;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Project header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: brandColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{project.title}</span>
            {platform && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ color: platform.color, background: platform.bgColor }}>
                {platform.name}
              </span>
            )}
          </div>
          <p className="text-xs text-white/35 mt-0.5 truncate">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenHub(); }}
            className="text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all hover:opacity-80"
            style={{ color: brandColor, borderColor: brandColor + '40', background: brandColor + '15' }}
          >
            Open Hub
          </button>
          <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-white/30" />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Budget & progress */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-xs text-white/30 mb-1">Budget</div>
              <div className="text-sm font-bold text-white">${project.spent.toLocaleString()} <span className="text-white/30 font-normal">/ ${project.budget.toLocaleString()}</span></div>
              <div className="mt-2 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${spent}%`, background: spent > 80 ? '#EF4444' : brandColor }} />
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-xs text-white/30 mb-1">Task Progress</div>
              <div className="text-sm font-bold text-white">{doneTasks} <span className="text-white/30 font-normal">/ {project.tasks.length} done</span></div>
              <div className="mt-2 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: brandColor }} />
              </div>
            </div>
          </div>

          {/* Tasks grouped by status */}
          <div className="space-y-3">
            {TASK_STATUS_ORDER.filter((s) => project.tasks.some((t) => t.status === s)).map((status) => (
              <div key={status}>
                <div className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-2">{status}</div>
                <div className="space-y-1.5">
                  {project.tasks.filter((t) => t.status === status).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 bg-white/[0.02] rounded-lg border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[task.priority].replace('text-', 'bg-')}`} />
                      <span className="text-sm text-white/75 flex-1">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${TASK_STATUS_COLOR[task.status]}`}>{task.status}</span>
                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                          <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(task.assignee)}&backgroundColor=374151`} alt={task.assignee} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ClientDetail({ client, onBack, onOpenHub }: ClientDetailProps) {
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', client.brandColor);
    document.documentElement.style.setProperty('--brand-font', client.brandFont);
    return () => {
      document.documentElement.style.removeProperty('--brand-color');
      document.documentElement.style.removeProperty('--brand-font');
    };
  }, [client]);

  const [activeTab, setActiveTab] = useState<'projects' | 'calendar' | 'branches'>('projects');
  const allTasks = client.projects.flatMap((p) => p.tasks);
  const doneTasks = allTasks.filter((t) => t.status === 'Done').length;

  const eventTypeColor: Record<string, string> = {
    post: '#6366F1',
    meeting: '#10B981',
    deadline: '#EF4444',
    review: '#F59E0B',
  };
  const eventTypeIcon: Record<string, string> = {
    post: 'Send',
    meeting: 'Video',
    deadline: 'Flag',
    review: 'Eye',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Brand header */}
      <div
        className="relative px-6 pt-6 pb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${client.brandColor}18 0%, transparent 60%)` }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: client.brandColor }}
        />
        <div className="relative">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-5 transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            Agency Hub
          </button>

          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ border: `2px solid ${client.brandColor}50` }}
            >
              <img src={client.logoUrl} alt={client.name} className="w-full h-full" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{ fontFamily: client.brandFont === 'Space Grotesk' ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif", color: 'white' }}
                >
                  {client.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold border text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                  {client.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-white/40">{client.industry}</span>
                <span className="text-white/20">·</span>
                <span className="text-sm text-white/40">{client.location}</span>
              </div>
              <p className="text-sm text-white/50 mt-2 max-w-xl leading-relaxed">{client.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black" style={{ color: client.brandColor }}>
                ${(client.retainerValue / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-white/30">monthly retainer</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/[0.06]">
            {[
              { label: 'Projects', value: client.projects.length },
              { label: 'Branches', value: client.branches.length },
              { label: 'Team', value: client.teamSize },
              { label: 'Tasks Done', value: `${doneTasks}/${allTasks.length}` },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30">{stat.label}</div>
              </div>
            ))}
            <div className="ml-auto">
              <motion.button
                onClick={() => onOpenHub(undefined, client.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: client.brandColor }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon name="Sparkles" size={14} />
                Open Production Hub
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-white/[0.06]">
        {(['projects', 'calendar', 'branches'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {client.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <Icon name="Briefcase" size={36} className="mb-3" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              client.projects.map((project) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <ProjectPanel
                    project={project}
                    brandColor={client.brandColor}
                    onOpenHub={() => onOpenHub(project.platform, client.id)}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-2">
            {client.calendarEvents
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: eventTypeColor[event.type] + '20' }}
                  >
                    <Icon name={eventTypeIcon[event.type] ?? 'Calendar'} size={16} style={{ color: eventTypeColor[event.type] }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{event.title}</div>
                    {event.platform && <div className="text-xs text-white/35 mt-0.5">{event.platform}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: eventTypeColor[event.type] }}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-white/30 capitalize">{event.type}</div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {client.branches.map((branch) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: client.brandColor + '20' }}>
                    <Icon name="MapPin" size={14} style={{ color: client.brandColor }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{branch.name}</div>
                    <div className="text-xs text-white/35">{branch.country}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Location</span>
                    <span className="text-white/70">{branch.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Timezone</span>
                    <span className="text-white/70">{branch.timezone}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
