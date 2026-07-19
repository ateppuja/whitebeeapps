import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, type Module } from "@/lib/store";
import { confirmDelete, successToast } from "@/lib/swal";
import { FolderOpen, Plus, FileText, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/teacher/modules")({ component: ModulesPage });

function ModulesPage() {
  const { modules, subjects, set, uid } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [fileLink, setFileLink] = useState("");

  const openNew = () => { setEditing(null); setSubjectId(subjects[0]?.id ?? ""); setTitle(""); setFileLink(""); setOpen(true); };
  const openEdit = (m: Module) => { setEditing(m); setSubjectId(m.subjectId); setTitle(m.title); setFileLink(m.fileLink); setOpen(true); };
  const save = () => {
    if (!title.trim() || !subjectId) return;
    const data: Module = { id: editing?.id ?? uid(), subjectId, title, fileLink };
    if (editing) set("modules", modules.map((m) => m.id === editing.id ? data : m));
    else set("modules", [...modules, data]);
    successToast(editing ? "Modul diperbarui" : "Modul ditambahkan");
    setOpen(false);
  };
  const remove = async (m: Module) => {
    if (await confirmDelete(m.title)) {
      set("modules", modules.filter((x) => x.id !== m.id));
      successToast("Dihapus");
    }
  };

  return (
    <div>
      <PageHeader title="Kelola Modul" description="Organisasi file modul berdasarkan kategori."
        actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Modul Baru</Button>} />

      <div className="space-y-4">
        {subjects.map((s) => {
          const list = modules.filter((m) => m.subjectId === s.id);
          return (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div className="font-semibold">{s.name}</div>
                  <span className="text-xs text-muted-foreground">({list.length} file)</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada modul.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {list.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="text-sm font-medium truncate">{m.title}</div>
                        </div>
                        <div className="flex shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Modul" : "Modul Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Kategori</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Judul</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Link File</Label><Input value={fileLink} onChange={(e) => setFileLink(e.target.value)} className="mt-1.5" placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
