import React from 'react';
import { Budget, Currency } from '../types/trip';

interface BudgetOverviewProps {
  budget: Budget;
  currency: Currency;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget, currency }) => {
  const formatCost = (val: number) => {
    if (currency === 'EUR') {
      return `€${Math.round(val / 90).toLocaleString()}`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const percentage = Math.min(
    100,
    Math.round((budget.estimated_total / (budget.target_cap || 1)) * 100)
  );

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xs border border-outline-variant/30 flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-semibold">
            Trip Financials
          </span>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
            Budget Allocation
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
          {percentage}% Used
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline text-sm">
          <span className="font-bold text-on-surface text-lg">
            {formatCost(budget.estimated_total)}
          </span>
          <span className="text-on-surface-variant font-label-sm text-xs">
            Cap: {formatCost(budget.target_cap)}
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-xs font-label-sm text-on-surface-variant">
          <span>{formatCost(budget.remaining)} remaining</span>
          <span className="text-secondary font-medium">Contingency cushion intact</span>
        </div>
      </div>

      {/* Category breakdown dots */}
      {budget.breakdown && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-outline-variant/20">
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            Expense Distribution
          </span>
          <div className="flex flex-col gap-2">
            {budget.breakdown.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-label-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      i === 0
                        ? 'bg-primary'
                        : i === 1
                        ? 'bg-secondary'
                        : i === 2
                        ? 'bg-secondary-container'
                        : 'bg-outline'
                    }`}
                  ></span>
                  <span className="text-on-surface">{cat.category}</span>
                </div>
                <span className="font-semibold text-on-surface">
                  {formatCost(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
