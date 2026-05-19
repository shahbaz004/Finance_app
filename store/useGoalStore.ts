import { create } from 'zustand';
import { Goal } from '../types';
import {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addGoalContribution,
} from '../db/queries/goals';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  celebratingGoalId: string | null;

  loadGoals: (userId: string) => Promise<void>;
  addGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  editGoal: (id: string, data: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<boolean>; // returns true if goal completed
  setCelebrating: (id: string | null) => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  celebratingGoalId: null,

  loadGoals: async (userId) => {
    set({ isLoading: true });
    try {
      const goals = await getAllGoals(userId);
      set({ goals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    const goal = await createGoal(data);
    set((s) => ({ goals: [goal, ...s.goals] }));
  },

  editGoal: async (id, data) => {
    await updateGoal(id, data);
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }));
  },

  removeGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    await deleteGoal(id);
  },

  contribute: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return false;

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    const completed = newAmount >= goal.targetAmount;

    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: newAmount } : g
      ),
    }));
    await addGoalContribution(id, amount);
    return completed;
  },

  setCelebrating: (id) => set({ celebratingGoalId: id }),
}));
