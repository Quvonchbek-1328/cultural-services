"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app";
import { slugify, cn } from "@/lib/utils";
import { DynamicIcon, ICON_PICKER_NAMES } from "@/lib/icons";
import type { Category, Direction } from "@/lib/types";

const DEFAULT_COLOR = "from-primary-100 to-primary-50 text-primary";

function IconPicker({ value, onPick }: { value: string; onPick: (name: string) => void }) {
  return (
    <div className="grid max-h-32 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border p-2">
      {ICON_PICKER_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => onPick(name)}
          className={cn(
            "flex aspect-square items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary",
            value === name && "bg-primary text-white hover:bg-primary hover:text-white",
          )}
        >
          <DynamicIcon name={name} className="size-4" />
        </button>
      ))}
    </div>
  );
}

export default function AdminTaxonomyPage() {
  const categories = useAppStore((s) => s.categories);
  const directions = useAppStore((s) => s.directions);
  const services = useAppStore((s) => s.services);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const addDirection = useAppStore((s) => s.addDirection);
  const updateDirection = useAppStore((s) => s.updateDirection);
  const deleteDirection = useAppStore((s) => s.deleteDirection);

  const dirCountOf = (catId: string) => directions.filter((d) => d.categoryId === catId).length;
  const svcCountOfDir = (dirId: string) => services.filter((s) => s.directionId === dirId).length;

  // Kategoriya dialog
  const [catForm, setCatForm] = React.useState({ name: "", description: "", icon: "Sparkles", color: DEFAULT_COLOR });
  const [catCreate, setCatCreate] = React.useState(false);
  const [catEdit, setCatEdit] = React.useState<Category | null>(null);
  const [catDelete, setCatDelete] = React.useState<Category | null>(null);

  // Yo'nalish dialog
  const [dirForm, setDirForm] = React.useState({ name: "", description: "", icon: "Sparkles", categoryId: categories[0]?.id ?? "" });
  const [dirCreate, setDirCreate] = React.useState(false);
  const [dirEdit, setDirEdit] = React.useState<Direction | null>(null);
  const [dirDelete, setDirDelete] = React.useState<Direction | null>(null);

  /* --- Kategoriya amallari --- */
  const openCatCreate = () => { setCatForm({ name: "", description: "", icon: "Sparkles", color: DEFAULT_COLOR }); setCatCreate(true); };
  const openCatEdit = (c: Category) => { setCatForm({ name: c.name, description: c.description, icon: c.icon, color: c.color }); setCatEdit(c); };
  const submitCatCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    addCategory({ name: catForm.name.trim(), slug: slugify(catForm.name) || `kat-${categories.length}`, icon: catForm.icon, description: catForm.description.trim(), color: catForm.color });
    setCatCreate(false);
  };
  const submitCatEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catEdit || !catForm.name.trim()) return;
    updateCategory(catEdit.id, { name: catForm.name.trim(), icon: catForm.icon, description: catForm.description.trim(), color: catForm.color });
    setCatEdit(null);
  };

  /* --- Yo'nalish amallari --- */
  const openDirCreate = () => { setDirForm({ name: "", description: "", icon: "Sparkles", categoryId: categories[0]?.id ?? "" }); setDirCreate(true); };
  const openDirEdit = (d: Direction) => { setDirForm({ name: d.name, description: d.description, icon: d.icon, categoryId: d.categoryId }); setDirEdit(d); };
  const submitDirCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirForm.name.trim() || !dirForm.categoryId) return;
    addDirection({ categoryId: dirForm.categoryId, name: dirForm.name.trim(), slug: slugify(dirForm.name) || `yon-${directions.length}`, icon: dirForm.icon, description: dirForm.description.trim() });
    setDirCreate(false);
  };
  const submitDirEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirEdit || !dirForm.name.trim()) return;
    updateDirection(dirEdit.id, { categoryId: dirForm.categoryId, name: dirForm.name.trim(), icon: dirForm.icon, description: dirForm.description.trim() });
    setDirEdit(null);
  };

  const categoryFields = (form: typeof catForm, set: typeof setCatForm) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nomi</Label>
        <Input value={form.name} onChange={(e) => set((f) => ({ ...f, name: e.target.value }))} placeholder="Masalan: To'y va marosimlar" required />
      </div>
      <div className="space-y-1.5">
        <Label>Tavsif</Label>
        <Textarea value={form.description} onChange={(e) => set((f) => ({ ...f, description: e.target.value }))} maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label>Ikonka</Label>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary"><DynamicIcon name={form.icon} className="size-5" /></div>
          <span className="text-sm text-muted-foreground">{form.icon}</span>
        </div>
        <IconPicker value={form.icon} onPick={(name) => set((f) => ({ ...f, icon: name }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Rang klassi (ixtiyoriy)</Label>
        <Input value={form.color} onChange={(e) => set((f) => ({ ...f, color: e.target.value }))} placeholder={DEFAULT_COLOR} />
      </div>
    </div>
  );

  const directionFields = (form: typeof dirForm, set: typeof setDirForm) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nomi</Label>
        <Input value={form.name} onChange={(e) => set((f) => ({ ...f, name: e.target.value }))} placeholder="Masalan: Maqom ansambli" required />
      </div>
      <div className="space-y-1.5">
        <Label>Kategoriya</Label>
        <Select value={form.categoryId} onChange={(e) => set((f) => ({ ...f, categoryId: e.target.value }))} required>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Tavsif</Label>
        <Textarea value={form.description} onChange={(e) => set((f) => ({ ...f, description: e.target.value }))} maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label>Ikonka</Label>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary"><DynamicIcon name={form.icon} className="size-5" /></div>
          <span className="text-sm text-muted-foreground">{form.icon}</span>
        </div>
        <IconPicker value={form.icon} onPick={(name) => set((f) => ({ ...f, icon: name }))} />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Kategoriyalar va yo'nalishlar"
        description="Ikki darajali taksonomiya: kategoriya → yo'nalish."
        actions={<Button onClick={openCatCreate}><Plus /> Yangi kategoriya</Button>}
      />

      {/* Kategoriyalar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className={cn("flex size-12 items-center justify-center rounded-xl bg-gradient-to-br", c.color)}>
                <DynamicIcon name={c.icon} className="size-6" />
              </div>
              <div className="flex gap-2">
                <Badge variant="neutral">{dirCountOf(c.id)} yo'nalish</Badge>
              </div>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{c.name}</h3>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{c.description || "Tavsif yo'q."}</p>
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openCatEdit(c)}><Pencil /> Tahrirlash</Button>
              <Button size="sm" variant="ghost" onClick={() => setCatDelete(c)}><Trash2 className="text-[var(--color-danger)]" /></Button>
            </div>
          </div>
        ))}
      </div>

      {/* Yo'nalishlar */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-tight">Yo'nalishlar</h2>
        <Button variant="outline" onClick={openDirCreate} disabled={categories.length === 0}><Plus /> Yangi yo'nalish</Button>
      </div>
      <div className="mt-4 space-y-6">
        {categories.map((c) => {
          const dirs = directions.filter((d) => d.categoryId === c.id);
          if (dirs.length === 0) return null;
          return (
            <div key={c.id}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.name}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dirs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-soft">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary"><DynamicIcon name={d.icon} className="size-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{svcCountOfDir(d.id)} ta xizmat</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openDirEdit(d)}><Pencil className="size-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDirDelete(d)}><Trash2 className="size-4 text-[var(--color-danger)]" /></Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kategoriya dialoglari */}
      <Dialog open={catCreate} onClose={() => setCatCreate(false)} title="Yangi kategoriya">
        <form onSubmit={submitCatCreate}>{categoryFields(catForm, setCatForm)}
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setCatCreate(false)}>Bekor qilish</Button><Button type="submit" disabled={!catForm.name.trim()}><Plus /> Qo'shish</Button></div>
        </form>
      </Dialog>
      <Dialog open={!!catEdit} onClose={() => setCatEdit(null)} title="Kategoriyani tahrirlash" description={catEdit?.name}>
        <form onSubmit={submitCatEdit}>{categoryFields(catForm, setCatForm)}
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setCatEdit(null)}>Bekor qilish</Button><Button type="submit" disabled={!catForm.name.trim()}>Saqlash</Button></div>
        </form>
      </Dialog>
      <Dialog open={!!catDelete} onClose={() => setCatDelete(null)} title="Kategoriyani o'chirish">
        {catDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
              <p className="text-foreground"><span className="font-semibold">{catDelete.name}</span> o'chirilsa, unga tegishli <span className="font-semibold">{dirCountOf(catDelete.id)} ta yo'nalish</span> ham o'chadi.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCatDelete(null)}>Bekor qilish</Button>
              <Button variant="danger" onClick={() => { deleteCategory(catDelete.id); setCatDelete(null); }}><Trash2 /> O'chirish</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Yo'nalish dialoglari */}
      <Dialog open={dirCreate} onClose={() => setDirCreate(false)} title="Yangi yo'nalish">
        <form onSubmit={submitDirCreate}>{directionFields(dirForm, setDirForm)}
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setDirCreate(false)}>Bekor qilish</Button><Button type="submit" disabled={!dirForm.name.trim()}><Plus /> Qo'shish</Button></div>
        </form>
      </Dialog>
      <Dialog open={!!dirEdit} onClose={() => setDirEdit(null)} title="Yo'nalishni tahrirlash" description={dirEdit?.name}>
        <form onSubmit={submitDirEdit}>{directionFields(dirForm, setDirForm)}
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setDirEdit(null)}>Bekor qilish</Button><Button type="submit" disabled={!dirForm.name.trim()}>Saqlash</Button></div>
        </form>
      </Dialog>
      <Dialog open={!!dirDelete} onClose={() => setDirDelete(null)} title="Yo'nalishni o'chirish">
        {dirDelete && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{dirDelete.name}</span> yo'nalishini o'chirmoqchimisiz? Unga bog'langan {svcCountOfDir(dirDelete.id)} ta xizmat yo'nalishsiz qoladi.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDirDelete(null)}>Bekor qilish</Button>
              <Button variant="danger" onClick={() => { deleteDirection(dirDelete.id); setDirDelete(null); }}><Trash2 /> O'chirish</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
