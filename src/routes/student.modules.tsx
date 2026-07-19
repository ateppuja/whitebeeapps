import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { FolderOpen, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/student/modules")({ component: ModulesPage });

function ModulesPage() {
  const { subjects, modules } = useStore();
  return (
    <div>
      <PageHeader title="Kumpulan Modul" description="Unduh atau lihat modul per kategori." />
      <div className="space-y-4">
        {subjects.map((s) => {
          const list = modules.filter((m) => m.subjectId === s.id);
          return (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div className="font-semibold">{s.name}</div>
                  <span className="text-xs text-muted-foreground">({list.length} file)</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Belum ada modul.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {list.map((m) => (
                      <a key={m.id} href={m.fileLink} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="text-sm font-medium truncate">{m.title}</div>
                        </div>
                        <Download className="h-4 w-4 text-primary shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
