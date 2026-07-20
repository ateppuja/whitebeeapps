import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, type AttendanceStatus } from "@/lib/store";
import { successToast } from "@/lib/swal";
import { NoClassSelected } from "@/components/NoClassSelected";
import { CalendarCheck, Save, FileDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/teacher/attendance")({ component: AttendancePage });

const STATUS: { code: AttendanceStatus; label: string; color: string }[] = [
  { code: "H", label: "Hadir", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { code: "I", label: "Izin", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { code: "S", label: "Sakit", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { code: "A", label: "Alfa", color: "bg-red-100 text-red-700 border-red-300" },
];

const monthNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function AttendancePage() {
  const { students, attendance, activeClassId, classes, saveAttendance } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(monthNow());
  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});

  const className = classes.find((c) => c.id === activeClassId)?.name ?? "";
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === activeClassId),
    [students, activeClassId]
  );

  if (!activeClassId) return <NoClassSelected />;

  const existingFor = (studentId: string, d: string) =>
    attendance.find((a) => a.studentId === studentId && a.date === d)?.status;

  const setPendingFor = (studentId: string, status: AttendanceStatus) => {
    setPending((p) => ({ ...p, [studentId]: status }));
  };

  const saveAll = () => {
    let count = 0;
    classStudents.forEach((s) => {
      const status = pending[s.id];
      if (status) {
        saveAttendance({ studentId: s.id, date, status });
        count++;
      }
    });
    setPending({});
    successToast(count > 0 ? `${count} presensi tersimpan` : "Tidak ada perubahan");
  };

  // Monthly summary
  const summary = useMemo(() => {
    return classStudents.map((s) => {
      const recs = attendance.filter((a) => a.studentId === s.id && a.date.startsWith(month));
      const c = { H: 0, I: 0, S: 0, A: 0 } as Record<AttendanceStatus, number>;
      recs.forEach((r) => { c[r.status]++; });
      return { student: s, counts: c, total: recs.length };
    });
  }, [classStudents, attendance, month]);

  return (
    <div>
      <PageHeader
        title="Presensi Siswa"
        description={`Input dan rekap kehadiran ${className}.`}
      />

      <Card className="mb-4">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CalendarCheck className="h-5 w-5" />
            <div className="font-semibold">Input Presensi Harian</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[220px_1fr] items-end">
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPending({}); }} className="mt-1.5" />
            </div>
            <div className="text-xs text-muted-foreground">
              Pilih status untuk setiap siswa lalu klik <span className="font-semibold">Simpan Presensi</span>.
              Status yang sudah tersimpan ditampilkan sebagai badge.
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Tersimpan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.map((s, i) => {
                  const saved = existingFor(s.id, date);
                  const current = pending[s.id] ?? saved;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        {saved ? (
                          <span className={`text-xs font-semibold px-2 py-1 rounded border ${STATUS.find((x) => x.code === saved)?.color}`}>
                            {STATUS.find((x) => x.code === saved)?.label}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS.map((opt) => {
                            const active = current === opt.code;
                            return (
                              <button
                                key={opt.code}
                                type="button"
                                onClick={() => setPendingFor(s.id, opt.code)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded border transition ${
                                  active ? opt.color : "bg-background text-muted-foreground border-input hover:bg-muted"
                                }`}
                              >
                                {opt.code} · {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {classStudents.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada siswa di kelas ini.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveAll}><Save className="h-4 w-4 mr-1" /> Simpan Presensi</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3 justify-between">
            <div className="font-semibold text-primary">Rekap Bulanan</div>
            <div>
              <Label>Bulan</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1.5 w-[180px]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="text-center">Hadir</TableHead>
                  <TableHead className="text-center">Izin</TableHead>
                  <TableHead className="text-center">Sakit</TableHead>
                  <TableHead className="text-center">Alfa</TableHead>
                  <TableHead className="text-center">Total Hari</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((r, i) => (
                  <TableRow key={r.student.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{r.student.name}</TableCell>
                    <TableCell className="text-center font-semibold text-emerald-700">{r.counts.H}</TableCell>
                    <TableCell className="text-center font-semibold text-amber-700">{r.counts.I}</TableCell>
                    <TableCell className="text-center font-semibold text-blue-700">{r.counts.S}</TableCell>
                    <TableCell className="text-center font-semibold text-red-700">{r.counts.A}</TableCell>
                    <TableCell className="text-center">{r.total}</TableCell>
                  </TableRow>
                ))}
                {summary.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada data.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
