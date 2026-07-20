import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  teacherId?: string;
  studentId?: string;
}

export interface ClassRoom { id: string; name: string; grade: string; }
export interface Subject { id: string; name: string; }
export interface Teacher { id: string; name: string; classIds: string[]; code: string; }

export interface Material {
  id: string; classId: string; subjectId: string; title: string; publishDate: string;
  videoLink?: string; fileLink?: string; instructions?: string;
}
export interface Module { id: string; classId: string; subjectId: string; title: string; fileLink: string; }
export interface ScheduleItem { id: string; classId: string; day: "Senin"|"Selasa"|"Rabu"|"Kamis"|"Jumat"; subject: string; }
export type StudentStatus = "Reguler" | "Online";
export interface Student { id: string; name: string; pin: string; classId: string; status: StudentStatus; }
export type IndicatorCategory = "Adab" | "Tarbiyah";
export interface Indicator { id: string; classId: string; month: string; category: IndicatorCategory; text: string; title?: string; }
export type ObservationValue = "BB" | "MB" | "BSH" | "BSB";
export interface ObservationEntry { indicatorId: string; value: ObservationValue; note: string; }
export interface ObservationRecord { studentId: string; month: string; entries: ObservationEntry[]; }
export type AttendanceStatus = "H" | "I" | "S" | "A";
export interface AttendanceRecord { studentId: string; date: string; status: AttendanceStatus; }
export interface Grade { id: string; classId: string; subjectId: string; studentId: string; title: string; score: number; }

