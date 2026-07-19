import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, type Role } from "@/lib/store";
import { swal, successToast } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Shield, BookOpen, User } from "lucide-react";

export const Route = createFileRoute("/")({ component: LoginPage });

const ROLES: { id: Role; label: string; desc: string; icon: typeof Shield }[] = [
  { id: "admin", label: "Admin", desc: "Kelola sekolah & sistem", icon: Shield },
  { id: "teacher", label: "Guru", desc: "Materi, modul & observasi", icon: BookOpen },
  { id: "student", label: "Siswa", desc: "Belajar & self-assessment", icon: User },
];

function LoginPage() {
  const { user, login, teachers, students } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    if (user) navigate({ to: `/${user.role}` });
  }, [user, navigate]);

  useEffect(() => {
    if (role === "teacher" && !teacherId && teachers[0]) setTeacherId(teachers[0].id);
    if (role === "student" && !studentId && students[0]) setStudentId(students[0].id);
  }, [role, teachers, students, teacherId, studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      login("admin", name.trim() || "Admin Sekolah");
      successToast("Selamat datang, Admin!");
      navigate({ to: "/admin" });
      return;
    }
    if (role === "teacher") {
      const t = teachers.find((x) => x.id === teacherId);
      if (!t) { await swal.fire({ icon: "warning", title: "Pilih guru" }); return; }
      login("teacher", t.name, t.id);
      successToast(`Selamat datang, ${t.name}!`);
      navigate({ to: "/teacher" });
      return;
    }
    const st = students.find((x) => x.id === studentId);
    if (!st) { await swal.fire({ icon: "warning", title: "Pilih siswa" }); return; }
    if (pin.trim() !== st.pin) {
      await swal.fire({ icon: "error", title: "PIN salah", text: `Demo PIN: ${st.pin}` });
      return;
    }
    login("student", st.name, st.id);
    successToast(`Selamat datang, ${st.name}!`);
    navigate({ to: "/student" });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-secondary/40 to-accent/30 flex items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border bg-card shadow-xl md:grid-cols-2">
        <div className="relative hidden md:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg">WhiteBee LMS</div>
                <div className="text-xs opacity-70">Adab &amp; Tarbiyah</div>
              </div>
            </div>
            <h2 className="mt-12 text-3xl font-bold leading-tight">
              Belajar sepenuh hati, <br /> tumbuh berkarakter.
            </h2>
            <p className="mt-3 text-sm opacity-80 max-w-xs">
              Platform pembelajaran modern yang memadukan LMS dengan observasi Adab &amp; Tarbiyah untuk pertumbuhan siswa yang utuh.
            </p>
          </div>
          <div className="text-xs opacity-60">© {new Date().getFullYear()} WhiteBee Education</div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-6 md:hidden flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="font-bold">WhiteBee LMS</div>
          </div>
          <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
          <p className="text-sm text-muted-foreground mt-1">Pilih peran untuk demo dan mulai eksplorasi.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                    active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-[10px] leading-tight text-muted-foreground">{r.desc}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {role === "admin" && (
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" placeholder="Admin Sekolah" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Demo: kata sandi tidak diverifikasi.</p>
              </div>
            )}
            {role === "teacher" && (
              <div>
                <Label>Pilih Guru</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Kelas yang bisa dikelola diatur Admin.</p>
              </div>
            )}
            {role === "student" && (
              <>
                <div>
                  <Label>Pilih Siswa</Label>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pin">PIN Siswa</Label>
                  <Input id="pin" placeholder="Masukkan PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo PIN: {students.find((s) => s.id === studentId)?.pin ?? "-"}
                  </p>
                </div>
              </>
            )}
            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Masuk sebagai {ROLES.find((r) => r.id === role)!.label}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
