import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, type IndicatorCategory } from "@/lib/store";
import { successToast } from "@/lib/swal";
import { Download, FileText } from "lucide-react";
import { NoClassSelected } from "@/components/NoClassSelected";

export const Route = createFileRoute("/teacher/reports")({ component: ReportsPage });

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const MONTH_LABEL: Record<string,string> = {
  "01":"Januari","02":"Februari","03":"Maret","04":"April","05":"Mei","06":"Juni",
  "07":"Juli","08":"Agustus","09":"September","10":"Oktober","11":"November","12":"Desember"
};

function ReportsPage() {
  const { students, observations, indicators, classes, activeClassId } = useStore();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);

  const filled = useMemo(
    () => new Set(observations.filter((o) => o.month === month).map((o) => o.studentId)),
    [observations, month]
  );

  if (!activeClassId) return <NoClassSelected />;
  const className = classes.find((c) => c.id === activeClassId)?.name ?? "";

  const classStudents = students.filter((s) => s.classId === activeClassId);
  const done = classStudents.filter((s) => filled.has(s.id)).length;
  const total = classStudents.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const exportDoc = (cat: IndicatorCategory) => {
    const catIndicators = indicators.filter((i) => i.category === cat && i.classId === activeClassId);
    const rows = classStudents.map((s) => {
      const rec = observations.find((o) => o.studentId === s.id && o.month === month);
      const entries = catIndicators.map((ind) => {
        const e = rec?.entries.find((x) => x.indicatorId === ind.id);
        return `<tr><td>${ind.text}</td><td>${e?.value ?? "-"}</td><td>${e?.note ?? ""}</td></tr>`;
      }).join("");
      return `<h3>${s.name}</h3><table border="1" cellspacing="0" cellpadding="4"><tr><th>Indikator</th><th>Nilai</th><th>Catatan</th></tr>${entries}</table><br/>`;
    }).join("");

    const html = `<html><head><meta charset="utf-8"><title>Laporan ${cat} - ${className}</title></head><body>
      <h1>Laporan Observasi ${cat} — ${className}</h1>
      <p>Bulan: ${month}</p>${rows}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `laporan-${cat.toLowerCase()}-${className.replace(/\s+/g,"_")}-${month}.doc`;
    a.click(); URL.revokeObjectURL(url);
    successToast(`Laporan ${cat} diunduh`);
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div>
      <PageHeader title="Progress & Laporan" description={`Monitor pengisian matriks observasi ${className}.`} />

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-3 sm:grid-cols-[220px_1fr_auto_auto]">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.flatMap((y) => MONTHS.map((m) => (
                <SelectItem key={`${y}-${m}`} value={`${y}-${m}`}>{MONTH_LABEL[m]} {y}</SelectItem>
              )))}
            </SelectContent>
          </Select>
          <div />
          <Button variant="outline" onClick={() => exportDoc("Adab")}><Download className="h-4 w-4 mr-1" /> Export Adab (DOC)</Button>
          <Button onClick={() => exportDoc("Tarbiyah")}><FileText className="h-4 w-4 mr-1" /> Export Tarbiyah (DOC)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">{className}</div>
              <div className="text-xs text-muted-foreground">{done} dari {total} siswa mengisi</div>
            </div>
            <div className="text-2xl font-bold text-primary">{pct}%</div>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-2">
        {classStudents.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>{s.name}</span>
            <span className={`text-xs font-semibold ${filled.has(s.id) ? "text-primary" : "text-muted-foreground"}`}>
              {filled.has(s.id) ? "Sudah mengisi" : "Belum mengisi"}
            </span>
          </div>
        ))}
        {classStudents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Belum ada siswa di kelas ini.</p>
        )}
      </div>
    </div>
  );
}
