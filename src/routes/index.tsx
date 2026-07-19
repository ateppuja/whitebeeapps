import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, type Role } from "@/lib/store";
import { swal, successToast } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Shield, BookOpen, User } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

const ROLES: { id: Role; label: string; desc: string; icon: typeof Shield; demoName: string }[] = [
  { id: "admin", label: "Admin", desc: "Kelola sekolah & sistem", icon: Shield, demoName: "Admin Sekolah" },
  { id: "teacher", label: "Guru", desc: "Materi, modul & observasi", icon: BookOpen, demoName: "Ustadz Hasan" },
  { id: "student", label: "Siswa", desc: "Belajar & self-assessment", icon: User, demoName: "Ahmad Fauzi" },
];

function LoginPage() {
  const { user, login } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (user) navigate({ to: `/${user.role}` });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = name.trim() || ROLES.find((r) => r.id === role)!.demoName;
    if (role === "student" && pin.trim().length < 3) {
      await swal.fire({ icon: "warning", title: "PIN diperlukan", text: "Masukkan PIN minimal 3 karakter." });
      return;
    }
    login(role, displayName);
    successToast(`Selamat datang, ${displayName}!`);
    navigate({ to: `/${role}` });
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
          <p className="text-sm text-muted-foreground mt-1">
            Pilih peran untuk demo dan mulai eksplorasi.
          </p>

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
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
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
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                placeholder={ROLES.find((r) => r.id === role)!.demoName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {role === "student" ? (
              <div>
                <Label htmlFor="pin">PIN Siswa</Label>
                <Input
                  id="pin"
                  placeholder="Masukkan PIN Anda"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Demo: gunakan PIN apa saja min. 3 karakter.</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="pw">Kata Sandi</Label>
                <Input id="pw" type="password" placeholder="••••••••" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Demo: tidak diverifikasi.</p>
              </div>
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
