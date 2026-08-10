"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";

function emiDetails(principal: number, annualRate: number, tenureYears: number) {
  const months = tenureYears * 12;
  const monthlyRate = annualRate / 12 / 100;
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

function buildSchedule(principal: number, annualRate: number, tenureYears: number) {
  const months = tenureYears * 12;
  const monthlyRate = annualRate / 12 / 100;
  const { emi } = emiDetails(principal, annualRate, tenureYears);
  const rows: { month: number; emi: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month: m,
      emi,
      principal: principalPaid,
      interest,
      balance,
    });
  }
  return rows;
}

export default function EmiCalculatorPage() {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, totalPayment, totalInterest } = useMemo(
    () => emiDetails(amount, rate, tenure),
    [amount, rate, tenure]
  );

  const schedule = useMemo(() => buildSchedule(amount, rate, tenure), [amount, rate, tenure]);

  const inr = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Plan your budget</span>
      <h1 className="font-display text-3xl text-ink mt-2">Home loan EMI calculator</h1>
      <p className="text-sm text-ink-soft mt-2">Adjust the sliders to see your monthly payment instantly.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-border rounded-xl2 p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ink">Loan amount</label>
                <span className="font-mono text-sm font-semibold text-orange-deep">₹{inr(amount)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#F4600F]"
              />
              <div className="flex justify-between font-mono text-[10.5px] text-ink-faint mt-1">
                <span>₹1 L</span>
                <span>₹2 Cr</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ink">Interest rate (p.a.)</label>
                <span className="font-mono text-sm font-semibold text-orange-deep">{rate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={6}
                max={14}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-[#F4600F]"
              />
              <div className="flex justify-between font-mono text-[10.5px] text-ink-faint mt-1">
                <span>6%</span>
                <span>14%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ink">Tenure</label>
                <span className="font-mono text-sm font-semibold text-orange-deep">{tenure} years</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-[#F4600F]"
              />
              <div className="flex justify-between font-mono text-[10.5px] text-ink-faint mt-1">
                <span>1 yr</span>
                <span>30 yrs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl2 p-6 flex flex-col">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-soft">Your monthly EMI</p>
          <div className="font-mono text-4xl font-semibold text-ink mt-3">₹{inr(Math.round(emi))}</div>
          <div className="mt-6 space-y-3 border-t border-border pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Principal amount</span>
              <span className="font-mono font-semibold text-ink">₹{inr(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Total interest</span>
              <span className="font-mono font-semibold text-ink">₹{inr(Math.round(totalInterest))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Total payment</span>
              <span className="font-mono font-semibold text-ink">₹{inr(Math.round(totalPayment))}</span>
            </div>
          </div>
          <Link href={`/loans/apply?amount=${Math.round(amount)}`} className="mt-auto pt-6">
            <Button variant="accent" block>Apply for this loan</Button>
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Amortization schedule</h2>
        <p className="text-xs text-ink-soft mt-1">First 12 months shown.</p>
        <div className="mt-4 overflow-x-auto rounded-xl2 border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-mono uppercase tracking-widest text-ink-soft">
                <th className="px-5 py-3.5">Month</th>
                <th className="px-5 py-3.5">EMI</th>
                <th className="px-5 py-3.5">Principal</th>
                <th className="px-5 py-3.5">Interest</th>
                <th className="px-5 py-3.5">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slice(0, 12).map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono text-ink-soft">{row.month}</td>
                  <td className="px-5 py-3 font-mono font-semibold text-ink">₹{inr(Math.round(row.emi))}</td>
                  <td className="px-5 py-3 font-mono text-ink">₹{inr(Math.round(row.principal))}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">₹{inr(Math.round(row.interest))}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">₹{inr(Math.round(row.balance))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
