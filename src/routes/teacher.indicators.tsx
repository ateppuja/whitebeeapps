import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, type Indicator, type IndicatorCategory } from "@/lib/store";
import { confirmDelete, successToast } from "@/lib/swal";
import { Heart, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { NoClassSelected } from "@/components/NoClassSelected";

export const Route = createFileRoute("/teacher/indicators")({ component: IndicatorsPage });

function IndicatorsPage() {
  const { indicators, set, uid, activeClassId, classes } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Indicator | null>(null);
  const [category, setCategory] = useState<IndicatorCategory>("Adab");
  const [text, setText] = useState("");

  const className = classes.find((c) => c.id === activeClassId)?.name ?? "";
  const classIndicators = indicators.filter((i) => i.classId === activeClassId);

  const openNew = (cat?: IndicatorCategory) => {
    setEditing(null); setCategory(cat ?? "Adab"); setText(""); setOpen(true);
  };
  const openEdit = (i: Indicator) => { setEditing(i); setCategory(i.category); setText(i.text); setOpen(true); };
  const save = () => {
    if (!text.trim() || !activeClassId) return;
    const data: Indicator = { id: editing?.id ?? uid(), classId: activeClassId, category, text };
    if (editing) set("indicators", indicators.map((x) => x.id === editing.id ? data : x));
    else set("indicators", [...indicators, data]);
    successToast("Tersimpan");
    setOpen(false);
  };
  const remove = async (i: Indicator) => {
    if (await confirmDelete(i.text)) {
      set("indicators", indicators.filter((x) => x.id !== i.id));
      successToast("Dihapus");
    }
  };

  if (!activeClassId) return <NoClassSelected />;

  const groups: { cat: IndicatorCategory; icon: typeof Heart; tone: string }[] = [
    { cat: "Adab", icon: Heart, tone: "bg-primary/10 text-primary" },
    { cat: "Tarbiyah", icon: Sparkles, tone: "bg-accent text-accent-foreground" },
  ];

  return (
    <div>
      <PageHeader title="Indikator Observasi" description={`Indikator Adab & Tarbiyah untuk ${className}.`}
        actions={<Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-1" /> Indikator Baru</Button>} />

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(({ cat, icon: Icon, tone }) => {
          const list = classIndicators.filter((i) => i.category === cat);
          return (
            <Card key={cat}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div>
                  <div>
                    <div className="font-semibold">{cat}</div>
                    <div className="text-xs text-muted-foreground">{list.length} indikator</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => openNew(cat)}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2">
                  {list.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="text-sm min-w-0 truncate">{i.text}</div>
                      <div className="flex shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && <p className="text-sm text-muted-foreground italic">Belum ada indikator.</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Indikator" : "Indikator Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs">
              Kelas: <span className="font-semibold text-primary">{className}</span>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IndicatorCategory)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adab">Adab</SelectItem>
                  <SelectItem value="Tarbiyah">Tarbiyah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Deskripsi Indikator</Label><Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
