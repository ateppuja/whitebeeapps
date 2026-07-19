import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user === null) return;
    if (user.role !== "teacher") navigate({ to: "/" });
  }, [user, navigate]);
  if (!user || user.role !== "teacher") return null;
  return (
    <AppShell role="teacher">
      <Outlet />
    </AppShell>
  );
}
