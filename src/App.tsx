import React, { useState } from 'react';
import { NavigationHeader, ActiveTabType } from './components/NavigationHeader';
import { Deliverable0IAM } from './components/Deliverable0IAM';
import { DeliverableImplementationPlan } from './components/DeliverableImplementationPlan';
import { Deliverable1Hexagonal } from './components/Deliverable1Hexagonal';
import { Deliverable2Drizzle } from './components/Deliverable2Drizzle';
import { Deliverable3ExamEngine } from './components/Deliverable3ExamEngine';
import { Deliverable4EventPayload } from './components/Deliverable4EventPayload';
import { Deliverable5Frontend } from './components/Deliverable5Frontend';
import { LivePsychometricsLab } from './components/LivePsychometricsLab';
import { CheckCircle2, ShieldAlert, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('plan');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800">
      {/* Header */}
      <NavigationHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'plan' && <DeliverableImplementationPlan />}
        {activeTab === 'iam' && <Deliverable0IAM />}
        {activeTab === 'hexagonal' && <Deliverable1Hexagonal />}
        {activeTab === 'drizzle' && <Deliverable2Drizzle />}
        {activeTab === 'exam-engine' && <Deliverable3ExamEngine />}
        {activeTab === 'events' && <Deliverable4EventPayload />}
        {activeTab === 'frontend' && <Deliverable5Frontend />}
        {activeTab === 'psychometrics' && <LivePsychometricsLab />}
      </main>

      {/* Footer Specification Summary */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Educational Assessment &amp; Psychometrics Platform</span>
            <span>— Architecture &amp; Engineering Specification</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
            <span>DDD Bounded Contexts</span>
            <span>•</span>
            <span>Hexagonal (Ports &amp; Adapters)</span>
            <span>•</span>
            <span>Postgres Drizzle ORM</span>
            <span>•</span>
            <span>Kafka Async Event-Driven</span>
            <span>•</span>
            <span>React 19 + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
