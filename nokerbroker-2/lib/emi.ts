// lib/emi.ts
export function calculateEmi(principal: number, annualInterestRate: number, tenureYears: number): number {
  if (!principal || !annualInterestRate || !tenureYears) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return Math.round(emi);
}

export function calculateLoanBreakdown(principal: number, annualInterestRate: number, tenureYears: number) {
  const emi = calculateEmi(principal, annualInterestRate, tenureYears);
  const totalPayment = emi * tenureYears * 12;
  const totalInterest = totalPayment - principal;
  return {
    monthlyEmi: emi,
    totalInterest: Math.max(0, Math.round(totalInterest)),
    totalPayment: Math.max(0, Math.round(totalPayment)),
  };
}
