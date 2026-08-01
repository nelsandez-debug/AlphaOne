import { getCurrentUser } from "@/lib/current-user";
import { canView } from "@/lib/permissions";
import { NAV_SECTIONS, type NavSection } from "@/lib/nav-items";
import { ROLE_LABELS } from "@/lib/labels";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

async function visibleSections(role: Parameters<typeof canView>[0]): Promise<NavSection[]> {
  const sections = await Promise.all(
    NAV_SECTIONS.map(async (section) => {
      const items = await Promise.all(
        section.items.map(async (item) => ({
          item,
          visible: item.moduleKey ? await canView(role, item.moduleKey) : true,
        })),
      );
      return { label: section.label, items: items.filter((i) => i.visible).map((i) => i.item) };
    }),
  );
  return sections.filter((s) => s.items.length > 0);
}

// Sign-in/sign-up are the only routes a signed-out user can reach (every
// other page's requirePageAccess() redirects to /sign-in via getCurrentUser())
// — they render full-screen with no sidebar/top bar.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50">{children}</div>;
  }

  const sections = await visibleSections(user.role);

  return (
    <div className="flex min-h-screen">
      <Sidebar sections={sections} />
      <div className="flex flex-1 flex-col bg-slate-50">
        <TopBar userName={user.name} userRole={ROLE_LABELS[user.role]} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
