'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type State = {
  drafts: Record<string, string>;
  setDraft: (questionId: string, text: string) => void;
  clearDraft: (questionId: string) => void;
};
export const useInterviewStore = create<State>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (id, text) =>
        set((s) => ({ drafts: { ...s.drafts, [id]: text } })),
      clearDraft: (id) =>
        set((s) => {
          const drafts = { ...s.drafts };
          delete drafts[id];
          return { drafts };
        }),
    }),
    { name: 'nova-answer-drafts' },
  ),
);
