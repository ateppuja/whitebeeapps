import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { confirmDelete, successToast } from "@/lib/swal";
import { BookOpen, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/subjects")({ component: SubjectsPage });

function SubjectsPage() {
  const { subjects, set, uid, materials } = useStore();
  const [name, setName] = useState("");

  const add = () => {
    if (!name.trim()) return;
    set("subjects", [...subjects, { id: uid(), name: name.trim() }]);
    setName("");
    successToast("Kategori ditambahkan");
  };

  const remove = async (id: string, name: string) => {
    if (await confirmDelete(name)) {
      set("subjects", subjects.filter((s) => s.id !== id));
      successToast("Dihapus");
    }
  };

  return (
    <div>
      <PageHeader title="Kategori Mata Pelajaran" description="Alokasi kategori untuk materi LMS." />
      <Card className="mb-4">
        <CardContent className="p-4 flex gap-2">
          <Input placeholder="Nama kategori baru" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{materials.filter((m) => m.subjectId === s.id).length} materi</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(s.id, s.name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
