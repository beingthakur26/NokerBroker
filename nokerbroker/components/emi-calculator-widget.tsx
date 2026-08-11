"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatINR } from "@/lib/properties";

export function EmiCalculatorWidget() {
  const [loanAmount, setLoanAmount] = useState(8_000_000);
  const [tenure, setTenure] = useState(20);
  const [rate, setRate] = useState(8.5);

  function singleValue(
    value: number | readonly number[],
    fallback: number
  ): number {
    return typeof value === "number" ? value : value[0] ?? fallback;
  }

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    const emi =
      monthlyRate === 0
        ? loanAmount / months
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
    return {
      emi,
      totalInterest: emi * months - loanAmount,
      totalPayable: emi * months,
    };
  }, [loanAmount, tenure, rate]);

  return (
    <div className="emi-card">
      <div className="emi-row">
        <div className="emi-row-head">
          <span>Loan amount</span>
          <span>{formatINR(loanAmount)}</span>
        </div>
        <Slider
          min={1_000_000}
          max={30_000_000}
          step={100_000}
          value={[loanAmount]}
          onValueChange={(value) => setLoanAmount(singleValue(value, loanAmount))}
          aria-label="Loan amount"
        />
      </div>

      <div className="emi-row">
        <div className="emi-row-head">
          <span>Tenure</span>
          <span>{tenure} yrs</span>
        </div>
        <Slider
          min={5}
          max={30}
          step={1}
          value={[tenure]}
          onValueChange={(value) => setTenure(singleValue(value, tenure))}
          aria-label="Loan tenure in years"
        />
      </div>

      <div className="emi-row">
        <div className="emi-row-head">
          <span>Interest rate</span>
          <span>{rate.toFixed(1)}%</span>
        </div>
        <Slider
          min={6}
          max={12}
          step={0.1}
          value={[rate]}
          onValueChange={(value) => setRate(singleValue(value, rate))}
          aria-label="Interest rate"
        />
      </div>

      <div className="emi-result">
        <span>Monthly EMI</span>
        <b>{formatINR(emi)}</b>
      </div>

      <div className="emi-total">
        <div>
          <span>Total payable</span>
          <b>{formatINR(totalPayable)}</b>
        </div>
        <div>
          <span>Total interest</span>
          <b>{formatINR(totalInterest)}</b>
        </div>
      </div>
    </div>
  );
}
