import React from 'react';
import { 
  Boxes, 
  Layers, 
  Database, 
  Cpu, 
  Radio, 
  Layout, 
  BarChart3, 
  CheckCircle, 
  BookOpen, 
  KeyRound,
  Milestone
} from 'lucide-react';

export type ActiveTabType = 'plan' | 'iam' | 'hexagonal' | 'drizzle' | 'exam-engine' | 'events' | 'frontend' | 'psychometrics';

interface NavigationHeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'plan', label: '🗺️ Kế Hoạch Triển Khai', icon: Milestone, badge: 'Roadmap /plan/' },
    { id: 'iam', label: '0. IAM Service', icon: KeyRound, badge: 'Headless RS256' },
    { id: 'hexagonal', label: '1. Hexagonal & DDD', icon: Layers, badge: 'Question Service' },
    { id: 'drizzle', label: '2. Drizzle Schemas', icon: Database, badge: 'Postgres DB' },
    { id: 'exam-engine', label: '3. Exam Engine', icon: Cpu, badge: 'Seeded PRNG' },
    { id: 'events', label: '4. EDA Event Payload', icon: Radio, badge: 'Kafka / Zod' },
    { id: 'frontend', label: '5. Frontend React 19', icon: Layout, badge: 'Zustand / Query' },
    { id: 'psychometrics', label: '📊 Psychometrics & Map', icon: BarChart3, badge: 'Item Analysis' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
          {/* Platform Title & Specs */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Educational Assessment &amp; Psychometrics Platform
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Microservices DDD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hexagonal Architecture (Ports &amp; Adapters) • Event-Driven Async (Kafka) • Drizzle ORM • React 19
              </p>
            </div>
          </div>

          {/* Standards Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              TypeScript 5.8
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              6 Bounded Contexts
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTabType)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
