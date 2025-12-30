"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { UploadCloud, FileText, Link as LinkIcon, Download, Trash2, Tag } from "lucide-react";

interface Deliverable {
    id: string;
    title: string;
    type: 'file' | 'link' | 'note';
    url?: string;
    description?: string;
    version?: string;
    created_at: string;
}

export default function DeliverableManager({ projectId, initialDeliverables, isClientView = false }: { projectId: string, initialDeliverables: Deliverable[], isClientView?: boolean }) {
    const [deliverables, setDeliverables] = useState(initialDeliverables);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", type: "link", url: "", description: "", version: "v1.0" });
    const supabase = createClient();

    const addDeliverable = async () => {
        if (!newItem.title) return;
        try {
            const { data, error } = await (supabase.from("deliverables") as any).insert({
                project_id: projectId,
                title: newItem.title,
                type: newItem.type,
                url: newItem.url,
                description: newItem.description,
                version: newItem.version
            }).select().single();

            if (error) throw error;
            if (data) setDeliverables([data as any, ...deliverables]);
            setIsAdding(false);
            setNewItem({ title: "", type: "link", url: "", description: "", version: "v1.0" });
        } catch (e) {
            console.error(e);
            alert("Error adding deliverable");
        }
    };

    const deleteDeliverable = async (id: string) => {
        if (!confirm("Delete this deliverable?")) return;
        await (supabase.from("deliverables") as any).delete().eq("id", id);
        setDeliverables(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Project Deliverables</h2>
                {!isClientView && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-[#42CA80] text-black font-bold px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                        <UploadCloud className="h-4 w-4" /> Add Deliverable
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-[#111] border border-[#333] p-4 rounded-xl mb-6 animate-in slide-in-from-top-2">
                    <h3 className="text-white font-bold mb-3">New Deliverable</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Title" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm" />
                        <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm">
                            <option value="link">Link / URL</option>
                            <option value="file">File (Upload placeholder)</option>
                            <option value="note">Note / Text</option>
                        </select>
                        <input type="text" placeholder="URL or Content" value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm md:col-span-2" />
                        <input type="text" placeholder="Version (e.g. v1.0 final)" value={newItem.version} onChange={e => setNewItem({ ...newItem, version: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm" />
                        <input type="text" placeholder="Description (optional)" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="bg-[#0a0a0a] border border-[#222] rounded p-2 text-white text-sm" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={addDeliverable} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Save Deliverable</button>
                        <button onClick={() => setIsAdding(false)} className="bg-transparent text-[#666] px-4 py-2 rounded text-sm">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliverables.map(item => (
                    <div key={item.id} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 hover:border-[#42CA80]/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded bg-[#0f0f0f] text-[#42CA80]">
                                {item.type === 'link' ? <LinkIcon className="h-5 w-5" /> : item.type === 'file' ? <FileText className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                            </div>
                            {!isClientView && (
                                <button onClick={() => deleteDeliverable(item.id)} className="text-[#666] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <h3 className="font-bold text-white mb-1 truncate">{item.title}</h3>
                        <p className="text-xs text-[#888] mb-4 line-clamp-2">{item.description || "No description"}</p>

                        <div className="flex items-center justify-between text-xs text-[#666] border-t border-[#252525] pt-3">
                            <span className="bg-[#222] px-1.5 py-0.5 rounded text-zinc-400">{item.version || "v1"}</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>

                        {item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block text-center w-full py-2 bg-[#222] hover:bg-[#333] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2">
                                <Download className="h-3.5 w-3.5" /> Access Resource
                            </a>
                        )}
                    </div>
                ))}

                {deliverables.length === 0 && (
                    <div className="col-span-full text-center py-10 border border-dashed border-[#333] rounded-xl text-[#666]">
                        No deliverables uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
