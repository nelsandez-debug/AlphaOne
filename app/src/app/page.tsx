import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/current-user";

// Phase 0 landing page: proves auth + the User/Role sync work end to end.
// Module UI (Suppliers, Contracts, ...) starts in Phase 1.
export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 p-16 font-sans dark:bg-black">
      <div className="flex items-center gap-4">
        <UserButton />
        {user && (
          <div className="text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{user.name}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{user.email} · {user.role}</p>
          </div>
        )}
      </div>
      <p className="max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
        Phase 0 foundation: auth, roles, and the shared documents / notes / audit_log
        tables are live. Module UI starts in Phase 1.
      </p>
    </div>
  );
}
