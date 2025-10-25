import SidebarLayout from "@/components/layout/SideBarLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarLayout>{children}</SidebarLayout>
    </ProtectedRoute>
  );
}
