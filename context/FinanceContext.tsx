import React, { createContext, ReactNode, useContext, useState } from "react";

export type Payment = {
  id: number;
  amount: number;
  date: string;
};

export type Debt = {
  id: number;
  person: string;
  description: string;
  date: string;
  initialAmount: number;
  remainingAmount: number;
  direction: "left" | "right";
  payments: Payment[];
  status: "pending" | "paid";
};

type FinanceContextType = {
  debts: Debt[];
  addDebt: (
    debt: Omit<Debt, "id" | "remainingAmount" | "payments" | "status">,
  ) => void;
  addPayment: (debtId: number, amount: number) => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>([]);

  const addDebt = (
    debt: Omit<Debt, "id" | "remainingAmount" | "payments" | "status">,
  ) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now(),
      remainingAmount: debt.initialAmount,
      payments: [],
      status: "pending",
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const addPayment = (debtId: number, amount: number) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remainingAmount - amount);
          const newPayments = [
            ...d.payments,
            {
              id: Date.now(),
              amount,
              date: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
          ];
          return {
            ...d,
            remainingAmount: newRemaining,
            payments: newPayments,
            status: newRemaining === 0 ? "paid" : "pending",
          };
        }
        return d;
      }),
    );
  };

  return (
    <FinanceContext.Provider value={{ debts, addDebt, addPayment }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
