import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Users, School, BookOpen, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { students, classes, subjects, indicators } = useStore();
  const perClass = classes.map((c) => ({
    ...c,
    count: students.filter((s) => s.classId === c.id).length,
  }));

  const stats = [
    { label: "Total Siswa", value: students.length, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: "Total Kelas", value: classes.length, icon: School, tone: "bg-accent text-accent-foreground" },
    { label: "Kategori Mapel", value: subjects.length, icon: BookOpen, tone: "bg-secondary text-secondary-foreground" },
    { label: "Indikator Observasi", value: indicators.length, icon: ClipboardList, tone: "bg-primary/10 text-primary" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Admin" description="Ringkasan sistem WhiteBee LMS." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${s.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Siswa per Kelas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {perClass.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">Grade {c.grade}</div>
                </div>
                <div className="text-2xl font-bold text-primary">{c.count}</div>
              </div>
            ))}
            {perClass.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada kelas.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Alokasi Menu</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Kelola kategori LMS &amp; Observasi lewat menu di samping.</p>
            <ul className="space-y-1.5 mt-2">
              <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Kategori mata pelajaran (LMS)</li>
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Kategori observasi karakter</li>
              <li className="flex items-center gap-2"><School className="h-4 w-4 text-primary" /> Kelas &amp; pengelompokan siswa</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
