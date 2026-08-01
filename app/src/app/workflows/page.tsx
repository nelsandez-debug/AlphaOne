import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/page-guard";
import { NoAccess } from "@/components/NoAccess";
import { CreateWorkflowForm } from "@/components/CreateWorkflowForm";
import { WorkflowRow } from "@/components/WorkflowRow";

// A modest, honest settings registry — see the WorkflowConfig model comment for
// why this isn't a fabricated drag-and-drop no-code builder. Toggling a row here
// doesn't yet change behavior elsewhere in the app; there's no rules engine wired
// up to read these flags.
export default async function WorkflowsPage() {
  const access = await requirePageAccess("admin");
  if (!access.allowed) return <NoAccess moduleLabel="Administration" />;

  const workflows = await prisma.workflowConfig.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Workflows &amp; Configuration</h1>
          <p className="text-sm text-slate-500">A real on/off registry, not a no-code builder — toggles are recorded and audited.</p>
        </div>
        {access.editable && <CreateWorkflowForm />}
      </div>

      <div className="space-y-3">
        {workflows.map((w) => (
          <WorkflowRow key={w.id} workflow={w} editable={access.editable} />
        ))}
        {workflows.length === 0 && <p className="text-sm text-slate-400 italic">No workflow configs yet.</p>}
      </div>
    </div>
  );
}
