import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, type Material } from "@/lib/store";
import { confirmDelete, successToast, swal } from "@/lib/swal";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { NoClassSelected } from "@/components/NoClassSelected";

export const Route = createFileRoute("/teacher/")({ component: MaterialsPage });

const ADD_NEW = "__add_new__";

function MaterialsPage() {
  const { materials, subjects, set, uid, activeClassId, classes } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [videoLink, setVideoLink] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [instructions, setInstructions] = useState("");
  const [q, setQ] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const classMaterials = useMemo(
    () => materials.filter((m) => m.classId === activeClassId),
    [materials, activeClassId]
  );
  const filtered = useMemo(
    () =>
      classMaterials.filter((m) => {
        if (filterSubject !== "all" && m.subjectId !== filterSubject) return false;
        if (q && !m.title.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [classMaterials, filterSubject, q]
  );

  const className = classes.find((c) => c.id === activeClassId)?.name ?? "";

  const openNew = () => {
    setEditing(null);
    setSubjectId(subjects[0]?.id ?? "");
    setTitle(""); setPublishDate(new Date().toISOString().slice(0, 10));
    setVideoLink(""); setFileLink(""); setInstructions("");
    setOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m); setSubjectId(m.subjectId); setTitle(m.title);
    setPublishDate(m.publishDate); setVideoLink(m.videoLink ?? "");
    setFileLink(m.fileLink ?? ""); setInstructions(m.instructions ?? "");
    setOpen(true);
  };

  const handleSubjectChange = async (v: string) => {
    if (v === ADD_NEW) {
      const r = await swal.fire({
        title: "Kategori Baru", input: "text", inputPlaceholder: "Nama kategori",
        showCancelButton: true, confirmButtonText: "Tambah", cancelButtonText: "Batal",
      });
      if (r.isConfirmed && r.value?.trim()) {
        const newId = uid();
        set("subjects", [...subjects, { id: newId, name: r.value.trim() }]);
        setSubjectId(newId);
        successToast("Kategori ditambahkan");
      }
    } else setSubjectId(v);
  };

  const save = () => {
    if (!title.trim() || !subjectId || !activeClassId) return;
    const data: Material = { id: editing?.id ?? uid(), classId: activeClassId, subjectId, title, publishDate, videoLink, fileLink, instructions };
    if (editing) set("materials", materials.map((m) => m.id === editing.id ? data : m));
    else set("materials", [...materials, data]);
    successToast(editing ? "Materi diperbarui" : "Materi ditambahkan");
    setOpen(false);
  };

  const remove = async (m: Material) => {
    if (await confirmDelete(m.title)) {
      set("materials", materials.filter((x) => x.id !== m.id));
      successToast("Dihapus");
    }
  };

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "-";

  if (!activeClassId) return <NoClassSelected />;

  return (
    <div>
      <PageHeader
        title="Kelola Materi"
        description={`Publikasikan materi untuk ${className}.`}
        actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Materi Baru</Button>}
      />

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul materi..." className="pl-9" />
          </div>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal Publish</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell>{subjectName(m.subjectId)}</TableCell>
                  <TableCell>{m.publishDate}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Tidak ada materi.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Materi" : "Materi Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs">
              Kelas: <span className="font-semibold text-primary">{className}</span>
            </div>
            <div>
              <Label>Kategori Mapel</Label>
              <Select value={subjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  <SelectItem value={ADD_NEW}>+ Tambah Kategori Baru</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Judul</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Tanggal Publish</Label><Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Link Video</Label><Input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} className="mt-1.5" placeholder="https://..." /></div>
            <div><Label>Link File</Label><Input value={fileLink} onChange={(e) => setFileLink(e.target.value)} className="mt-1.5" placeholder="https://..." /></div>
            <div><Label>Instruksi Tugas</Label><Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="mt-1.5" rows={4} /></div>
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
