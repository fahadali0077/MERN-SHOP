"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number; // ms, default 4000
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

let idCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (toast) => {
    const id = String(++idCounter);
    const duration = toast.duration ?? 4000;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().remove(id), duration);
  },

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  success: (title, description) => get().add({ title, description, variant: "success" }),
  error:   (title, description) => get().add({ title, description, variant: "error" }),
  warning: (title, description) => get().add({ title, description, variant: "warning" }),
  info:    (title, description) => get().add({ title, description, variant: "info" }),
}));

// Singleton helper — can be used outside React components
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().success(title, description),
  error:   (title: string, description?: string) => useToastStore.getState().error(title, description),
  warning: (title: string, description?: string) => useToastStore.getState().warning(title, description),
  info:    (title: string, description?: string) => useToastStore.getState().info(title, description),
};
