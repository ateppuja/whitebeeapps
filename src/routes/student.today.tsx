import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Video, FileText, ClipboardList, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/student/today")({ component: TodayPage });

function TodayPage() {
  const { materials, subjects } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const list = materials.filter((m) => m.publishDate === today);
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "-";

  return (
    <div>
      <PageHeader title="Pelajaran Hari Ini" description={`Materi & tugas untuk ${today}`} />
      {list.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Tidak ada materi untuk hari ini. Selamat beristirahat!</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wide text-primary font-semibold">{subjectName(m.subjectId)}</div>
                <h3 className="text-lg font-bold mt-1">{m.title}</h3>
                {m.instructions && <p className="text-sm text-muted-foreground mt-2">{m.instructions}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.videoLink && <a href={m.videoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium"><Video className="h-3.5 w-3.5" /> Video</a>}
                  {m.fileLink && <a href={m.fileLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 text-xs font-medium"><FileText className="h-3.5 w-3.5" /> File</a>}
                  {m.instructions && <span className="inline-flex items-center gap-1 rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium"><ClipboardList className="h-3.5 w-3.5" /> Tugas</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
