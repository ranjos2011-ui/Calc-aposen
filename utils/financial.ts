
export const formatCurrency = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateFutureValue = (
  initialValue: number,
  monthlyContribution: number,
  years: number,
  annualRate: number
): number => {
  if (annualRate <= -100) return initialValue + monthlyContribution * years * 12;
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const months = years * 12;

  if (monthlyRate === 0) {
    return initialValue + monthlyContribution * months;
  }

  const futureValueOfInitial = initialValue * Math.pow(1 + monthlyRate, months);
  const futureValueOfContributions =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return futureValueOfInitial + futureValueOfContributions;
};

export interface MonthlyData {
  month: number;
  interest: number;
  totalInvested: number;
  totalInterest: number;
  totalAccumulated: number;
}

export const calculateFutureValueProgression = (
  initialValue: number,
  monthlyContribution: number,
  years: number,
  annualRate: number
): MonthlyData[] => {
  if (annualRate < -100 || years <= 0) return [];
  
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const months = Math.floor(years * 12);
  const progression: MonthlyData[] = [];

  let currentBalance = initialValue;
  let totalInterest = 0;

  progression.push({
    month: 0,
    interest: 0,
    totalInvested: initialValue,
    totalInterest: 0,
    totalAccumulated: initialValue,
  });

  for (let i = 1; i <= months; i++) {
    const interestEarned = currentBalance * monthlyRate;
    currentBalance += interestEarned;
    currentBalance += monthlyContribution;
    totalInterest += interestEarned;

    progression.push({
      month: i,
      interest: interestEarned,
      totalInvested: initialValue + monthlyContribution * i,
      totalInterest: totalInterest,
      totalAccumulated: currentBalance,
    });
  }
  return progression;
};

export const calculateFutureValueProgressionWithCosts = (
  initialValue: number,
  monthlyContribution: number,
  years: number,
  annualRate: number,
  annualFixedCost: number,
  annualVariableCostPercent: number
): MonthlyData[] => {
  if (annualRate < -100 || years <= 0) return [];
  
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const months = Math.floor(years * 12);
  const progression: MonthlyData[] = [];

  let currentBalance = initialValue;
  let totalInterest = 0;

  progression.push({
    month: 0,
    interest: 0,
    totalInvested: initialValue,
    totalInterest: 0,
    totalAccumulated: initialValue,
  });

  for (let i = 1; i <= months; i++) {
    const interestEarned = currentBalance * monthlyRate;
    currentBalance += interestEarned;
    currentBalance += monthlyContribution;
    totalInterest += interestEarned;

    // Apply annual costs at the end of each year
    if (i > 0 && i % 12 === 0) {
      const variableCost = currentBalance * (annualVariableCostPercent / 100);
      currentBalance -= annualFixedCost;
      currentBalance -= variableCost;
    }

    progression.push({
      month: i,
      interest: interestEarned,
      totalInvested: initialValue + monthlyContribution * i,
      totalInterest: totalInterest,
      totalAccumulated: currentBalance,
    });
  }
  return progression;
};


export const calculateYearsToGoal = (
  initialValue: number,
  monthlyContribution: number,
  goalValue: number,
  annualRate: number
): number => {
    if (initialValue >= goalValue) {
        return 0;
    }
    if (annualRate <= -100) return Infinity;
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  
    if (monthlyRate === 0) {
        if (monthlyContribution <= 0 && initialValue < goalValue) return Infinity;
        if (monthlyContribution > 0) return (goalValue - initialValue) / (monthlyContribution * 12);
        return 0;
    }
    
    // Check if goal is reachable
    if (monthlyContribution <= 0 && initialValue * Math.pow(1 + monthlyRate, 1200) < goalValue) {
        // If after 100 years it's not reached with no contributions, consider it infinite
        return Infinity;
    }


    const logNumerator = (goalValue * monthlyRate + monthlyContribution);
    const logDenominator = (initialValue * monthlyRate + monthlyContribution);
    
    if (logNumerator <= 0 || logDenominator <= 0 || logNumerator < logDenominator) {
        return Infinity;
    }

    const months = Math.log(logNumerator / logDenominator) / Math.log(1 + monthlyRate);
    return months / 12;
};

export const calculateYearsToGoalWithCosts = (
  initialValue: number,
  monthlyContribution: number,
  goalValue: number,
  annualRate: number,
  annualFixedCost: number,
  annualVariableCostPercent: number
): number => {
  if (initialValue >= goalValue) {
    return 0;
  }

  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const maxMonths = 100 * 12; // 100 years limit to prevent infinite loops

  let currentBalance = initialValue;

  for (let month = 1; month <= maxMonths; month++) {
    // Add interest for the month
    currentBalance += currentBalance * monthlyRate;
    // Add monthly contribution
    currentBalance += monthlyContribution;

    // Apply annual costs at the end of each year
    if (month % 12 === 0) {
      const variableCost = currentBalance * (annualVariableCostPercent / 100);
      currentBalance -= annualFixedCost;
      currentBalance -= variableCost;
    }

    // If balance becomes negative, it's unlikely to reach the goal
    if (currentBalance < 0 && monthlyContribution <= 0) {
        return Infinity;
    }

    if (currentBalance >= goalValue) {
      return month / 12;
    }
  }

  return Infinity; // Goal not reached within the time limit
};


export const calculateMonthlyContribution = (
  initialValue: number,
  goalValue: number,
  years: number,
  annualRate: number
): number => {
  if (annualRate <= -100) return Infinity;
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const months = years * 12;

  if (months <= 0) {
      return initialValue >= goalValue ? 0 : Infinity;
  }

  const futureValueOfInitial = initialValue * Math.pow(1 + monthlyRate, months);
  if (futureValueOfInitial >= goalValue) {
      return 0;
  }

  if (monthlyRate === 0) {
    return (goalValue - initialValue) / months;
  }

  const numerator = goalValue - futureValueOfInitial;
  const denominator = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  
  if (denominator === 0) return Infinity;

  return numerator / denominator;
};

export const calculateMonthlyContributionWithCosts = (
  initialValue: number,
  goalValue: number,
  years: number,
  annualRate: number,
  annualFixedCost: number,
  annualVariableCostPercent: number
): number => {
  const getFinalValue = (monthlyContribution: number): number => {
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const months = years * 12;
    let currentBalance = initialValue;

    for (let i = 1; i <= months; i++) {
      currentBalance += currentBalance * monthlyRate;
      currentBalance += monthlyContribution;
      if (i > 0 && i % 12 === 0) {
        const variableCost = currentBalance * (annualVariableCostPercent / 100);
        currentBalance -= annualFixedCost;
        currentBalance -= variableCost;
      }
    }
    return currentBalance;
  };

  if (years <= 0) return initialValue >= goalValue ? 0 : Infinity;

  const finalValueWithoutContributions = getFinalValue(0);
  if (finalValueWithoutContributions >= goalValue) {
    return 0;
  }

  if (getFinalValue(goalValue) < goalValue) {
    return Infinity;
  }

  let low = 0;
  let high = goalValue;
  
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const finalValue = getFinalValue(mid);

    if (finalValue < goalValue) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return high;
};
