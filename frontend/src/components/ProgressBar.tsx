import React from 'react';
import { Bot, CheckCircle2, FileText, Database } from 'lucide-react';

interface ProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { num: 1, name: "Escaneando", icon: FileText },
    { num: 2, name: "IA Analizando", icon: Bot },
    { num: 3, name: "Revisión", icon: CheckCircle2 },
    { num: 4, name: "Sincronizado", icon: Database },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-200 -translate-y-1/2 z-0 rounded-full"></div>
        
        {/* Active Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map(step => {
          const isActive = currentStep >= step.num;
          const isCurrent = currentStep === step.num;
          const Icon = step.icon;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                  ${isActive ? 'bg-primary-500 text-white shadow-primary-500/30' : 'bg-white border-2 border-surface-200 text-text-secondary'}
                  ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}
                `}
              >
                <Icon size={18} className={isCurrent && currentStep === 2 ? 'animate-bounce' : ''} />
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-primary-700' : 'text-text-secondary'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
