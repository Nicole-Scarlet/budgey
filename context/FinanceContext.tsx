import { useSQLiteContext } from "expo-sqlite";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  budget: number;
  addDebt: (
    debt: Omit<Debt, "id" | "remainingAmount" | "payments" | "status">,
  ) => Promise<void>;
  addPayment: (debtId: number, amount: number) => Promise<void>;
  updateBudget: (amount: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budget, setBudget] = useState<number>(0);

  const refresh = async () => {
    try {
      // Fetch budget
      const settingsResult = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = 'budget'",
      );
      if (settingsResult) {
        setBudget(parseFloat(settingsResult.value));
      }

      // Fetch debts and their payments
      const debtsResult = await db.getAllAsync<any>(
        "SELECT * FROM debts ORDER BY id DESC",
      );

      const debtsWithPayments: Debt[] = await Promise.all(
        debtsResult.map(async (debt: any) => {
          const paymentsResult = await db.getAllAsync<Payment>(
            "SELECT id, amount, date FROM payments WHERE debtId = ? ORDER BY id DESC",
            [debt.id],
          );
          return {
            ...debt,
            payments: paymentsResult,
          };
        }),
      );

      setDebts(debtsWithPayments);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  useEffect(() => {
    refresh();
  }, [db]);

  const updateBudget = async (amount: number) => {
    try {
      await db.runAsync("UPDATE settings SET value = ? WHERE key = 'budget'", [
        amount.toString(),
      ]);
      setBudget(amount);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  const addDebt = async (
    debt: Omit<Debt, "id" | "remainingAmount" | "payments" | "status">,
  ) => {
    try {
      await db.runAsync(
        "INSERT INTO debts (person, description, date, initialAmount, remainingAmount, direction, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          debt.person,
          debt.description,
          debt.date,
          debt.initialAmount,
          debt.initialAmount,
          debt.direction,
          "pending",
        ],
      );
      await refresh();
    } catch (error) {
      console.error("Error adding debt:", error);
    }
  };

  const addPayment = async (debtId: number, amount: number) => {
    try {
      const debt = debts.find((d) => d.id === debtId);
      if (!debt) return;

      const newRemaining = Math.max(0, debt.remainingAmount - amount);
      const newStatus = newRemaining === 0 ? "paid" : "pending";
      const date = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO payments (debtId, amount, date) VALUES (?, ?, ?)",
          [debtId, amount, date],
        );
        await db.runAsync(
          "UPDATE debts SET remainingAmount = ?, status = ? WHERE id = ?",
          [newRemaining, newStatus, debtId],
        );
      });

      await refresh();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  return (
    <FinanceContext.Provider
      value={{ debts, budget, addDebt, addPayment, updateBudget, refresh }}
    >
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
