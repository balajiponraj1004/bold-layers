export type TaskStatus = 'ToDo' | 'InProgress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Briefing' | 'Strategy' | 'Production' | 'Revision' | 'Completed';
export type Platform = 'illustrator' | 'indesign' | 'after_effects' | 'blender';
export type WorkflowStep = 'INPUT' | 'BLUEPRINT' | 'PROCESSING' | 'FINAL';
export type NavPage = 'dashboard' | 'agency' | 'playbook' | 'calendar' | 'workflow' | 'templates';

// ── Workflow Builder ──────────────────────────────────────────────────────────
export type WFNodeType =
  | 'client' | 'brief' | 'blueprint'
  | 'illustrator' | 'indesign' | 'after_effects' | 'blender'
  | 'export';

export type WFNodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface WFNodeData {
  clientId?: string;
  clientName?: string;
  clientColor?: string;
  clientLogoUrl?: string;
  brief?: string;
  platform?: Platform;
  script?: string;
  svgPreview?: string;
  blueprintData?: Blueprint;
}

export interface WFNode {
  id: string;
  type: WFNodeType;
  position: { x: number; y: number };
  data: WFNodeData;
  status: WFNodeStatus;
}

export interface WFEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  deadline: string;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  tasks: Task[];
  budget: number;
  spent: number;
  deadline: string;
  platform?: Platform;
  description: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'post' | 'meeting' | 'deadline' | 'review';
  platform?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  country: string;
  timezone: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  description: string;
  brandColor: string;
  brandFont: string;
  logoUrl: string;
  projects: Project[];
  branches: Branch[];
  calendarEvents: CalendarEvent[];
  teamSize: number;
  retainerValue: number;
  status: 'Active' | 'Paused' | 'Prospect';
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  ext: string;
  tagline: string;
  focus: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface BlueprintLayer {
  name: string;
  type: string;
  description: string;
  properties: Record<string, string>;
}

export interface BlueprintArtboard {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: BlueprintLayer[];
}

export interface Blueprint {
  title: string;
  platform: Platform;
  strategy: string;
  colorPalette: string[];
  typography: { heading: string; body: string };
  artboards: BlueprintArtboard[];
  designNotes: string[];
}

export interface ProductionOutput {
  script: string;
  svgPreview: string;
  exportFormats: string[];
  artboardCount: number;
}
