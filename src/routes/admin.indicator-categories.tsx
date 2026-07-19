import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/indicator-categories")({ component: Page });

function Page() {
  const { indicators } = useStore();
  const adab = indicators.filter((i) => i.category === "Adab");
  const tarbiyah = indicators.filter((i) => i.category === "Tarbiyah");

  return (
    <div>
      <PageHeader title="Kategori Observasi" description="Sistem menggunakan dua kategori utama: Adab dan Tarbiyah." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Heart className="h-5 w-5" /></div>
            <CardTitle>Adab</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adab.length}</div>
            <div className="text-sm text-muted-foreground">indikator terdaftar</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles className="h-5 w-5" /></div>
            <CardTitle>Tarbiyah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tarbiyah.length}</div>
            <div className="text-sm text-muted-foreground">indikator terdaftar</div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Guru dapat menambah indikator pada masing-masing kategori dari menu Guru → Indikator Observasi.</p>
    </div>
  );
}
