import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/student/")({ component: InfoPage });

function InfoPage() {
  const { announcement, user } = useStore();
  return (
    <div>
      <PageHeader title={`Assalamu'alaikum, ${user?.name ?? "Siswa"} 👋`} description="Selamat datang kembali. Berikut informasi terbaru dari guru." />
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Megaphone className="h-5 w-5" />
            <div className="font-semibold">Pengumuman</div>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
            {announcement || <span className="text-muted-foreground italic">Belum ada pengumuman.</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
