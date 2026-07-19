import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
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

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  publishDate: string; // yyyy-mm-dd
  videoLink?: string;
  fileLink?: string;
  instructions?: string;
}

export interface Module {
  id: string;
  subjectId: string;
  title: string;
  fileLink: string;
}

export interface ScheduleItem {
  id: string;
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
  category: IndicatorCategory;
  text: string;
}

export type ObservationValue = "BB" | "MB" | "BSH" | "BSB";

export interface ObservationEntry {
  indicatorId: string;
  value: ObservationValue;
  note: string;
}

export interface ObservationRecord {
  studentId: string;
  month: string; // yyyy-mm
  entries: ObservationEntry[];
}

interface StoreState {
  classes: ClassRoom[];
  subjects: Subject[];
  materials: Material[];
  modules: Module[];
  schedule: ScheduleItem[];
  students: Student[];
  indicators: Indicator[];
  observations: ObservationRecord[];
  announcement: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const today = new Date().toISOString().slice(0, 10);

const initialState: StoreState = {
  classes: [
    { id: "c1", name: "Kelas 4A", grade: "4" },
    { id: "c2", name: "Kelas 5B", grade: "5" },
  ],
  subjects: [
    { id: "s1", name: "Matematika" },
    { id: "s2", name: "Bahasa Indonesia" },
    { id: "s3", name: "Pendidikan Agama Islam" },
  ],
  materials: [
    {
      id: uid(),
      subjectId: "s1",
      title: "Pengenalan Pecahan",
      publishDate: today,
      videoLink: "https://youtube.com/watch?v=example",
      fileLink: "",
      instructions: "Kerjakan latihan halaman 42.",
    },
    {
      id: uid(),
      subjectId: "s3",
      title: "Adab Menuntut Ilmu",
      publishDate: today,
      instructions: "Baca dan ringkas dalam 5 poin.",
    },
  ],
  modules: [
    { id: uid(), subjectId: "s1", title: "Modul Matematika Bab 1", fileLink: "#" },
    { id: uid(), subjectId: "s2", title: "Modul B. Indonesia Bab 1", fileLink: "#" },
  ],
  schedule: [
    { id: uid(), day: "Senin", subject: "Matematika" },
    { id: uid(), day: "Selasa", subject: "Bahasa Indonesia" },
    { id: uid(), day: "Rabu", subject: "Pendidikan Agama Islam" },
    { id: uid(), day: "Kamis", subject: "Matematika" },
    { id: uid(), day: "Jumat", subject: "Bahasa Indonesia" },
  ],
  students: [
    { id: "st1", name: "Ahmad Fauzi", pin: "1234", classId: "c1" },
    { id: "st2", name: "Siti Nurhaliza", pin: "2345", classId: "c1" },
    { id: "st3", name: "Bilal Rahman", pin: "3456", classId: "c2" },
  ],
  indicators: [
    { id: uid(), category: "Adab", text: "Mengucap salam saat bertemu guru" },
    { id: uid(), category: "Adab", text: "Berbicara dengan sopan" },
    { id: uid(), category: "Adab", text: "Menghormati orang tua" },
    { id: uid(), category: "Tarbiyah", text: "Shalat lima waktu tepat waktu" },
    { id: uid(), category: "Tarbiyah", text: "Membaca Al-Qur'an setiap hari" },
  ],
  observations: [],
  announcement:
    "Assalamu'alaikum. Selamat datang di WhiteBee LMS! Silakan cek pelajaran hari ini dan isi Matriks Observasi kalian.",
};

interface StoreContextType extends StoreState {
  user: User | null;
  hydrated: boolean;
  login: (role: Role, name: string) => void;
  logout: () => void;
  set: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  update: (updater: (s: StoreState) => Partial<StoreState>) => void;
  saveObservation: (rec: ObservationRecord) => void;
  uid: () => string;
}



const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "whitebee-lms-v1";
const USER_KEY = "whitebee-lms-user";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setState(JSON.parse(s));
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, hydrated]);

  const ctx: StoreContextType = {
    ...state,
    user,
    login: (role, name) => setUser({ id: uid(), name, role }),
    logout: () => setUser(null),
    set: (key, value) => setState((s) => ({ ...s, [key]: value })),
    update: (updater) => setState((s) => ({ ...s, ...updater(s) })),
    saveObservation: (rec) =>
      setState((s) => {
        const rest = s.observations.filter(
          (o) => !(o.studentId === rec.studentId && o.month === rec.month),
        );
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
