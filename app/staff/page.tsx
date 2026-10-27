"use client";

import { RolePortal } from "@/components/auth/role-portal";
import { StaffDesk } from "@/components/staff/staff-desk";

export default function StaffPage() {
  return (
    <main id="main" className="flex flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <RolePortal
        portal="staff"
        titleKey="staffTitle"
        dashboardKey="staffDashboard"
        allowedRoles={["STAFF", "ADMIN"]}
        redirectPath="/staff"
        renderDashboard={({ me, signOut }) => <StaffDesk me={me} onSignOut={signOut} />}
      />
    </main>
  );
}
