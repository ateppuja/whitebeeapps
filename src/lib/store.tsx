import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  teacherId?: string; // for teacher
  studentId?: string; // for student
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
  classIds: string[];
  code: string;
}


export interface Material {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  publishDate: string;
  videoLink?: string;
  fileLink?: string;
  instructions?: string;
}

export interface Module {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  fileLink: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat";
  subject: string;
}

export interface Student {
  id: string;
  name: string;
  pin: string;
  classId: string;
}

export type IndicatorCategory = "Adab" | "Tarbiyah";

export interface Indicator {
  id: string;
  classId: string;
  month: string; // YYYY-MM
  category: IndicatorCategory;
  text: string;
  title?: string; // Adab: judul (heading), text = sub judul
}


export type ObservationValue = "BB" | "MB" | "BSH" | "BSB";

export interface ObservationEntry {
  indicatorId: string;
  value: ObservationValue;
  note: string;
}

export interface ObservationRecord {
  studentId: string;
  month: string;
  entries: ObservationEntry[];
}

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
  announcements: Record<string, string>; // classId -> text
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
    { id: "st1", name: "Ahmad Fauzi", pin: "1234", classId: C1 },
    { id: "st2", name: "Siti Nurhaliza", pin: "2345", classId: C1 },
    { id: "st3", name: "Bilal Rahman", pin: "3456", classId: C2 },
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
  teacherClasses: ClassRoom[]; // classes visible to the current teacher (or all for admin)
  login: (role: Role, name: string, refId?: string) => void;
  logout: () => void;
  set: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  update: (updater: (s: StoreState) => Partial<StoreState>) => void;
  saveObservation: (rec: ObservationRecord) => void;
  uid: () => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "whitebee-lms-v3";
const USER_KEY = "whitebee-lms-user-v3";
const ACTIVE_CLASS_KEY = "whitebee-lms-active-class-v3";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [activeClassId, setActiveClassIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setState({ ...initialState, ...JSON.parse(s) });
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
      const a = localStorage.getItem(ACTIVE_CLASS_KEY);
      if (a) setActiveClassIdState(a);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state, hydrated]);
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

  // Ensure activeClassId is valid for current teacher
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
    set: (key, value) => setState((s) => ({ ...s, [key]: value })),
    update: (updater) => setState((s) => ({ ...s, ...updater(s) })),
    saveObservation: (rec) =>
      setState((s) => {
        const rest = s.observations.filter((o) => !(o.studentId === rec.studentId && o.month === rec.month));
        return { ...s, observations: [...rest, rec] };
      }),
    uid,
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
