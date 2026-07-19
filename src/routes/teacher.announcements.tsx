import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { successToast } from "@/lib/swal";
import { Megaphone, Save } from "lucide-react";

export const Route = createFileRoute("/teacher/announcements")({ component: AnnouncementsPage });

function AnnouncementsPage() {
  const { announcement, set } = useStore();
  const [text, setText] = useState(announcement);

  const save = () => {
    set("announcement", text);
    successToast("Pengumuman disimpan");
  };

  return (
    <div>
      <PageHeader title="Pengumuman" description="Kirim pesan ke seluruh siswa." />
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Megaphone className="h-5 w-5" />
            <div className="font-semibold">Pesan untuk Siswa</div>
          </div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Tulis pengumuman di sini..." />
          <Button onClick={save} className="w-full sm:w-auto"><Save className="h-4 w-4 mr-1" /> Simpan Pengumuman</Button>
        </CardContent>
      </Card>
    </div>
  );
}
