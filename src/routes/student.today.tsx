import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { Video, FileText, ClipboardList, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/student/today")({ component: TodayPage });

// Tanggal lokal (WIB), bukan UTC — agar materi tidak "geser" sehari.
function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatID(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function TodayPage() {
  const { materials, subjects, students, user } = useStore();
  const me = students.find((s) => s.id === user?.studentId);
  const today = localDate();
  const [date, setDate] = useState(today);

  const list = useMemo(
    () =>
      materials
        .filter((m) => m.classId === me?.classId && m.publishDate === date)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [materials, me?.classId, date],
  );
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "-";

  return (
    <div>
      <PageHeader title="Pelajaran Hari Ini" description={`Materi & tugas untuk ${formatID(date)}`} />

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="tgl">Tanggal</Label>
            <Input id="tgl" type="date" value={date} onChange={(e) => setDate(e.target.value || today)} className="mt-1.5 w-[190px]" />
          </div>
          {date !== today && (
            <button type="button" onClick={() => setDate(today)} className="h-10 rounded-md border px-3 text-sm font-medium hover:bg-accent">
              Kembali ke hari ini
            </button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">{list.length} materi</div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Tidak ada materi pada {formatID(date)}.</p>
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
