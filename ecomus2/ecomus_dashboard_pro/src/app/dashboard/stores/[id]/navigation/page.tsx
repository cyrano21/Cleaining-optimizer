"use client";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

interface NavLink { _id?: string; label: string; href: string; }

function SortableItem({ id, label }: { id: string; label: string; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const transformStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div ref={setNodeRef} style={transformStyle} {...attributes} {...listeners} className="border p-2 rounded bg-white">
      {label}
    </div>
  );
}

async function fetchTitle(url: string): Promise<string> {
  try {
    const html = await fetch(`/api/fetch-title?url=${encodeURIComponent(url)}`).then(r => r.text());
    return html || url;
  } catch {
    return url;
  }
}

export default function NavLinksPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [links, setLinks] = useState<NavLink[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [cmsAuto, setCmsAuto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/stores/${resolvedParams.id}`).then(r=>r.json()).then(store => {
      setLinks(store.navLinks || []);
      setCmsAuto(store.navCmsSync || false);
    });
  }, [resolvedParams.id]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(l => l._id === active.id);
      const newIndex = links.findIndex(l => l._id === over.id);
      setLinks(arrayMove(links, oldIndex, newIndex));
    }
  };

  async function addLinkFromUrl() {
    if (!newUrl) return;
    const title = await fetchTitle(newUrl);
    setLinks(prev => [...prev, { label: title, href: newUrl }]);
    setNewUrl("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    await fetch(`/api/stores/${resolvedParams.id}`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ navLinks: links, navCmsSync: cmsAuto })
    });
    router.refresh();
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Navigation</h1>

      {/* Drag & drop list */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map(l => l._id || l.href)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 mb-4">
            {links.map((l, idx) => (
              <div key={l._id || l.href} className="flex gap-2 items-center">
                <SortableItem id={l._id || l.href} label={l.label}/>
                <div className="flex-1">
                  <label htmlFor={`label-${idx}`} className="sr-only">Libellé du lien</label>
                  <input 
                    id={`label-${idx}`}
                    value={l.label} 
                    onChange={e => {
                      const val=e.target.value; setLinks(prev => prev.map((x,i)=>i===idx?{...x,label:val}:x));
                    }} 
                    className="border p-1 w-full"
                    placeholder="Libellé du lien"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`href-${idx}`} className="sr-only">URL du lien</label>
                  <input 
                    id={`href-${idx}`}
                    value={l.href} 
                    onChange={e => {
                      const val=e.target.value; setLinks(prev => prev.map((x,i)=>i===idx?{...x,href:val}:x));
                    }} 
                    className="border p-1 w-full"
                    placeholder="URL du lien"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setLinks(prev => prev.filter((_,i)=>i!==idx))}
                  aria-label="Supprimer ce lien"
                  className="p-1"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Quick add */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label htmlFor="new-url" className="sr-only">Nouvelle URL à ajouter</label>
          <input 
            id="new-url"
            placeholder="https://example.com" 
            value={newUrl} 
            onChange={e=>setNewUrl(e.target.value)} 
            className="border p-2 w-full"
          />
        </div>
        <button type="button" onClick={addLinkFromUrl} className="border px-3 py-1 rounded">+ Import URL</button>
      </div>

      {/* CMS auto sync */}
      <label className="flex items-center gap-2 mb-6">
        <input type="checkbox" checked={cmsAuto} onChange={e => setCmsAuto(e.target.checked)}/>
        Synchroniser automatiquement avec le CMS (mise à jour quotidienne)
      </label>

      <button onClick={submit} className="py-2 px-4 bg-black text-white rounded">Enregistrer</button>
    </div>
  );
}
