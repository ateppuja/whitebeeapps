import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { successToast } from "@/lib/swal";
import { Users, School, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { students, classes, adminCode, set } = useStore();
  const [codeInput, setCodeInput] = useState(adminCode);

  const perClass = classes.map((c) => ({
    ...c,
    count: students.filter((s) => s.classId === c.id).length,
  }));

  const stats = [
    { label: "Total Siswa", value: students.length, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: "Total Kelas", value: classes.length, icon: School, tone: "bg-accent text-accent-foreground" },
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Kode Khusus Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Kode ini dipakai untuk login sebagai Admin di halaman masuk.</p>
            <div>
              <Label>Kode Admin</Label>
              <Input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className="mt-1.5 font-mono" />
            </div>
            <Button
              onClick={() => {
                const v = codeInput.trim();
                if (!v) return;
                set("adminCode", v);
                successToast("Kode admin diperbarui");
              }}
            >
              Simpan Kode
            </Button>
            <div className="pt-2 text-xs text-muted-foreground border-t">
              <p className="font-semibold text-foreground mb-1">Alokasi Menu</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /> Kategori mata pelajaran (LMS)</li>
                <li className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5 text-primary" /> Kategori observasi karakter</li>
                <li className="flex items-center gap-2"><School className="h-3.5 w-3.5 text-primary" /> Kelas &amp; pengelompokan siswa</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
