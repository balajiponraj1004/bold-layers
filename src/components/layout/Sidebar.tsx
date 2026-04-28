import { motion } from 'framer-motion';
import { Icon } from '../common/Icon';
import type { NavPage } from '../../types';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  onAddClient: () => void;
}

const NAV_ITEMS: { id: NavPage; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  { id: 'agency',    icon: 'Building2',       label: 'Agency Hub' },
  { id: 'workflow',  icon: 'GitBranch',        label: 'Workflow' },
  { id: 'templates', icon: 'Sparkles',         label: 'Templates' },
  { id: 'playbook',  icon: 'BookOpen',         label: 'Playbook' },
  { id: 'calendar',  icon: 'CalendarDays',     label: 'Calendar' },
];

export function Sidebar({ activePage, onNavigate, onAddClient }: SidebarProps) {
  return (
    <aside className="flex flex-col w-16 h-full border-r border-white/[0.06] bg-[#07090F] z-20 relative">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Icon name="Layers" size={16} className="text-white" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1 pt-4 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center group cursor-pointer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-indigo-500/15 border border-indigo-500/30"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                />
              )}
              <Icon
                name={item.icon}
                size={18}
                className={active ? 'text-indigo-400' : 'text-white/35 group-hover:text-white/70'}
                style={{ transition: 'color 0.2s' }}
              />
            </motion.button>
          );
        })}
      </nav>

      {/* Quick Add */}
      <div className="flex flex-col items-center pb-4 gap-2">
        <div className="w-10 h-px bg-white/[0.06]" />
        <motion.button
          onClick={onAddClient}
          className="w-10 h-10 rounded-xl flex items-center justify-center group cursor-pointer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Add Client"
        >
          <Icon name="Plus" size={18} className="text-white/35 group-hover:text-indigo-400" style={{ transition: 'color 0.2s' }} />
        </motion.button>
      </div>
    </aside>
  );
}
