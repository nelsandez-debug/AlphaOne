"use client";

import { useState } from "react";
import { FolderOpen, MessageSquare, Upload, FileCheck2 } from "lucide-react";

export type DocumentSummary = {
  id: string;
  name: string;
  sizeKB: number | null;
  createdAt: string;
  uploadedBy: { name: string };
};

export type NoteSummary = {
  id: string;
  text: string;
  createdAt: string;
  author: { name: string };
};

// Ported from the reference prototype's RecordDocumentsNotes, backed by the shared
// polymorphic Document/Note tables (Phase 0) via /api/modules/[moduleKey]/{documents,notes}.
export function RecordDocumentsNotes({
  moduleKey,
  recordType,
  recordId,
  initialDocuments,
  initialNotes,
  editable = true,
}: {
  moduleKey: string;
  recordType: string;
  recordId: string;
  initialDocuments: DocumentSummary[];
  initialNotes: NoteSummary[];
  editable?: boolean;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");

  const addDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const response = await fetch(`/api/modules/${moduleKey}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordType, recordId, name: file.name, sizeKB: Math.round(file.size / 1024) }),
    });
    if (response.ok) {
      const document = await response.json();
      setDocuments((prev) => [document, ...prev]);
    }
  };

  const submitNote = async () => {
    const text = noteText.trim();
    if (!text) return;

    const response = await fetch(`/api/modules/${moduleKey}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordType, recordId, text }),
    });
    if (response.ok) {
      const note = await response.json();
      setNotes((prev) => [note, ...prev]);
      setNoteText("");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
            <FolderOpen size={14} className="text-slate-400" /> Document repository
          </p>
          {editable && (
            <label className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1">
              <Upload size={12} /> Add
              <input type="file" className="hidden" onChange={addDoc} />
            </label>
          )}
        </div>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No documents on file.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <FileCheck2 size={13} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{d.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {d.sizeKB ? `${d.sizeKB} KB · ` : ""}
                    {new Date(d.createdAt).toLocaleDateString()} · {d.uploadedBy.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-slate-400" /> Notes
        </p>
        {editable && (
          <div className="mb-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              placeholder="Add a note for the next person who opens this record…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#2563EB] resize-none mb-2"
            />
            <button
              type="button"
              onClick={submitNote}
              disabled={!noteText.trim()}
              className={`text-xs font-medium rounded-lg px-3 py-1.5 text-white ${noteText.trim() ? "bg-[#0B1220] hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"}`}
            >
              Add note
            </button>
          </div>
        )}
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No notes yet.</p>
        ) : (
          <div className="space-y-2.5">
            {notes.map((n) => (
              <div key={n.id} className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="text-xs text-slate-700">{n.text}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {n.author.name} · {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
