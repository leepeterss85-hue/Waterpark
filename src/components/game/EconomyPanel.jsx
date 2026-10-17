import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, CreditCard, Wallet, Building2, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ATTRACTIONS, getParkItem } from "@/data/gameData";
import { LOAN_TERMS } from "@/data/loans";

const FOOD_IDS = ["dining", "coffee_bar"];
const SHOP_IDS = ["retail", "photo_kiosk"];

export default function EconomyPanel({ history, money, day, grid, loans, onTakeLoan, onRepayLoan, sandbox }) {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [loanTerm, setLoanTerm] = useState("medium");

  const last = history?.[history.length - 1];
  const activeLoans = (loans || []).filter((l) => !l.paidOff);

  const income = useMemo(() => {
    if (!last) return null;
    let attrPot = 0, foodPot = 0, shopPot = 0, otherPot = 0;
    for (const id of (grid || [])) {
      if (!id) continue;
      const item = getParkItem(id);
      if (!item?.income) continue;
      if (item.category === "attraction") attrPot += item.income;
      else if (FOOD_IDS.includes(id)) foodPot += item.income;
      else if (SHOP_IDS.includes(id)) shopPot += item.income;
      else otherPot += item.income;
    }
    const total = attrPot + foodPot + shopPot + otherPot || 1;
    const ri = last.rideIncome || 0;
    return {
      ticketRevenue: last.ticketRevenue || 0,
      attractionIncome: Math.round((ri * attrPot) / total),
      foodIncome: Math.round((ri * foodPot) / total),
      shopIncome: Math.round((ri * shopPot) / total),
      otherIncome: Math.round((ri * otherPot) / total),
      hotelIncome: last.hotelRevenue || 0,
      membershipIncome: (last.membershipRevenue || 0) + (last.memberSpend || 0),
      eventIncome: last.eventRevenue || 0,
    };
  }, [last, grid]);

  const totalIncome = income ? Object.values(income).reduce((s, v) => s + v, 0) : 0;

  const expenses = last
    ? {
        upkeep: last.upkeep || 0,
        wages: last.wages || 0,
        utilities: last.utilities || 0,
        marketing: last.marketing || 0,
        premium: last.premium || 0,
        hotelExpenses: last.hotelExpenses || 0,
        emergencyCost: last.emergencyCost || 0,
        loanPayment: last.loanPayment || 0,
      }
    : {};
  const totalExpenses = Object.values(expenses).reduce((s, v) => s + v, 0);
  const net = last?.net || 0;

  const assetValue = (grid || []).reduce((sum, id) => {
    if (!id) return sum;
    const item = getParkItem(id);
    return sum + (item?.cost || 0);
  }, 0);
  const outstandingDebt = activeLoans.reduce(
    (sum, loan) => sum + Math.max(0, (loan.totalRepayable || 0) - (loan.totalPaid || 0)),
    0
  );
  const businessValue = Math.max(0, money + assetValue - outstandingDebt);
  const recentHistory = (history || []).slice(-7);
  const averageDailyProfit = recentHistory.length
    ? Math.round(recentHistory.reduce((sum, h) => sum + (h.net || 0), 0) / recentHistory.length)
    : 0;
  const operatingMargin = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;
  const breakEvenDays = averageDailyProfit > 0 ? Math.ceil(Math.max(0, assetValue - money) / averageDailyProfit) : null;

  const chartData = (history || []).slice(-20).map((h) => ({
    day: `D${h.day}`,
    Income: Math.round((h.income || 0) / 1000),
    Expenses: Math.round(
      ((h.upkeep || 0) + (h.wages || 0) + (h.utilities || 0) + (h.marketing || 0) + (h.premium || 0) + (h.hotelExpenses || 0) + (h.emergencyCost || 0) + (h.loanPayment || 0)) / 1000
    ),
  }));

  const assetPerformance = useMemo(() => {
    const candidates = (grid || []).map((id, index) => {
      if (!id) return null;
      const item = getParkItem(id);
      if (!item || item.category === "environment" || !item.cost || !item.income) return null;
      return { id, index, name: item.name, cost: item.cost, baseIncome: item.income, maintenance: item.maintenance || 0 };
    }).filter(Boolean);
    if (!candidates.length) return [];
    const incomeWeight = candidates.reduce((sum, item) => sum + item.baseIncome, 0) || 1;
    return candidates.map((item) => {
      const estimatedRevenue = Math.round((last?.rideIncome || 0) * (item.baseIncome / incomeWeight));
      const contribution = estimatedRevenue - item.maintenance;
      const dailyRoi = item.cost > 0 ? (contribution / item.cost) * 100 : 0;
      const paybackDays = contribution > 0 ? Math.ceil(item.cost / contribution) : null;
      return { ...item, estimatedRevenue, contribution, dailyRoi, paybackDays };
    }).sort((a, b) => b.contribution - a.contribution).slice(0, 5);
  }, [grid, last]);

  const expansionPlan = useMemo(() => {
    const owned = new Set((grid || []).filter(Boolean));
    const candidates = ATTRACTIONS
      .filter((item) => !owned.has(item.id) && item.cost > 0)
      .map((item) => {
        const contribution = Math.max(0, (item.income || 0) - (item.maintenance || 0));
        const roi = item.cost > 0 ? (contribution / item.cost) * 100 : 0;
        return { ...item, contribution, roi, affordable: money >= item.cost };
      })
      .filter((item) => item.contribution > 0)
      .sort((a, b) => b.roi - a.roi);
    const affordable = candidates.find((item) => item.affordable);
    const target = affordable || candidates[0] || null;
    const healthyBuffer = target ? money - target.cost >= Math.max(5000, target.cost * 0.2) : false;
    return { target, affordable: Boolean(affordable), healthyBuffer };
  }, [grid, money]);

  const nextMilestone = useMemo(() => {
    const milestones = [25, 50, 75, 100, 150, 200, 250, 365, 500];
    const next = milestones.find((value) => day < value);
    if (!next) return { day: 500, progress: 100 };
    const previous = milestones.filter((value) => value < next).pop() || 1;
    return { day: next, progress: Math.max(0, Math.min(100, ((day - previous) / (next - previous)) * 100)) };
  }, [day]);

  const strategy = useMemo(() => {
    const debtService = last?.loanPayment || 0;
    const debtRatio = totalIncome > 0 ? (debtService / totalIncome) * 100 : 0;
    const assetConcentration = assetValue > 0 && assetPerformance.length
      ? Math.round((assetPerformance[0].cost / assetValue) * 100)
      : 0;
    const warnings = [];
    if (debtRatio >= 25) warnings.push({ tone: "rose", title: "Debt pressure", text: "Loan payments are consuming a large share of daily income. Prioritise cash flow before taking another loan." });
    else if (debtRatio >= 12) warnings.push({ tone: "amber", title: "Watch leverage", text: "Debt is noticeable. Keep a cash buffer before your next major expansion." });
    if (operatingMargin < 10 && totalIncome > 0) warnings.push({ tone: "amber", title: "Thin margins", text: "Improve pricing, attendance or staffing efficiency before adding expensive assets." });
    if (averageDailyProfit > 0 && debtRatio < 12) warnings.push({ tone: "emerald", title: "Expansion window", text: "Cash flow is healthy enough to consider a new attraction or park expansion." });
    if (assetConcentration >= 35) warnings.push({ tone: "sky", title: "Concentration risk", text: "A large share of your assets is tied to one investment. Diversify attractions and guest spending." });
    if (!warnings.length) warnings.push({ tone: "slate", title: "Management stable", text: "No major financial warning detected. Keep reinvesting into high-return assets." });
    return { debtRatio, assetConcentration, warnings };
  }, [last, totalIncome, assetValue, assetPerformance, operatingMargin, averageDailyProfit]);

  const incomeItems = income
    ? [
        { label: "Ticket Sales", value: income.ticketRevenue },
        { label: "Attractions", value: income.attractionIncome },
        { label: "Food & Beverage", value: income.foodIncome },
        { label: "Retail & Shops", value: income.shopIncome },
        { label: "Other Facilities", value: income.otherIncome },
        { label: "Hotel & Resort", value: income.hotelIncome },
        { label: "Memberships", value: income.membershipIncome },
        { label: "Events", value: income.eventIncome },
      ].filter((i) => i.value > 0)
    : [];

  const expenseItems = [
    { label: "Attraction Maintenance", value: expenses.upkeep },
    { label: "Staff Wages", value: expenses.wages },
    { label: "Utilities", value: expenses.utilities },
    { label: "Marketing", value: expenses.marketing },
    { label: "Hotel Expenses", value: expenses.hotelExpenses },
    { label: "Emergency Costs", value: expenses.emergencyCost },
    { label: "Loan Payments", value: expenses.loanPayment },
    { label: "Priority Pass", value: expenses.premium },
  ].filter((i) => i.value > 0);

  const selectedTerm = LOAN_TERMS.find((t) => t.id === loanTerm);
  const loanInterest = selectedTerm ? Math.round(loanAmount * selectedTerm.interestRate) : 0;
  const loanTotal = loanAmount + loanInterest;
  const loanDaily = selectedTerm ? Math.ceil(loanTotal / selectedTerm.termDays) : 0;

  if (!last) {
    return (
      <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
        <Wallet className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        Play a day to see your park's economy data.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Net P/L */}
      <div className={`rounded-2xl p-4 text-center £{net >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Today's Profit / Loss</div>
        <div className={`text-2xl font-black ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {net >= 0 ? "+" : ""}£{Math.round(net).toLocaleString()}
        </div>
        <div className="mt-1.5 flex justify-center gap-4 text-[11px] font-bold">
          <span className="text-emerald-600">Income £{totalIncome.toLocaleString()}</span>
          <span className="text-rose-600">Expenses £{totalExpenses.toLocaleString()}</span>
        </div>
      </div>

      {/* Business / tycoon metrics */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-black text-slate-900">
          <Building2 className="h-4 w-4 text-indigo-500" /> Business Overview
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white p-2.5 shadow-sm"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Business Value</div><div className="text-base font-black text-indigo-600">${businessValue.toLocaleString()}</div></div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Park Assets</div><div className="text-base font-black text-slate-800">${assetValue.toLocaleString()}</div></div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">7-Day Avg Profit</div><div className={`text-base font-black ${averageDailyProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{averageDailyProfit >= 0 ? "+" : ""}£{averageDailyProfit.toLocaleString()}</div></div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Operating Margin</div><div className={`text-base font-black ${operatingMargin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{operatingMargin}%</div></div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-indigo-100/60 px-2.5 py-2 text-[10px] font-bold text-indigo-700">
          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {breakEvenDays ? `~${breakEvenDays} days to recover invested capital` : "Grow daily profit to accelerate expansion"}</span>
          {outstandingDebt > 0 && <span>Debt ${outstandingDebt.toLocaleString()}</span>}
        </div>
      </div>

      {/* Asset performance / investment decisions */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
        <div className="mb-3 flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-widest text-sky-600">CEO Report</div><h3 className="mt-0.5 text-sm font-black text-slate-900">30-Day Management Review</h3></div><TrendingUp className="h-4 w-4 text-sky-500" /></div>
        {(() => {
          const current = (history || []).slice(-30), previous = (history || []).slice(-60, -30);
          const sum = (rows, key) => rows.reduce((s, h) => s + (h[key] || 0), 0);
          const profit = sum(current, "net"), oldProfit = sum(previous, "net"), guestsNow = sum(current, "guests"), guestsOld = sum(previous, "guests");
          const profitChange = oldProfit ? Math.round(((profit - oldProfit) / Math.abs(oldProfit)) * 100) : null;
          const guestChange = guestsOld ? Math.round(((guestsNow - guestsOld) / guestsOld) * 100) : null;
          const bestDay = current.reduce((best, h) => !best || (h.net || 0) > (best.net || 0) ? h : best, null);
          const advice = profit < 0 ? "Cash flow is negative. Stabilise operations and pricing before expanding." : profitChange != null && profitChange < -10 ? "Profit is slipping. Review queues, pricing and operating costs before investing." : guestChange != null && guestChange > 10 ? "Guest demand is accelerating. Upgrade your strongest attractions." : "Performance is stable. Keep a cash buffer and prioritise high-return investments.";
          return <><div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-100"><div className="text-[8px] font-black uppercase text-slate-400">30-Day Profit</div><div className={"mt-0.5 text-sm font-black " + (profit >= 0 ? "text-emerald-600" : "text-rose-600")}>{profit >= 0 ? "+" : ""}£{Math.round(profit).toLocaleString()}</div><div className="text-[8px] text-slate-400">{profitChange == null ? "Building baseline" : (profitChange >= 0 ? "+" : "") + profitChange + "% vs prior"}</div></div>
            <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-100"><div className="text-[8px] font-black uppercase text-slate-400">30-Day Guests</div><div className="mt-0.5 text-sm font-black text-slate-800">{Math.round(guestsNow).toLocaleString()}</div><div className="text-[8px] text-slate-400">{guestChange == null ? "Building baseline" : (guestChange >= 0 ? "+" : "") + guestChange + "% vs prior"}</div></div>
            <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-100"><div className="text-[8px] font-black uppercase text-slate-400">Best Day</div><div className="mt-0.5 text-sm font-black text-indigo-600">{bestDay ? "Day " + bestDay.day : "—"}</div><div className="text-[8px] text-slate-400">{bestDay ? "£" + Math.round(bestDay.net || 0).toLocaleString() + " profit" : "No history"}</div></div>
            <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-100"><div className="text-[8px] font-black uppercase text-slate-400">Period</div><div className="mt-0.5 text-sm font-black text-slate-800">{current.length} days</div><div className="text-[8px] text-slate-400">Current day {day}</div></div>
          </div><div className="mt-2 rounded-lg bg-sky-100/70 px-2.5 py-2 text-[10px] font-bold leading-4 text-sky-800">{advice}</div></>;
        })()}
      </div>

      {assetPerformance.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-black text-slate-900">
            <TrendingUp className="h-4 w-4 text-amber-500" /> Investment Performance
          </h3>
          <p className="mb-3 text-[10px] font-medium text-slate-500">Estimated daily contribution from your highest-value revenue assets.</p>
          <div className="space-y-1.5">
            {assetPerformance.map((item, index) => (
              <div key={item.index} className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-amber-100/70">
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[9px] font-black text-amber-700">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-black text-slate-700">{item.name}</span>
                  <span className={item.contribution >= 0 ? "text-[10px] font-black text-emerald-600" : "text-[10px] font-black text-rose-600"}>
                    {item.contribution >= 0 ? "+" : ""}${item.contribution.toLocaleString()}/day
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-400">
                  <span>ROI {item.dailyRoi >= 0 ? "+" : ""}{item.dailyRoi.toFixed(1)}%/day</span>
                  <span>{item.paybackDays ? "Payback ~" + item.paybackDays + "d" : "Not paying back yet"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
        <h3 className="mb-1 flex items-center gap-1.5 text-sm font-black text-slate-900">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Expansion Plan
        </h3>
        {expansionPlan.target ? (
          <>
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-black text-slate-700">Next candidate: {expansionPlan.target.name}</span>
                <span className="shrink-0 text-[10px] font-black text-emerald-600">ROI {expansionPlan.target.roi.toFixed(1)}%</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500">Cost £{expansionPlan.target.cost.toLocaleString()} · estimated contribution £{expansionPlan.target.contribution.toLocaleString()}/day</div>
            </div>
            <div className="mt-2 rounded-lg bg-emerald-100/70 px-2.5 py-2 text-[10px] font-bold text-emerald-800">
              {expansionPlan.affordable
                ? (expansionPlan.healthyBuffer ? "Affordable with a healthy cash buffer. Good time to expand." : "Affordable, but protect a cash buffer before building.")
                : "Build cash first, or compare this return against a carefully sized loan."}
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">No positive-return attraction is available yet. Focus on improving attendance and cash flow.</div>
        )}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wide text-slate-400">
            <span>Long-term milestone</span><span>Day {day} / {nextMilestone.day}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white ring-1 ring-emerald-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: nextMilestone.progress + "%" }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-1 flex items-center gap-1.5 text-sm font-black text-slate-900">
          <Target className="h-4 w-4" /> CEO Strategy Desk
        </h3>
        <p className="mb-3 text-[10px] font-medium text-slate-500">Use these signals to decide when to borrow, expand or reinvest.</p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <div className="text-[9px] font-bold uppercase text-slate-400">Debt service</div>
            <div className="text-sm font-black text-slate-800">{strategy.debtRatio.toFixed(1)}%</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <div className="text-[9px] font-bold uppercase text-slate-400">Top asset share</div>
            <div className="text-sm font-black text-slate-800">{strategy.assetConcentration}%</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {strategy.warnings.map((w, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
              <div className="text-[10px] font-black text-slate-700">{w.title}</div>
              <div className="mt-0.5 text-[10px] leading-4 text-slate-500">{w.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Income */}      {incomeItems.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Income Breakdown
          </h3>
          <div className="space-y-1">
            {incomeItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs shadow-sm">
                <span className="font-bold text-slate-600">{item.label}</span>
                <span className="font-black text-emerald-600">${item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-2 text-xs">
              <span className="font-black text-slate-700">Total Income</span>
              <span className="font-black text-emerald-700">£{totalIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expenses */}
      {expenseItems.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
            <TrendingDown className="h-4 w-4 text-rose-500" /> Expense Breakdown
          </h3>
          <div className="space-y-1">
            {expenseItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs shadow-sm">
                <span className="font-bold text-slate-600">{item.label}</span>
                <span className="font-black text-rose-600">${item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-rose-50 p-2 text-xs">
              <span className="font-black text-slate-700">Total Expenses</span>
              <span className="font-black text-rose-700">£{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loans */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
          <CreditCard className="h-4 w-4 text-violet-500" /> Loans & Debt
        </h3>
        {activeLoans.length > 0 ? (
          <div className="space-y-2">
            {activeLoans.map((loan) => {
              const remaining = loan.totalRepayable - loan.totalPaid;
              const progress = (loan.totalPaid / loan.totalRepayable) * 100;
              return (
                <div key={loan.id} className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">${loan.principal.toLocaleString()} loan</span>
                    <span className="text-[10px] font-bold text-violet-600">{loan.daysRemaining}d left</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/60">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Daily: £{loan.dailyPayment}</span>
                    <span>Remaining: ${remaining.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => onRepayLoan(loan.id)}
                    disabled={money < remaining}
                    className="mt-2 w-full rounded-lg bg-violet-500 py-1.5 text-xs font-black text-white transition hover:bg-violet-600 disabled:opacity-40"
                  >
                    Pay off ${remaining.toLocaleString()}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-3 text-center text-[11px] text-slate-500">No active loans.</div>
        )}

        {activeLoans.length < 3 && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <h4 className="text-xs font-black text-slate-700">Take a Loan</h4>
            <div className="mt-2">
              <label className="text-[10px] font-bold text-slate-400">Amount: £{loanAmount.toLocaleString()}</label>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div className="mt-2">
              <label className="text-[10px] font-bold text-slate-400">Term</label>
              <div className="mt-1 flex gap-1">
                {LOAN_TERMS.map((term) => (
                  <button
                    key={term.id}
                    onClick={() => setLoanTerm(term.id)}
                    className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold transition ${loanTerm === term.id ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    {term.termDays}d · {Math.round(term.interestRate * 100)}%
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[10px] font-bold text-slate-500">
              Interest: ${loanInterest.toLocaleString()} · Total: ${loanTotal.toLocaleString()} · Daily: ${loanDaily}
            </div>
            <button
              onClick={() => onTakeLoan(loanAmount, loanTerm)}
              className="mt-2 w-full rounded-lg bg-violet-500 py-2 text-xs font-black text-white transition hover:bg-violet-600"
            >
              Take Loan · +£{loanAmount.toLocaleString()}
            </button>
          </div>
        )}
      </div>

      {/* Cash-flow chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
            <Wallet className="h-4 w-4 text-blue-500" /> Cash-flow History
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white p-3" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}