import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user === null) return;
    if (user.role !== "student") navigate({ to: "/" });
  }, [user, navigate]);
  if (!user || user.role !== "student") return null;
  return (
    <AppShell role="student">
      <Outlet />
    </AppShell>
  );
}
