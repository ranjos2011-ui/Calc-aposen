
import React, { useState, useMemo, useEffect } from 'react';
import { 
  calculateFutureValueProgressionWithCosts, 
  formatCurrency, 
  calculateYearsToGoalWithCosts, 
  calculateFutureValue,
} from './utils/financial';
import { 
  CalculatorShell, 
  PixelInput, 
  PixelButton, 
  MapIcon, 
  SummaryCard, 
  PixelCurrencyInput, 
  CoinIcon,
  ProfessorAvatar,
  Typewriter,
  GoldCoinsIcon,
  VaultIcon,
  SeniorIcon,
  ScrollIcon,
  GlobeIcon
} from './components/ui';
import { LineChart } from './components/chart';

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="flex justify-center items-center gap-4 mb-12 step-indicator-container no-print">
    {[1, 2, 3, 4, 5, 6].map((step) => (
      <div key={step} className="flex items-center">
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentStep >= step ? 'bg-[#C5A059] scale-125 shadow-lg' : 'bg-slate-200'}`}></div>
        {step < 6 && <div className={`w-6 h-[1px] mx-1 transition-all duration-500 ${currentStep > step ? 'bg-[#C5A059]' : 'bg-slate-200'}`}></div>}
      </div>
    ))}
  </div>
);

const ProbabilityBadge: React.FC<{ rate: number }> = ({ rate }) => {
  let label = "Baixa";
  let colors = "bg-slate-100 text-slate-600 border-slate-200";

  if (rate >= 5 && rate <= 7) {
    label = "Alta";
    colors = "bg-emerald-50 text-emerald-700 border-emerald-100";
  } else if (rate === 3 || rate === 4 || rate === 8 || rate === 9) {
    label = "Média";
    colors = "bg-amber-50 text-amber-700 border-amber-100";
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${colors}`}>
      {label}
    </span>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden no-print">
    <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-50 rounded-full blur-[100px]"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-amber-50 rounded-full blur-[100px]"></div>
    
    <div className="z-10 text-center max-w-2xl animate-in fade-in zoom-in duration-1000">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 mb-8">
        <CoinIcon />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R Anjos Consultoria</span>
      </div>
      
      <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
        Calculadora de <span className="text-[#C5A059]">Aposentadoria.</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-12 font-light leading-relaxed">
        Uma análise técnica e personalizada da <strong>R Anjos Consultoria</strong> para o seu planejamento internacional em moedas fortes.
      </p>

      <button 
        onClick={onStart}
        className="group relative px-12 py-5 bg-[#C5A059] text-white font-bold rounded-2xl hover:bg-[#B38D46] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#C5A059]/10"
      >
        INICIAR ANÁLISE
        <span className="ml-3 group-hover:translate-x-1 inline-block transition-transform">→</span>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [typingComplete, setTypingComplete] = useState(false);
  const [selectedRate, setSelectedRate] = useState(7);
  const [expandedRate, setExpandedRate] = useState<number | null>(null);

  const [initialValue, setInitialValue] = useState(''); 
  const [monthlyRetirementIncome, setMonthlyRetirementIncome] = useState(''); 
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(''); 
  const [familyIncome, setFamilyIncome] = useState('');
  
  const [annualFixedCost] = useState('');
  const [annualVariableCost] = useState('');

  const desiredYears = useMemo(() => {
    const rAge = parseInt(retirementAge, 10) || 0;
    const cAge = parseInt(currentAge, 10) || 0;
    return Math.max(0, rAge - cAge);
  }, [retirementAge, currentAge]);

  const getGoalForRate = (rate: number) => {
    const monthlyIncome = (parseFloat(monthlyRetirementIncome) || 0) / 100;
    const annualIncome = monthlyIncome * 12;
    return annualIncome / (rate / 100);
  };

  const goalValue = useMemo(() => getGoalForRate(4), [monthlyRetirementIncome]);
  const comparisonRates = [2.7, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];

  const profitabilityMatrix = useMemo(() => {
    const iv = (parseFloat(initialValue) || 0) / 100;
    const mc = (parseFloat(monthlyContribution) || 0) / 100;
    const results = [];
    for (let r = 1; r <= 20; r++) {
      const finalVal = calculateFutureValue(iv, mc, desiredYears, r);
      const incomeAt4Percent = (finalVal * 0.04) / 12;
      results.push({ rate: r, finalValue: finalVal, monthlyIncome: incomeAt4Percent });
    }
    return results;
  }, [initialValue, monthlyContribution, desiredYears]);

  const resultsByRate = useMemo(() => {
    const res = [];
    const iv = (parseFloat(initialValue) || 0) / 100;
    const mc = (parseFloat(monthlyContribution) || 0) / 100;
    const afc = (parseFloat(annualFixedCost) || 0) / 100;
    const avc = parseFloat(annualVariableCost) || 0;

    for (let rate = 1; rate <= 20; rate++) {
      const yearsWithCost = calculateYearsToGoalWithCosts(iv, mc, goalValue, rate, afc, avc);
      const prog = calculateFutureValueProgressionWithCosts(iv, mc, desiredYears, rate, afc, avc);
      const finalValueAtPlanEnd = prog.length > 0 ? prog[prog.length - 1].totalAccumulated : 0;
      res.push({ rate, yearsWithCost, finalValueAtPlanEnd });
    }
    return res;
  }, [initialValue, monthlyContribution, goalValue, annualFixedCost, annualVariableCost, desiredYears]);

  const progressionData = useMemo(() => {
    return calculateFutureValueProgressionWithCosts(
      (parseFloat(initialValue) || 0) / 100,
      (parseFloat(monthlyContribution) || 0) / 100,
      desiredYears || 20,
      selectedRate,
      (parseFloat(annualFixedCost) || 0) / 100,
      parseFloat(annualVariableCost) || 0
    );
  }, [initialValue, monthlyContribution, desiredYears, annualFixedCost, annualVariableCost, selectedRate]);

  const standardDeviations = useMemo(() => {
    const rates = [5, 6, 8, 9];
    const iv = (parseFloat(initialValue) || 0) / 100;
    const mc = (parseFloat(monthlyContribution) || 0) / 100;
    const afc = (parseFloat(annualFixedCost) || 0) / 100;
    const avc = parseFloat(annualVariableCost) || 0;

    return rates.map(r => ({
      label: `${r}%`,
      data: calculateFutureValueProgressionWithCosts(iv, mc, desiredYears || 20, r, afc, avc),
      color: r < 7 ? '#CBD5E1' : '#94A3B8'
    }));
  }, [initialValue, monthlyContribution, desiredYears, annualFixedCost, annualVariableCost]);

  const getRateSpecificProgression = (rate: number) => {
    return calculateFutureValueProgressionWithCosts(
      (parseFloat(initialValue) || 0) / 100,
      (parseFloat(monthlyContribution) || 0) / 100,
      desiredYears || 20,
      rate,
      (parseFloat(annualFixedCost) || 0) / 100,
      parseFloat(annualVariableCost) || 0
    );
  };

  const realisticScenario = useMemo(() => resultsByRate.find(r => r.rate === 7), [resultsByRate]);
  const yearsNeeded = realisticScenario?.yearsWithCost || Infinity;
  const isPossible = yearsNeeded <= desiredYears;
  const finalValueAtEnd = realisticScenario?.finalValueAtPlanEnd || 0;
  const possibleDreamIncome = (finalValueAtEnd * 0.04) / 12;

  const contributionsByPercent = useMemo(() => {
    const fIncome = (parseFloat(familyIncome) || 0) / 100;
    if (fIncome <= 0) return [];
    return [10, 20, 30, 40, 50, 75, 99].map(p => {
        const mc = fIncome * (p / 100);
        const years = calculateYearsToGoalWithCosts((parseFloat(initialValue) || 0) / 100, mc, goalValue, 7, (parseFloat(annualFixedCost) || 0) / 100, parseFloat(annualVariableCost) || 0);
        return { percent: p, monthlyAmount: mc, yearsNeeded: years };
    });
  }, [familyIncome, initialValue, goalValue, annualFixedCost, annualVariableCost]);

  const isHighNetWorth = useMemo(() => {
      const assetsBrl = (parseFloat(initialValue) || 0) / 100;
      return (assetsBrl / 5.5) >= 400000;
  }, [initialValue]);

  const handlePrint = () => {
    // Programmatically trigger the browser's print dialog (equivalent to keyboard shortcuts)
    window.print();
  };

  // Add keyboard shortcuts to trigger print action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Ctrl+P (Standard) or Ctrl+Shift+R (Requested Shortcut)
      const isCtrlP = (e.ctrlKey || e.metaKey) && e.key === 'p';
      const isCtrlShiftR = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r');
      
      if ((isCtrlP || isCtrlShiftR) && step === 6) {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  if (!gameStarted) return <StartScreen onStart={() => setGameStarted(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-12 text-slate-900">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-16 max-w-5xl mx-auto border-b border-slate-200 pb-8 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">R Anjos Consultoria</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Assessoria de Investimentos Private</p>
        </div>
        <StepIndicator currentStep={step} />
      </header>

      <main className="max-w-4xl mx-auto pb-24">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CalculatorShell title="Perfil do Investidor" icon={<MapIcon />}>
              <div className="bg-slate-100 rounded-2xl p-6 flex gap-6 items-center mb-10 border border-slate-200">
                <ProfessorAvatar size="md" />
                <div className="flex-1">
                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-1">Diagnóstico Inicial</p>
                  <div className="text-slate-800 text-lg leading-snug">
                    <Typewriter 
                      text="Para iniciarmos sua análise estratégica personalizada, por favor preencha os dados fundamentais do seu perfil financeiro abaixo." 
                      onComplete={() => setTypingComplete(true)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <PixelCurrencyInput label="Renda Mensal Alvo" value={monthlyRetirementIncome} onChange={e => setMonthlyRetirementIncome(e.target.value)} />
                <PixelCurrencyInput label="Patrimônio Líquido Atual" value={initialValue} onChange={e => setInitialValue(e.target.value)} />
                <PixelInput label="Sua Idade Atual" value={currentAge} onChange={e => setCurrentAge(e.target.value)} placeholder="00" />
                <PixelInput label="Idade de Aposentadoria" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} placeholder="00" />
              </div>

              <div className="flex flex-col gap-4 items-center max-w-md mx-auto">
                <PixelButton onClick={() => { setStep(2); setTypingComplete(false); }} disabled={!typingComplete || !monthlyRetirementIncome || !currentAge || !retirementAge}>
                  CALCULAR PLANEJAMENTO
                </PixelButton>
                <button onClick={() => setGameStarted(false)} className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors">Voltar ao Início</button>
              </div>
            </CalculatorShell>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CalculatorShell title="A Matemática do Alvo" icon={<CoinIcon />}>
              <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <ProfessorAvatar size="lg" />
                  <div className="flex-1 space-y-8">
                    <h3 className="text-2xl font-semibold text-slate-900 uppercase tracking-tight">O Princípio da Perpetuidade</h3>
                    <div className="text-slate-600 leading-relaxed font-light">
                      <Typewriter 
                        text={`Para garantir uma renda perpétua de ${formatCurrency((parseFloat(monthlyRetirementIncome)||0)/100)}, aplicamos a Regra dos 4%. Abaixo você verá o patrimônio necessário para diferentes perfis de segurança.`} 
                        onComplete={() => setTypingComplete(true)} 
                      />
                    </div>
                    
                    {typingComplete && (
                      <div className="animate-in fade-in slide-in-from-top-4 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SummaryCard label="Renda Mensal Almejada" value={formatCurrency((parseFloat(monthlyRetirementIncome)||0)/100)} />
                            <SummaryCard label="Patrimônio Alvo (Regra 4%)" value={formatCurrency(goalValue)} primary />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Benchmark de Taxas de Retirada</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Taxa (%)</th>
                                            <th className="px-6 py-4 font-bold">Perfil de Risco</th>
                                            <th className="px-6 py-4 font-bold text-right">Patrimônio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-700">
                                        {comparisonRates.map(rate => {
                                            const isSelected = rate === 4.0;
                                            return (
                                                <tr key={rate} className={`transition-all duration-300 ${isSelected ? 'bg-indigo-50/50 border-l-4 border-l-[#C5A059] font-bold' : 'hover:bg-slate-50 border-l-4 border-l-transparent border-b border-slate-100'}`}>
                                                    <td className={`px-6 py-5 ${isSelected ? 'text-[#C5A059] text-lg' : ''}`}>{rate.toFixed(1)}%</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                            rate <= 3.0 ? 'bg-emerald-100 text-emerald-700' : isSelected ? 'bg-[#C5A059] text-white' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                            {rate <= 3.0 ? 'Ultra Conservador' : isSelected ? 'Estratégia R Anjos' : 'Agressivo'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-5 text-right font-semibold ${isSelected ? 'text-slate-900 text-lg' : 'text-slate-500'}`}>{formatCurrency(getGoalForRate(rate))}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 items-center justify-center md:items-end">
                            <PixelButton className="max-w-xs" onClick={() => { setStep(3); setTypingComplete(false); }}>PRÓXIMA ETAPA</PixelButton>
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors">Voltar ao Perfil</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CalculatorShell>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CalculatorShell title="Estratégia de Acumulação" icon={<VaultIcon />}>
              <div className="bg-slate-100 rounded-2xl p-6 flex gap-6 items-center mb-10 border border-slate-200">
                <ProfessorAvatar size="md" />
                <div className="flex-1">
                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-1">Potencial de Investimento</p>
                  <div className="text-slate-800 text-lg leading-snug">
                    <Typewriter 
                      text={`Com um horizonte de ${desiredYears} anos, definiremos sua força de aporte mensal recomendada pela R Anjos Consultoria.`} 
                      onComplete={() => setTypingComplete(true)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <PixelCurrencyInput label="Aporte Mensal Pretendido" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
                <PixelCurrencyInput label="Renda Familiar Mensal" value={familyIncome} onChange={e => setFamilyIncome(e.target.value)} />
              </div>

              <div className="flex flex-col gap-6 items-center max-w-2xl mx-auto">
                <div className="flex gap-4 w-full">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 text-slate-500 hover:text-slate-900 uppercase text-xs font-bold tracking-widest transition-all border border-slate-200 rounded-xl hover:bg-white">Voltar</button>
                  <PixelButton className="flex-[2]" onClick={() => { setStep(4); setTypingComplete(false); }} disabled={!monthlyContribution || !familyIncome}>VER MATRIZ DE RETORNO</PixelButton>
                </div>
              </div>
            </CalculatorShell>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CalculatorShell title="Matriz de Rentabilidade Real" icon={<GoldCoinsIcon />}>
              <div className="bg-slate-100 rounded-2xl p-6 flex gap-6 items-center mb-10 border border-slate-200">
                <ProfessorAvatar size="md" />
                <div className="flex-1">
                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-1">Cenários de Investimento</p>
                  <div className="text-slate-800 text-lg leading-snug">
                    <Typewriter 
                      text={`Abaixo apresentamos a projeção da sua carteira para rentabilidades de 1% a 20% ao ano acima da inflação. Clique nas linhas para ver o gráfico de evolução.`} 
                      onComplete={() => setTypingComplete(true)}
                    />
                  </div>
                </div>
              </div>

              {typingComplete && (
                <div className="animate-in fade-in duration-700 space-y-8">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-widest font-bold">
                          <tr>
                            <th className="px-6 py-4">Taxa Real (a.a.)</th>
                            <th className="px-6 py-4">Probabilidade</th>
                            <th className="px-6 py-4">Patrimônio ({desiredYears}a)</th>
                            <th className="px-6 py-4 text-right">Renda Mensal (4%)</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700">
                          {profitabilityMatrix.map((row) => {
                            const isBenchmark = row.rate === 7;
                            const isExpanded = expandedRate === row.rate;
                            return (
                              <React.Fragment key={row.rate}>
                                <tr 
                                  onClick={() => setExpandedRate(isExpanded ? null : row.rate)}
                                  className={`transition-all duration-300 border-b border-slate-100 cursor-pointer group ${isBenchmark ? 'bg-amber-50/20 border-l-4 border-l-[#C5A059]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                                >
                                  <td className={`px-6 py-4 ${isBenchmark ? 'text-[#C5A059] font-bold' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                      {row.rate}%
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <ProbabilityBadge rate={row.rate} />
                                  </td>
                                  <td className="px-6 py-4">{formatCurrency(row.finalValue)}</td>
                                  <td className="px-6 py-4 text-right font-semibold">{formatCurrency(row.monthlyIncome)}</td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="p-8">
                                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-inner animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Evolução Patrimonial Estimada - {row.rate}% a.a.</h4>
                                          <div className="text-[10px] text-slate-400 italic">Projeção matemática baseada em capitalização mensal composta</div>
                                        </div>
                                        <LineChart data={getRateSpecificProgression(row.rate)} goalValue={goalValue} />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 items-center max-w-2xl mx-auto">
                    <div className="flex gap-4 w-full">
                      <button onClick={() => setStep(3)} className="flex-1 py-4 text-slate-500 hover:text-slate-900 uppercase text-xs font-bold tracking-widest transition-all border border-slate-200 rounded-xl hover:bg-white no-print">Voltar</button>
                      <PixelButton className="flex-[2] no-print" onClick={() => setStep(5)}>ANALISAR VEREDITO FINAL</PixelButton>
                    </div>
                  </div>
                </div>
              )}
            </CalculatorShell>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <div className={`p-10 rounded-3xl border shadow-xl transition-colors duration-1000 ${isPossible ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <ProfessorAvatar size="md" />
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2 uppercase text-slate-900">{isPossible ? "Missão Viável" : "Gap Estratégico"}</h2>
                  <p className="text-slate-600 font-light leading-relaxed">
                    {isPossible 
                      ? `Seu planejamento é consistente. Na taxa internacional de 7%, você atingirá a meta em ${yearsNeeded.toFixed(1)} anos.`
                      : `Sua projeção atual indica a necessidade de ajustes técnicos para atingir o objetivo no prazo desejado.`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-8 border-b border-slate-100 pb-4">Parâmetros Atuais</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Janela de Acumulação</p>
                  <p className="text-lg font-bold text-slate-900">{desiredYears} anos</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Renda Alvo</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency((parseFloat(monthlyRetirementIncome)||0)/100)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Aporte Mensal</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency((parseFloat(monthlyContribution)||0)/100)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-bold mb-1">Tempo Real p/ Meta</p>
                  <p className={`text-lg font-bold ${isPossible ? 'text-emerald-600' : 'text-rose-600'}`}>{yearsNeeded.toFixed(1)} anos</p>
                </div>
              </div>
            </div>

            {!isPossible && (
              <div className="space-y-8 animate-in fade-in duration-1000">
                <h3 className="text-xl font-bold uppercase text-slate-900 border-l-4 border-[#C5A059] pl-4">Rotas de Ajuste R Anjos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:border-[#C5A059]/30 transition-all">
                    <div className="flex items-center gap-3 mb-6"><GlobeIcon /><h4 className="text-[#C5A059] font-bold uppercase text-xs tracking-widest">Renda Mensal Realista</h4></div>
                    <p className="text-slate-500 font-light mb-8 text-sm">No prazo de {desiredYears} anos com o aporte atual:</p>
                    <p className="text-4xl font-bold text-slate-900">{formatCurrency(possibleDreamIncome)}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:border-amber-400/30 transition-all">
                    <div className="flex items-center gap-3 mb-6"><SeniorIcon /><h4 className="text-amber-600 font-bold uppercase text-xs tracking-widest">Extensão de Janela</h4></div>
                    <p className="text-slate-500 font-light mb-8 text-sm">Para manter a renda original, adicione ao seu plano:</p>
                    <p className="text-4xl font-bold text-slate-900">+{Math.max(0, yearsNeeded - desiredYears).toFixed(1)} <span className="text-lg font-light opacity-50 text-slate-400">anos</span></p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6"><GoldCoinsIcon /><h4 className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Otimização de Aportes</h4></div>
                  
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed italic">
                    Ao elevar o seu percentual de aporte mensal, você aciona a alavanca mais poderosa do planejamento financeiro. 
                    Poupar e investir uma fatia maior da renda não apenas reduz o prazo para a liberdade financeira, 
                    como também protege seu estilo de vida futuro contra volatilidades, criando um excedente de capital que acelera exponencialmente a sua aposentadoria.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-slate-400 uppercase text-[10px] tracking-widest">
                        <tr><th className="pb-4">% Renda Fam.</th><th className="pb-4">Aporte Sugerido</th><th className="pb-4 text-right">Novo Horizonte</th></tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {contributionsByPercent.map(c => (
                          <tr key={c.percent} className="border-t border-slate-50 hover:bg-slate-50">
                            <td className="py-4 font-bold">{c.percent}%</td>
                            <td className="py-4 text-slate-500">{formatCurrency(c.monthlyAmount)}</td>
                            <td className={`py-4 font-bold text-right ${c.yearsNeeded <= desiredYears ? 'text-emerald-600' : 'text-slate-400'}`}>{isFinite(c.yearsNeeded) ? `${c.yearsNeeded.toFixed(1)} anos` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-8 uppercase text-slate-900 flex items-center gap-3"><ScrollIcon /> Projeção de Acumulação (7% a.a.)</h3>
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <div className="w-3 h-3 border border-slate-300 border-dashed"></div>
                <p className="text-[10px] text-slate-500 font-medium">As linhas pontilhadas representam desvios de ±1% e ±2% sobre a taxa base de 7%, indicando a variabilidade provável da carteira.</p>
              </div>
              <LineChart data={progressionData} goalValue={goalValue} deviations={standardDeviations} />
            </div>

            <div className="flex flex-col gap-6 items-center justify-center no-print">
              <PixelButton onClick={() => setStep(6)} className="max-w-md">GERAR RELATÓRIO FINAL</PixelButton>
              <button onClick={() => setStep(4)} className="text-slate-400 hover:text-slate-800 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors border-b border-transparent hover:border-slate-500">Voltar à Matriz</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in fade-in zoom-in duration-1000 space-y-12 pb-24">
            <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto border-[1px] border-slate-200 print-area">
              {/* Report Header */}
              <div className="bg-slate-900 text-white p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4"><GlobeIcon /></div>
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Relatório de Estratégia Patrimonial</h1>
                <div className="flex justify-center items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                  <span>Privado & Confidencial</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span>R Anjos Consultoria</span>
                </div>
              </div>

              <div className="p-10 sm:p-16 space-y-16">
                {/* 01. Executive Summary */}
                <section>
                  <h3 className="text-xs font-bold uppercase text-[#C5A059] tracking-[0.3em] mb-8 border-b border-slate-100 pb-2">01. Sumário Executivo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-slate-500 text-sm font-light leading-relaxed">
                        Este documento apresenta a análise técnica para a meta de renda passiva de 
                        <strong className="text-slate-900"> {formatCurrency((parseFloat(monthlyRetirementIncome)||0)/100)}/mês</strong>. 
                        O diagnóstico revela que o plano atual é <span className={`font-bold ${isPossible ? 'text-emerald-600' : 'text-rose-600'}`}>{isPossible ? 'VIÁVEL' : 'DESAFIADOR'}</span> dentro do horizonte projetado de {desiredYears} anos.
                      </p>
                      <div className="flex gap-4">
                         <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">Status</p>
                            <p className={`text-sm font-bold ${isPossible ? 'text-emerald-600' : 'text-rose-600'}`}>{isPossible ? 'Em Conformidade' : 'Requer Ajuste'}</p>
                         </div>
                         <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[8px] uppercase text-slate-400 font-bold mb-1">Horizonte</p>
                            <p className="text-sm font-bold text-slate-900">{desiredYears} Anos</p>
                         </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <p className="text-[9px] uppercase font-bold text-slate-400 mb-4 tracking-widest">Patrimônio Alvo Necessário</p>
                      <p className="text-4xl font-bold text-slate-900">{formatCurrency(goalValue)}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">Cálculo baseado na Regra dos 4% (Conservadorismo Internacional)</p>
                    </div>
                  </div>
                </section>

                {/* 02. Technical Comparison */}
                <section>
                  <h3 className="text-xs font-bold uppercase text-[#C5A059] tracking-[0.3em] mb-8 border-b border-slate-100 pb-2">02. Análise de Acúmulo e Risco</h3>
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <h4 className="text-sm font-bold uppercase text-slate-800 flex items-center gap-2"><ScrollIcon /> Projeção de Capital (Base 7%)</h4>
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full border border-emerald-100">PROBABILIDADE ALTA</span>
                    </div>
                    <LineChart data={progressionData} goalValue={goalValue} deviations={standardDeviations} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] uppercase text-slate-400 font-bold mb-2">Capital Final (7%)</p>
                       <p className="text-lg font-bold text-slate-900">{formatCurrency(finalValueAtEnd)}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] uppercase text-slate-400 font-bold mb-2">Renda Mensal (4%)</p>
                       <p className="text-lg font-bold text-[#C5A059]">{formatCurrency(possibleDreamIncome)}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] uppercase text-slate-400 font-bold mb-2">Tempo p/ Alvo</p>
                       <p className={`text-lg font-bold ${isPossible ? 'text-emerald-600' : 'text-rose-600'}`}>{yearsNeeded.toFixed(1)} anos</p>
                    </div>
                  </div>
                </section>

                {/* 03. Strategic Roadmap */}
                <section>
                  <h3 className="text-xs font-bold uppercase text-[#C5A059] tracking-[0.3em] mb-8 border-b border-slate-100 pb-2">03. Diretrizes R Anjos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                      <div className="flex items-center gap-3"><GlobeIcon /><h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-900">Estratégia Offshore</h4></div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Recomendamos a alocação de 100% dos aportes excedentes em ativos dolarizados para garantir a manutenção do poder de compra 
                        diante do Patrimônio Alvo de <span className="font-bold">{formatCurrency(goalValue)}</span>.
                      </p>
                    </div>
                    <div className="p-8 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4">
                      <div className="flex items-center gap-3"><SeniorIcon /><h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-900">Plano de Ajuste</h4></div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isPossible 
                          ? "Manter disciplina nos aportes. O foco deve ser a otimização tributária da sucessão."
                          : `Sugerimos elevar o aporte para ${formatCurrency((contributionsByPercent.find(c => c.percent === 30)?.monthlyAmount || 0))} (30% da renda) para antecipar a meta.`
                        }
                      </p>
                    </div>
                  </div>
                </section>

                {/* 04. Fale com sua Assessoria Private */}
                <section>
                  <h3 className="text-xs font-bold uppercase text-[#C5A059] tracking-[0.3em] mb-8 border-b border-slate-100 pb-2">04. Fale com sua Assessoria Private</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => window.open('https://wa.me/seu-numero-aqui?text=Olá, gostaria de saber mais sobre Offshore BVI', '_blank')}
                      className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 text-left hover:border-[#C5A059] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <VaultIcon />
                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight group-hover:text-[#C5A059]">Offshore BVI — 7k USD</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">Faça o seu planejamento sucessório com trust e offshore company nas Ilhas Virgens Britânicas (BVI).</p>
                    </button>

                    <button 
                      onClick={() => window.open('https://wa.me/seu-numero-aqui?text=Olá, gostaria de saber mais sobre taxas de Câmbio Private', '_blank')}
                      className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 text-left hover:border-[#C5A059] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <CoinIcon />
                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight group-hover:text-[#C5A059]">Câmbio — Spread 0,4%</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">O menor spread do mercado institucional disponível para clientes private, garantindo eficiência na remessa.</p>
                    </button>

                    <button 
                      onClick={() => window.open('https://wa.me/seu-numero-aqui?text=Olá, gostaria de saber mais sobre Consultoria de Investimentos Internacionais', '_blank')}
                      className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 text-left hover:border-[#C5A059] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon />
                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight group-hover:text-[#C5A059]">Investimentos Inter. — 4k USD</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">Abertura de conta em corretora internacional e gestão ativa da carteira focada em juros compostos em dólar.</p>
                    </button>

                    <button 
                      onClick={() => window.open('https://wa.me/seu-numero-aqui?text=Olá, gostaria de agendar uma reunião de Consultoria Sênior', '_blank')}
                      className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 text-left hover:border-[#C5A059] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <SeniorIcon />
                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight group-hover:text-[#C5A059]">Consultoria Sênior — 300 USD/h</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">Sessão individual com um de nossos planejadores sêniores para análise técnica e estratégica personalizada.</p>
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* Print / Save Actions */}
            <div className="flex flex-col gap-6 items-center no-print">
               <button 
                  onClick={handlePrint}
                  className="w-full max-w-4xl flex items-center justify-center gap-3 bg-indigo-600 text-white rounded-2xl py-5 font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
               >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Imprimir / Salvar Relatório em PDF
               </button>
               <button onClick={() => { setStep(1); setTypingComplete(false); }} className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.4em] hover:text-slate-900 text-center">Reiniciar Diagnóstico</button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="max-w-4xl mx-auto text-center py-12 text-slate-400 no-print">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">R Anjos Consultoria &bull; Estratégias Internacionais &bull; 2025</p>
      </footer>
    </div>
  );
};

export default App;
