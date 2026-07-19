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
  const { indicators, adabTitles, set, uid, activeClassId, classes } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Indicator | null>(null);
  const [category, setCategory] = useState<IndicatorCategory>("Adab");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [newTitleMode, setNewTitleMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const className = classes.find((c) => c.id === activeClassId)?.name ?? "";
  const classIndicators = indicators.filter((i) => i.classId === activeClassId);

  const openNew = (cat?: IndicatorCategory) => {
    setEditing(null); setCategory(cat ?? "Adab"); setTitle(adabTitles[0] ?? ""); setText(""); setNewTitleMode(false); setNewTitle(""); setOpen(true);
  };
  const openEdit = (i: Indicator) => {
    setEditing(i); setCategory(i.category); setTitle(i.title ?? ""); setText(i.text); setNewTitleMode(false); setNewTitle(""); setOpen(true);
  };
  const addTitle = () => {
    const t = newTitle.trim();
    if (!t) return;
    if (!adabTitles.includes(t)) set("adabTitles", [...adabTitles, t]);
    setTitle(t);
    setNewTitle("");
    setNewTitleMode(false);
  };
  const save = () => {
    if (!text.trim() || !activeClassId) return;
    if (category === "Adab" && !title.trim()) return;
    const data: Indicator = {
      id: editing?.id ?? uid(),
      classId: activeClassId,
      category,
      text: text.trim(),
      title: category === "Adab" ? title.trim() : undefined,
    };
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

  const adabList = classIndicators.filter((i) => i.category === "Adab");
  const tarbiyahList = classIndicators.filter((i) => i.category === "Tarbiyah");

  // Group Adab by title
  const adabGrouped: Record<string, Indicator[]> = {};
  adabList.forEach((i) => {
    const k = i.title || "(Tanpa Judul)";
    (adabGrouped[k] ||= []).push(i);
  });

  return (
    <div>
      <PageHeader title="Indikator Observasi" description={`Indikator Adab & Tarbiyah untuk ${className}.`}
        actions={<Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-1" /> Indikator Baru</Button>} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Heart className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Adab</div>
                <div className="text-xs text-muted-foreground">{adabList.length} indikator · {Object.keys(adabGrouped).length} judul</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => openNew("Adab")}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              {Object.entries(adabGrouped).map(([grp, items]) => (
                <div key={grp}>
                  <div className="text-xs font-bold uppercase tracking-wide text-primary mb-2">{grp}</div>
                  <div className="space-y-2">
                    {items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="text-sm min-w-0 truncate">{i.text}</div>
                        <div className="flex shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {adabList.length === 0 && <p className="text-sm text-muted-foreground italic">Belum ada indikator.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Tarbiyah</div>
                <div className="text-xs text-muted-foreground">{tarbiyahList.length} indikator</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => openNew("Tarbiyah")}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              {tarbiyahList.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="text-sm min-w-0 truncate">{i.text}</div>
                  <div className="flex shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {tarbiyahList.length === 0 && <p className="text-sm text-muted-foreground italic">Belum ada indikator.</p>}
            </div>
          </CardContent>
        </Card>
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

            {category === "Adab" && (
              <div>
                <Label>Judul Adab</Label>
                <div className="mt-1.5 flex gap-2">
                  <Select value={title} onValueChange={setTitle}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih judul..." /></SelectTrigger>
                    <SelectContent>
                      {adabTitles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewTitleMode((v) => !v)}>
                    <Plus className="h-4 w-4 mr-1" /> Judul
                  </Button>
                </div>
                {newTitleMode && (
                  <div className="mt-2 flex gap-2">
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul adab baru..." />
                    <Button type="button" size="sm" onClick={addTitle}>Tambah</Button>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>{category === "Adab" ? "Sub Judul (deskripsi indikator)" : "Deskripsi Indikator"}</Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1.5" placeholder={category === "Adab" ? "Contoh: Mengucap salam saat bertemu guru" : "Deskripsi..."} />
            </div>
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
