"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Content = { id: string; title: string; kind: string };
type Collection = { id: string; title: string; itemIds: string[] };

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function LibraryPage() {
  const qc = useQueryClient();
  const { data: contents = [] } = useQuery<Content[]>({ queryKey: ["contents"], queryFn: () => fetchJSON("/api/contents") });
  const { data: collections = [] } = useQuery<Collection[]>({ queryKey: ["collections"], queryFn: () => fetchJSON("/api/collections") });

  const createContent = useMutation({
    mutationFn: (title: string) =>
      fetchJSON<Content>("/api/contents", { method: "POST", body: JSON.stringify({ title, kind: "note" }) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["contents"] }),
  });

  const createCollection = useMutation({
    mutationFn: (title: string) =>
      fetchJSON<Collection>("/api/collections", { method: "POST", body: JSON.stringify({ title, itemIds: [] }) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });

  const [ct, setCt] = useState("");
  const [cl, setCl] = useState("");

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-2">Contents</h2>
        <div className="flex items-center gap-2 mb-3">
          <Input placeholder="Title" value={ct} onChange={(e) => setCt(e.target.value)} />
          <Button onClick={() => ct && createContent.mutate(ct)}>Add</Button>
        </div>
        <ul className="space-y-2">
          {contents.map((c) => (
            <li key={c.id} className="rounded border p-3">{c.title} <span className="text-xs text-muted-foreground">({c.kind})</span></li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Collections</h2>
        <div className="flex items-center gap-2 mb-3">
          <Input placeholder="Title" value={cl} onChange={(e) => setCl(e.target.value)} />
          <Button onClick={() => cl && createCollection.mutate(cl)}>Add</Button>
        </div>
        <ul className="space-y-2">
          {collections.map((c) => (
            <li key={c.id} className="rounded border p-3">{c.title} <span className="text-xs text-muted-foreground">{c.itemIds.length} items</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}


