"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Card = {
  id: string;
  title: string;
  description?: string | null;
  type: "content" | "collection";
  order: number;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function DesignerPage() {
  const session = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  
  const { data, status } = session || { data: null, status: "loading" };
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const { data: cards = [] } = useQuery<Card[]>({ 
    queryKey: ["cards"], 
    queryFn: () => fetchJSON("/api/cards"),
    enabled: status === "authenticated"
  });

  const create = useMutation({
    mutationFn: (title: string) =>
      fetchJSON<Card>("/api/cards", {
        method: "POST",
        body: JSON.stringify({ title, type: "content", layout: { w: 1, h: 1 } }),
      }),
    onMutate: async (title) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<Card[]>(["cards"]) ?? [];
      const optimistic: Card = { id: `temp-${Date.now()}`, title, type: "content", order: prev.length + 1 } as any;
      qc.setQueryData<Card[]>(["cards"], [...prev, optimistic]);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["cards"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => fetchJSON(`/api/cards/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<Card[]>(["cards"]) ?? [];
      qc.setQueryData<Card[]>(["cards"], prev.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["cards"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      fetchJSON(`/api/cards/reorder`, { method: "POST", body: JSON.stringify({ ids }) }),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      const prev = qc.getQueryData<Card[]>(["cards"]) ?? [];
      const map = new Map(prev.map((c) => [c.id, c] as const));
      const optimistic = ids.map((id, idx) => ({ ...(map.get(id) as Card), order: idx + 1 }));
      qc.setQueryData<Card[]>(["cards"], optimistic);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["cards"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const move = (id: string, dir: -1 | 1) => {
    const ordered = [...cards].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((c) => c.id === id);
    const to = idx + dir;
    if (to < 0 || to >= ordered.length) return;
    [ordered[idx], ordered[to]] = [ordered[to], ordered[idx]];
    reorder.mutate(ordered.map((c) => c.id));
  };

  const [title, setTitle] = useState("");

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-6">Redirecting to sign in...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="New card title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={() => title && create.mutate(title)}>Add Card</Button>
      </div>
      <ul className="space-y-2">
        {[...cards].sort((a, b) => a.order - b.order).map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.type}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => move(c.id, -1)}>Up</Button>
              <Button variant="outline" onClick={() => move(c.id, 1)}>Down</Button>
              <Button variant="outline" onClick={() => del.mutate(c.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


