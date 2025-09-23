"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type Template = { id: string; name: string; description?: string | null };

export default function TemplatesPage() {
  const { data: templates = [] } = useQuery<Template[]>({ queryKey: ["templates"], queryFn: () => fetchJSON("/api/templates") });
  const apply = useMutation({
    mutationFn: (templateId: string) => fetchJSON("/api/home-layout/apply-template", { method: "POST", body: JSON.stringify({ templateId }) }),
  });
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Templates</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <div className="font-medium">{t.name}</div>
            {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
            <div className="mt-2 flex gap-2">
              <Button onClick={() => apply.mutate(t.id)}>Use template</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


