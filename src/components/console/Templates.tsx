"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import type { Template } from "@/lib/templates";

export function Templates({ templates, phone, email }: { templates: Template[]; phone: string; email: string }) {
  const [id, setId] = useState(templates[0]?.id);
  const t = templates.find((x) => x.id === id) ?? templates[0];
  const [text, setText] = useState(t?.text ?? "");
  const [copied, setCopied] = useState(false);
  if (!t) return null;

  const pick = (nid: string) => {
    setId(nid);
    setText(templates.find((x) => x.id === nid)?.text ?? "");
  };

  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-navy-950">Message templates</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {templates.map((x) => (
          <button key={x.id} type="button" onClick={() => pick(x.id)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${x.id === t.id ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <textarea className="input mt-3 font-sans text-sm" rows={9} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
      <div className="mt-3 flex flex-wrap gap-2">
        {phone && (
          <a href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-3 py-2 text-white">
            <MessageCircle size={16} /> Send on WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(text)}`} className="btn-outline px-3 py-2">
            <Mail size={16} /> Email
          </a>
        )}
        <button
          type="button"
          className="btn-outline px-3 py-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">After sending, log it below so the follow-up timer resets.</p>
    </div>
  );
}
