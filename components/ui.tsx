
import React, { useState, useEffect, ReactNode, useRef } from 'react';

// --- ICONS (Refined to be cleaner) ---
export const HeartIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const CoinIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C5A059]">
    <circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export const GlobeIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const GoldCoinsIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#C5A059]">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const VaultIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export const BabyIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8v4l2 2"/>
  </svg>
);

export const SeniorIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M8 12h8"/>
  </svg>
);

export const MapIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

export const ScrollIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

// --- PROFESSOR AVATAR ---
export const ProfessorAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const PROFESSOR_IMAGE = "professor.png"; 
  const dim = size === 'lg' ? 'w-32 h-32 sm:w-48 sm:h-48' : size === 'md' ? 'w-20 h-20' : 'w-10 h-10';

  return (
      <div className={`${dim} flex-shrink-0 rounded-full border-2 border-[#C5A059] overflow-hidden bg-white shadow-md`}>
          <img 
            src={PROFESSOR_IMAGE} 
            alt="Consultor"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] text-[#C5A059] font-bold">R.A.</div>`;
            }}
          />
      </div>
  );
};

// --- TYPEWRITER COMPONENT ---
export const Typewriter: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ text, speed = 15, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText('');
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]); 

  return <span className="font-light tracking-wide">{displayedText}</span>;
};

// --- UI COMPONENTS ---
interface CalculatorShellProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const CalculatorShell: React.FC<CalculatorShellProps> = ({ title, children, icon }) => (
  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-10 mb-8 transition-all hover:shadow-md">
    <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>
        <div className="opacity-80">{icon}</div>
    </div>
    <div className="space-y-8">
        {children}
    </div>
  </div>
);

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  helpText?: string;
}

export const PixelInput: React.FC<PixelInputProps> = ({ label, id, helpText, ...props }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</label>
        <input
            id={id}
            type="number"
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-4 text-center text-2xl font-bold outline-none transition-all gold-glow"
            {...props}
        />
    </div>
);

interface PixelCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: ReactNode;
  value: string;
  helpText?: string;
  onChange: (event: { target: { value: string } }) => void;
}

export const PixelCurrencyInput: React.FC<PixelCurrencyInputProps> = ({ label, id, value, helpText, onChange, ...props }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value: inputValue } = e.target;
        const numericValue = inputValue.replace(/\D/g, '');
        onChange({ target: { value: numericValue } });
    };

    const format = (numericString: string) => {
        if (!numericString) return '';
        const paddedString = numericString.padStart(3, '0');
        const number = parseFloat(paddedString) / 100;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</label>
            <input
                id={id}
                type="text"
                value={format(value)}
                onChange={handleChange}
                className="w-full bg-slate-50 text-[#C5A059] border border-slate-200 rounded-xl p-4 text-center text-2xl font-bold outline-none transition-all gold-glow"
                {...props}
            />
        </div>
    );
};

export const PixelButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button
        className={`w-full bg-[#C5A059] text-white rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#B38D46] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const SummaryCard: React.FC<{ label: string; value: string; primary?: boolean }> = ({ label, value, primary = false }) => (
    <div className={`p-6 rounded-2xl border transition-all ${primary ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
    </div>
);