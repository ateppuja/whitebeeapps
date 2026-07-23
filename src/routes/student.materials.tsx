import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { ChevronLeft, FolderOpen, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/student/materials")({ component: MaterialsPage });

function MaterialsPage() {
  const { subjects, materials, students, user } = useStore();
  const me = students.find((s) => s.id === user?.studentId);
  const classMaterials = materials.filter((m) => m.classId === me?.classId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId) {
    const s = subjects.find((x) => x.id === openId);
    const list = classMaterials.filter((m) => m.subjectId === openId);
    return (
      <div>
        <PageHeader title={s?.name ?? "Materi"} description={`${list.length} materi tersedia`}
          actions={<Button variant="outline" onClick={() => setOpenId(null)}><ChevronLeft className="h-4 w-4 mr-1" /> Kembali</Button>} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground">{m.publishDate}</div>
                <h3 className="font-bold mt-1">{m.title}</h3>
                {m.instructions && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{m.instructions}</p>}
                <div className="mt-3 flex gap-2">
                  {m.videoLink && <a href={m.videoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs"><Video className="h-3 w-3" /> Video</a>}
                  {m.fileLink && <a href={m.fileLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-2.5 py-1 text-xs"><FileText className="h-3 w-3" /> File</a>}
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && <p className="text-muted-foreground text-sm">Belum ada materi.</p>}
        </div>
      </div>
    );
  }

  const activeSubjectIds = Array.from(new Set(classMaterials.map((m) => m.subjectId)));
  const folders = activeSubjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is { id: string; name: string } => !!s);

  return (
    <div>
      <PageHeader title="Semua Materi" description="Pilih folder mata pelajaran." />
      {folders.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <div className="font-semibold">Belum ada folder materi</div>
            <p className="text-sm text-muted-foreground mt-1">Guru belum menambahkan materi untuk kelas ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((s) => {
            const count = classMaterials.filter((m) => m.subjectId === s.id).length;
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)} className="text-left">
                <Card className="hover:shadow-md hover:border-primary/50 transition">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><FolderOpen className="h-6 w-6" /></div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{count} materi</div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
