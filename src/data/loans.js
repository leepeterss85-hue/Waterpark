// Loans & debt system for the water park tycoon.
// Players can take loans to fund construction or expansion, with
// daily payments deducted from income until the loan is repaid.

export const LOAN_TERMS = [
  { id: "short", name: "Short-term", termDays: 10, interestRate: 0.05, minAmount: 5000, maxAmount: 50000 },
  { id: "medium", name: "Medium-term", termDays: 20, interestRate: 0.10, minAmount: 10000, maxAmount: 100000 },
  { id: "long", name: "Long-term", termDays: 30, interestRate: 0.15, minAmount: 20000, maxAmount: 200000 },
];

export const MAX_ACTIVE_LOANS = 3;

export function createLoan(amount, termId, day) {
  const term = LOAN_TERMS.find((t) => t.id === termId);
  if (!term) return null;
  if (amount < term.minAmount || amount > term.maxAmount) return null;
  const totalInterest = Math.round(amount * term.interestRate);
  const totalRepayable = amount + totalInterest;
  const dailyPayment = Math.ceil(totalRepayable / term.termDays);
  return {
    id: `loan-${day}-${Math.random().toString(36).slice(2, 7)}`,
    principal: amount,
    interestRate: term.interestRate,
    termDays: term.termDays,
    daysRemaining: term.termDays,
    dailyPayment,
    totalRepayable,
    totalPaid: 0,
    takenDay: day,
  };
}

export function simulateLoans(loans, day) {
  let loanPayment = 0;
  const updatedLoans = [];
  const logEntries = [];
  for (const loan of (loans || [])) {
    if (loan.daysRemaining <= 0) {
      updatedLoans.push(loan);
      continue;
    }
    loanPayment += loan.dailyPayment;
    const newDaysRemaining = loan.daysRemaining - 1;
    const newTotalPaid = loan.totalPaid + loan.dailyPayment;
    if (newDaysRemaining <= 0) {
      updatedLoans.push({ ...loan, daysRemaining: 0, totalPaid: loan.totalRepayable, paidOff: true, paidOffDay: day });
      logEntries.push({ day, text: `Day ${day}: 💰 Loan paid off! £${loan.totalRepayable.toLocaleString()} fully repaid.` });
    } else {
      updatedLoans.push({ ...loan, daysRemaining: newDaysRemaining, totalPaid: newTotalPaid });
    }
  }
  return { updatedLoans, loanPayment, logEntries };
}