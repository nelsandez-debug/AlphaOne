import { Lock } from "lucide-react";

export function NoAccess({ moduleLabel }: { moduleLabel: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
      <Lock size={20} className="text-slate-300" />
      <p className="text-sm font-medium text-slate-600">You don&apos;t have access to {moduleLabel}.</p>
      <p className="text-xs text-slate-400">Ask a Procurement Leader to update your role.</p>
    </div>
  );
}
