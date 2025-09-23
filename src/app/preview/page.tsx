"use client";
import { useQuery } from "@tanstack/react-query";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Card = { id: string; title: string; order: number };

export default function PreviewPage() {
  const { data: cards = [] } = useQuery<Card[]>({ queryKey: ["cards"], queryFn: () => fetchJSON("/api/cards") });
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Preview</h1>
      <ul className="space-y-2">
        {[...cards].sort((a, b) => a.order - b.order).map((c) => (
          <li key={c.id} className="rounded border p-3">{c.title}</li>
        ))}
      </ul>
    </div>
  );
}


