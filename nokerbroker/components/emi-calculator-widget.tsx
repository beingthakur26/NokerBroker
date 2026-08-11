"use client";

import { useMemo, useState } from "react";

function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function EmiCalculatorWidget() {
  const [loanAmount, setLoanAmount] = useState(8_000_000);
  const [tenure, setTenure] = useState(20);
  const [rate, setRate] = useState(8.5);

  const emi = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    return monthlyRate === 0
      ? loanAmount / months
      : loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  }, [loanAmount, tenure, rate]);

  return (
    <div className="emi-card">
      <div className="emi-row">
        <div className="emi-row-head"><span>Loan amount</span><span>{formatINR(loanAmount)}</span></div>
        <input type="range" min="1000000" max="30000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} aria-label="Loan amount" />
      </div>
      <div className="emi-row">
        <div className="emi-row-head"><span>Tenure (years)</span><span>{tenure}</span></div>
        <input type="range" min="5" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} aria-label="Loan tenure in years" />
      </div>
      <div className="emi-row">
        <div className="emi-row-head"><span>Interest rate</span><span>{rate.toFixed(1)}%</span></div>
        <input type="range" min="6" max="12" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Interest rate" />
      </div>
      <div className="emi-result">
        <span>Monthly EMI</span>
        <b>{formatINR(emi)}</b>
      </div>
    </div>
  );
}
