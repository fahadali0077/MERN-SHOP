"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { COMMAND_ITEMS } from "@/lib/mock/adminData";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  // Group items by their group label
  const groups = [...new Set(COMMAND_ITEMS.map((i) => i.group))];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <Command
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface"
              loop
            >
              {/* Search input */}
              <div className="flex items-center border-b border-border px-4 dark:border-dark-border">
                <span className="mr-3 text-ink-muted">⌘</span>
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent py-4 text-sm text-ink outline-none placeholder:text-ink-muted dark:text-white"
                  onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
                />
                <kbd className="rounded border border-border bg-cream px-1.5 py-0.5 text-[10px] font-mono text-ink-muted dark:border-dark-border dark:bg-dark-surface-2">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-ink-muted">
                  No results found.
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="mb-2"
                  >
                    <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                      {group}
                    </div>
                    {COMMAND_ITEMS.filter((i) => i.group === group).map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.description ?? ""}`}
                        onSelect={() => { handleSelect(item.href); }}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-soft aria-selected:bg-amber-dim aria-selected:text-amber dark:text-white dark:aria-selected:bg-amber/10 dark:aria-selected:text-amber"
                      >
                        <span className="text-base">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-ink-muted">{item.description}</p>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-xs text-ink-muted">{item.href}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 dark:border-dark-border">
                <div className="flex items-center gap-4 text-[10px] text-ink-muted">
                  <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
                  <span><kbd className="font-mono">↵</kbd> Select</span>
                  <span><kbd className="font-mono">ESC</kbd> Close</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