interface StoreState {
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  materials: Material[];
  modules: Module[];
  schedule: ScheduleItem[];
  students: Student[];
  indicators: Indicator[];
  adabTitles: string[];
  observations: ObservationRecord[];
  attendance: AttendanceRecord[];
  grades: Grade[];
  announcements: Record<string, string>;
  adminCode: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = new Date().toISOString().slice(0, 10);

const C1 = "c1", C2 = "c2";
const S1 = "s1", S2 = "s2", S3 = "s3";
const T1 = "t1", T2 = "t2";

const initialState: StoreState = {
  classes: [
    { id: C1, name: "Kelas 4A", grade: "4" },
    { id: C2, name: "Kelas 5B", grade: "5" },
  ],
  subjects: [
    { id: S1, name: "Matematika" },
    { id: S2, name: "Bahasa Indonesia" },
    { id: S3, name: "Pendidikan Agama Islam" },
  ],
  teachers: [
    { id: T1, name: "Ustadz Hasan", classIds: [C1, C2], code: "GURU1" },
    { id: T2, name: "Ustadzah Aisyah", classIds: [C1], code: "GURU2" },
  ],
  materials: [
    { id: uid(), classId: C1, subjectId: S1, title: "Pengenalan Pecahan", publishDate: today, videoLink: "https://youtube.com/watch?v=example", fileLink: "", instructions: "Kerjakan latihan halaman 42." },
    { id: uid(), classId: C1, subjectId: S3, title: "Adab Menuntut Ilmu", publishDate: today, instructions: "Baca dan ringkas dalam 5 poin." },
    { id: uid(), classId: C2, subjectId: S1, title: "Bilangan Bulat", publishDate: today, instructions: "Kerjakan soal 1-10." },
  ],
  modules: [
    { id: uid(), classId: C1, subjectId: S1, title: "Modul Matematika 4A Bab 1", fileLink: "#" },
    { id: uid(), classId: C1, subjectId: S2, title: "Modul B. Indonesia 4A Bab 1", fileLink: "#" },
    { id: uid(), classId: C2, subjectId: S1, title: "Modul Matematika 5B Bab 1", fileLink: "#" },
  ],
  schedule: [
    { id: uid(), classId: C1, day: "Senin", subject: "Matematika" },
    { id: uid(), classId: C1, day: "Selasa", subject: "Bahasa Indonesia" },
    { id: uid(), classId: C1, day: "Rabu", subject: "Pendidikan Agama Islam" },
    { id: uid(), classId: C2, day: "Senin", subject: "Bahasa Indonesia" },
    { id: uid(), classId: C2, day: "Rabu", subject: "Matematika" },
  ],
  students: [
    { id: "st1", name: "Ahmad Fauzi", pin: "1234", classId: C1, status: "Reguler" },
    { id: "st2", name: "Siti Nurhaliza", pin: "2345", classId: C1, status: "Online" },
    { id: "st3", name: "Bilal Rahman", pin: "3456", classId: C2, status: "Reguler" },
  ],
  indicators: (() => {
    const m = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
    return [
      { id: uid(), classId: C1, month: m, category: "Adab" as const, title: "Adab kepada Guru", text: "Mengucap salam saat bertemu guru" },
      { id: uid(), classId: C1, month: m, category: "Adab" as const, title: "Adab Berbicara", text: "Berbicara dengan sopan" },
      { id: uid(), classId: C1, month: m, category: "Tarbiyah" as const, text: "Shalat lima waktu tepat waktu" },
      { id: uid(), classId: C1, month: m, category: "Tarbiyah" as const, text: "Membaca Al-Qur'an setiap hari" },
      { id: uid(), classId: C2, month: m, category: "Adab" as const, title: "Adab kepada Orang Tua", text: "Menghormati orang tua" },
      { id: uid(), classId: C2, month: m, category: "Tarbiyah" as const, text: "Menghafal surah pendek" },
    ];
  })(),
  adabTitles: ["Adab kepada Guru", "Adab kepada Orang Tua", "Adab Berbicara", "Adab Belajar", "Adab Makan & Minum"],
  observations: [],
  attendance: [],
  grades: [],
  announcements: {
    [C1]: "Assalamu'alaikum Kelas 4A. Jangan lupa isi Matriks Observasi bulan ini.",
    [C2]: "Assalamu'alaikum Kelas 5B. Selamat belajar hari ini!",
  },
  adminCode: "ADMIN123",
};

interface StoreContextType extends StoreState {
  user: User | null;
  hydrated: boolean;
  activeClassId: string | null;
  setActiveClassId: (id: string) => void;
  teacherClasses: ClassRoom[];
  login: (role: Role, name: string, refId?: string) => void;
  logout: () => void;
  set: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  update: (updater: (s: StoreState) => Partial<StoreState>) => void;
  saveObservation: (rec: ObservationRecord) => void;
  saveAttendance: (rec: AttendanceRecord) => void;
  uid: () => string;
}

const StoreContext = createContext<StoreContextType | null>(null);
const USER_KEY = "whitebee-lms-user-v4";
const ACTIVE_CLASS_KEY = "whitebee-lms-active-class-v4";

// ---------- cloud mappers ----------
const db: any = supabase;

const toRow = {
  classes: (x: ClassRoom) => ({ id: x.id, name: x.name, grade: x.grade }),
  subjects: (x: Subject) => ({ id: x.id, name: x.name }),
  teachers: (x: Teacher) => ({ id: x.id, name: x.name, code: x.code, class_ids: x.classIds }),
  materials: (x: Material) => ({ id: x.id, class_id: x.classId, subject_id: x.subjectId, title: x.title, publish_date: x.publishDate, video_link: x.videoLink ?? null, file_link: x.fileLink ?? null, instructions: x.instructions ?? null }),
  modules: (x: Module) => ({ id: x.id, class_id: x.classId, subject_id: x.subjectId, title: x.title, file_link: x.fileLink }),
  schedule: (x: ScheduleItem) => ({ id: x.id, class_id: x.classId, day: x.day, subject: x.subject }),
  students: (x: Student) => ({ id: x.id, name: x.name, pin: x.pin, class_id: x.classId, status: x.status }),
  indicators: (x: Indicator) => ({ id: x.id, class_id: x.classId, month: x.month, category: x.category, text: x.text, title: x.title ?? null }),
  adab_titles: (t: string) => ({ title: t }),
  observations: (x: ObservationRecord) => ({ student_id: x.studentId, month: x.month, entries: x.entries }),
  attendance: (x: AttendanceRecord) => ({ student_id: x.studentId, date: x.date, status: x.status }),
  grades: (x: Grade) => ({ id: x.id, class_id: x.classId, subject_id: x.subjectId, student_id: x.studentId, title: x.title, score: x.score }),
};

const fromRow = {
  classes: (r: any): ClassRoom => ({ id: r.id, name: r.name, grade: r.grade }),
  subjects: (r: any): Subject => ({ id: r.id, name: r.name }),
  teachers: (r: any): Teacher => ({ id: r.id, name: r.name, code: r.code, classIds: r.class_ids ?? [] }),
  materials: (r: any): Material => ({ id: r.id, classId: r.class_id, subjectId: r.subject_id, title: r.title, publishDate: r.publish_date, videoLink: r.video_link ?? undefined, fileLink: r.file_link ?? undefined, instructions: r.instructions ?? undefined }),
  modules: (r: any): Module => ({ id: r.id, classId: r.class_id, subjectId: r.subject_id, title: r.title, fileLink: r.file_link }),
  schedule: (r: any): ScheduleItem => ({ id: r.id, classId: r.class_id, day: r.day, subject: r.subject }),
  students: (r: any): Student => ({ id: r.id, name: r.name, pin: r.pin, classId: r.class_id, status: r.status }),
  indicators: (r: any): Indicator => ({ id: r.id, classId: r.class_id, month: r.month, category: r.category, text: r.text, title: r.title ?? undefined }),
  observations: (r: any): ObservationRecord => ({ studentId: r.student_id, month: r.month, entries: r.entries ?? [] }),
  attendance: (r: any): AttendanceRecord => ({ studentId: r.student_id, date: r.date, status: r.status }),
};

// Delete-all then insert. Works regardless of PK.
async function replaceTable(table: string, pkCol: string, rows: any[]) {
  await db.from(table).delete().not(pkCol, "is", null);
  if (rows.length) await db.from(table).insert(rows);
}

async function loadAll(): Promise<StoreState | null> {
  try {
    const [c, s, t, m, mo, sch, st, ind, ad, ob, an, se, at] = await Promise.all([
      db.from("classes").select("*"),
      db.from("subjects").select("*"),
      db.from("teachers").select("*"),
      db.from("materials").select("*"),
      db.from("modules").select("*"),
      db.from("schedule").select("*"),
      db.from("students").select("*"),
      db.from("indicators").select("*"),
      db.from("adab_titles").select("*"),
      db.from("observations").select("*"),
      db.from("announcements").select("*"),
      db.from("settings").select("*"),
      db.from("attendance").select("*"),
    ]);
    const announcements: Record<string, string> = {};
    (an.data ?? []).forEach((r: any) => { announcements[r.class_id] = r.text; });
    const settings: Record<string, string> = {};
    (se.data ?? []).forEach((r: any) => { settings[r.key] = r.value; });
    return {
      classes: (c.data ?? []).map(fromRow.classes),
      subjects: (s.data ?? []).map(fromRow.subjects),
      teachers: (t.data ?? []).map(fromRow.teachers),
      materials: (m.data ?? []).map(fromRow.materials),
      modules: (mo.data ?? []).map(fromRow.modules),
      schedule: (sch.data ?? []).map(fromRow.schedule),
      students: (st.data ?? []).map(fromRow.students),
      indicators: (ind.data ?? []).map(fromRow.indicators),
      adabTitles: (ad.data ?? []).map((r: any) => r.title),
      observations: (ob.data ?? []).map(fromRow.observations),
      attendance: (at.data ?? []).map(fromRow.attendance),
      announcements,
      adminCode: settings.adminCode ?? initialState.adminCode,
    };
  } catch (e) {
    console.error("[cloud] load failed", e);
    return null;
  }
}

async function seedAll(s: StoreState) {
  await Promise.all([
    replaceTable("classes", "id", s.classes.map(toRow.classes)),
    replaceTable("subjects", "id", s.subjects.map(toRow.subjects)),
    replaceTable("teachers", "id", s.teachers.map(toRow.teachers)),
    replaceTable("materials", "id", s.materials.map(toRow.materials)),
    replaceTable("modules", "id", s.modules.map(toRow.modules)),
    replaceTable("schedule", "id", s.schedule.map(toRow.schedule)),
    replaceTable("students", "id", s.students.map(toRow.students)),
    replaceTable("indicators", "id", s.indicators.map(toRow.indicators)),
    replaceTable("adab_titles", "title", s.adabTitles.map(toRow.adab_titles)),
    replaceTable("observations", "student_id", s.observations.map(toRow.observations)),
    replaceTable("announcements", "class_id", Object.entries(s.announcements).map(([class_id, text]) => ({ class_id, text }))),
    db.from("settings").upsert({ key: "adminCode", value: s.adminCode }),
  ]);
}

async function syncKey<K extends keyof StoreState>(key: K, value: StoreState[K]) {
  try {
    switch (key) {
      case "classes": return await replaceTable("classes", "id", (value as ClassRoom[]).map(toRow.classes));
      case "subjects": return await replaceTable("subjects", "id", (value as Subject[]).map(toRow.subjects));
      case "teachers": return await replaceTable("teachers", "id", (value as Teacher[]).map(toRow.teachers));
      case "materials": return await replaceTable("materials", "id", (value as Material[]).map(toRow.materials));
      case "modules": return await replaceTable("modules", "id", (value as Module[]).map(toRow.modules));
      case "schedule": return await replaceTable("schedule", "id", (value as ScheduleItem[]).map(toRow.schedule));
      case "students": return await replaceTable("students", "id", (value as Student[]).map(toRow.students));
      case "indicators": return await replaceTable("indicators", "id", (value as Indicator[]).map(toRow.indicators));
      case "adabTitles": return await replaceTable("adab_titles", "title", (value as string[]).map(toRow.adab_titles));
      case "observations": return await replaceTable("observations", "student_id", (value as ObservationRecord[]).map(toRow.observations));
      case "announcements": {
        const rows = Object.entries(value as Record<string, string>).map(([class_id, text]) => ({ class_id, text }));
        return await replaceTable("announcements", "class_id", rows);
      }
      case "adminCode": {
        await db.from("settings").upsert({ key: "adminCode", value: value as string });
        return;
      }
    }
  } catch (e) {
    console.error(`[cloud] sync ${String(key)} failed`, e);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [activeClassId, setActiveClassIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const skipSync = useRef(true);

  useEffect(() => {
    (async () => {
      const loaded = await loadAll();
      if (loaded && loaded.classes.length > 0) {
        setState(loaded);
      } else {
        // First run: seed cloud with initial data
        await seedAll(initialState);
        setState(initialState);
      }
      try {
        const u = localStorage.getItem(USER_KEY);
        if (u) setUser(JSON.parse(u));
        const a = localStorage.getItem(ACTIVE_CLASS_KEY);
        if (a) setActiveClassIdState(a);
      } catch {}
      setHydrated(true);
      // Allow subsequent state changes to sync
      setTimeout(() => { skipSync.current = false; }, 0);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (activeClassId) localStorage.setItem(ACTIVE_CLASS_KEY, activeClassId);
  }, [activeClassId, hydrated]);

  const teacherClasses = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return state.classes;
    if (user.role === "teacher") {
      const t = state.teachers.find((x) => x.id === user.teacherId);
      const ids = t?.classIds ?? [];
      return state.classes.filter((c) => ids.includes(c.id));
    }
    return [];
  }, [user, state.classes, state.teachers]);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (user.role === "teacher") {
      if (!activeClassId || !teacherClasses.some((c) => c.id === activeClassId)) {
        if (teacherClasses[0]) setActiveClassIdState(teacherClasses[0].id);
      }
    }
  }, [hydrated, user, teacherClasses, activeClassId]);

  const setActiveClassId = (id: string) => setActiveClassIdState(id);

  const ctx: StoreContextType = {
    ...state,
    user,
    hydrated,
    activeClassId,
    setActiveClassId,
    teacherClasses,
    login: (role, name, refId) => {
      if (role === "teacher") {
        const t = state.teachers.find((x) => x.id === refId) ?? state.teachers[0];
        setUser({ id: uid(), name: t?.name ?? name, role, teacherId: t?.id });
        if (t?.classIds[0]) setActiveClassIdState(t.classIds[0]);
      } else if (role === "student") {
        const st = state.students.find((x) => x.id === refId);
        setUser({ id: uid(), name: st?.name ?? name, role, studentId: st?.id });
      } else {
        setUser({ id: uid(), name, role });
      }
    },
    logout: () => { setUser(null); },
    set: (key, value) => {
      setState((s) => ({ ...s, [key]: value }));
      if (!skipSync.current) void syncKey(key, value);
    },
    update: (updater) => {
      setState((s) => {
        const patch = updater(s);
        const next = { ...s, ...patch };
        if (!skipSync.current) {
          (Object.keys(patch) as (keyof StoreState)[]).forEach((k) => void syncKey(k, next[k]));
        }
        return next;
      });
    },
    saveObservation: (rec) => {
      setState((s) => {
        const rest = s.observations.filter((o) => !(o.studentId === rec.studentId && o.month === rec.month));
        return { ...s, observations: [...rest, rec] };
      });
      if (!skipSync.current) {
        void db.from("observations").upsert(toRow.observations(rec));
      }
    },
    saveAttendance: (rec) => {
      setState((s) => {
        const rest = s.attendance.filter((a) => !(a.studentId === rec.studentId && a.date === rec.date));
        return { ...s, attendance: [...rest, rec] };
      });
      if (!skipSync.current) {
        void db.from("attendance").upsert(toRow.attendance(rec));
      }
    },
    uid,
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
