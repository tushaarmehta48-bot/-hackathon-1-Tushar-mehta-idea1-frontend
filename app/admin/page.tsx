"use client";

import { RolePortal } from "@/components/auth/role-portal";
import { AdminConsole } from "@/components/admin/admin-console";

export default function AdminPage() {
  return (
    <main id="main" className="flex min-h-dvh flex-1 flex-col">
      <RolePortal
        portal="admin"
        titleKey="adminTitle"
        dashboardKey="adminDashboard"
        allowedRoles={["ADMIN"]}
        redirectPath="/admin"
        wrongRoleRedirect="/staff"
        renderDashboard={({ me, signOut }) => <AdminConsole me={me} onSignOut={signOut} />}
      />
    </main>
  );
}
