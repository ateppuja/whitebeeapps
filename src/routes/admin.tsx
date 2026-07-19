import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user === null) return;
    if (user.role !== "admin") navigate({ to: "/" });
  }, [user, navigate]);
  if (!user || user.role !== "admin") return null;
  return (
    <AppShell role="admin">
      <Outlet />
    </AppShell>
  );
}
