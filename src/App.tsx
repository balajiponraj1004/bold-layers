import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { AgencyHub } from './components/agency/AgencyHub';
import { MarketingPlaybook } from './components/playbook/MarketingPlaybook';
import { WorkflowBuilder } from './components/workflow/WorkflowBuilder';
import { TemplateGallery } from './components/templates/TemplateGallery';
import { SoftwareHubModal } from './components/production/SoftwareHubModal';
import { MOCK_CLIENTS } from './data/mockData';
import type { Client, NavPage, Platform } from './types';

function CalendarView({ clients }: { clients: Client[] }) {
  const events = clients
    .flatMap((c) => c.calendarEvents.map((e) => ({ ...e, clientName: c.name, clientColor: c.brandColor })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const typeColor: Record<string, string> = {
    post: '#6366F1', meeting: '#10B981', deadline: '#EF4444', review: '#F59E0B',
  };
  const typeIcon: Record<string, string> = {
    post: 'Send', meeting: 'Video', deadline: 'Flag', review: 'Eye',
  };

  const today = new Date();
  const months = [...new Set(events.map((e) => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight">Content Calendar</h1>
        <p className="text-sm text-white/40 mt-1">{events.length} scheduled events across all clients</p>
      </div>
      <div className="max-w-2xl space-y-8">
        {months.map((month) => {
          const [y, m] = month.split('-').map(Number) as [number, number];
          const monthName = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const monthEvents = events.filter((e) => e.date.startsWith(month));
          return (
            <div key={month}>
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{monthName}</div>
              <div className="space-y-2">
                {monthEvents.map((event) => {
                  const d = new Date(event.date);
                  const isPast = d < today;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        isPast ? 'bg-white/[0.01] border-white/[0.04] opacity-50' : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="w-12 text-center flex-shrink-0">
                        <div className="text-lg font-black text-white">{d.getDate()}</div>
                        <div className="text-[10px] text-white/30">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      </div>
                      <div className="w-px h-8 bg-white/[0.08]" style={{ background: event.clientColor + '60' }} />
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: typeColor[event.type] + '20' }}
                      >
                        <span style={{ color: typeColor[event.type] }}>
                          {/* Icon placeholder */}
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{event.title}</div>
                        <div className="text-xs text-white/35 mt-0.5">{event.clientName} {event.platform ? `· ${event.platform}` : ''}</div>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize border flex-shrink-0"
                        style={{ color: typeColor[event.type], borderColor: typeColor[event.type] + '40', background: typeColor[event.type] + '15' }}
                      >
                        {event.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [hubOpen, setHubOpen] = useState(false);
  const [hubPlatform, setHubPlatform] = useState<Platform>('illustrator');
  const [addClientOpen, setAddClientOpen] = useState(false);

  const handleOpenHub = (platform?: string) => {
    if (platform) setHubPlatform(platform as Platform);
    setHubOpen(true);
  };

  const handleNavigate = (page: NavPage) => {
    setActivePage(page);
    if (page !== 'agency') setActiveClient(null);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#07090F]">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onAddClient={() => {
          setActivePage('agency');
          setAddClientOpen(true);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeClient={activeClient}
          clients={clients}
          onClientSelect={(client) => {
            setActiveClient(client);
            setActivePage('agency');
          }}
        />

        <main className="flex-1 flex overflow-hidden">
          {activePage === 'dashboard' && (
            <Dashboard
              clients={clients}
              onOpenHub={handleOpenHub}
              onNavigateAgency={() => setActivePage('agency')}
            />
          )}
          {activePage === 'agency' && (
            <AgencyHub
              clients={clients}
              onClientsChange={setClients}
              onOpenHub={handleOpenHub}
            />
          )}
          {activePage === 'workflow' && (
            <WorkflowBuilder clients={clients} />
          )}
          {activePage === 'templates' && (
            <TemplateGallery />
          )}
          {activePage === 'playbook' && (
            <MarketingPlaybook clients={clients} />
          )}
          {activePage === 'calendar' && (
            <CalendarView clients={clients} />
          )}
        </main>
      </div>

      <AnimatePresence>
        {hubOpen && (
          <SoftwareHubModal
            initialPlatform={hubPlatform}
            onClose={() => setHubOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Suppress unused addClientOpen — handled inside AgencyHub */}
      {addClientOpen && null}
    </div>
  );
}
