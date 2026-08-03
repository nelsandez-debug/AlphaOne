import { getCurrentUser } from "@/lib/current-user";
import { canView } from "@/lib/permissions";
import { NAV_SECTIONS } from "@/lib/nav-items";
import { ROLE_LABELS } from "@/lib/labels";
import { Sidebar, type RenderedNavSection } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

// Icons are rendered here (server-side) into plain ReactNodes before crossing
// into the "use client" Sidebar — see the comment in Sidebar.tsx for why.
async function visibleSections(role: Parameters<typeof canView>[0]): Promise<RenderedNavSection[]> {
  const sections = await Promise.all(
    NAV_SECTIONS.map(async (section) => {
      const items = await Promise.all(
        section.items.map(async (item) => ({
          item: { href: item.href, label: item.label, icon: <item.icon size={15} strokeWidth={1.5} /> },
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
    return <div className="flex min-h-screen flex-1 items-center justify-center">{children}</div>;
  }

  const sections = await visibleSections(user.role);

  return (
    <div className="grid min-h-screen md:grid-cols-[250px_1fr]">
      <Sidebar sections={sections} />
      <div className="flex flex-col">
        <TopBar userName={user.name} userRole={ROLE_LABELS[user.role]} />
        <main className="flex-1 p-3.5">{children}</main>
      </div>
    </div>
  );
}
