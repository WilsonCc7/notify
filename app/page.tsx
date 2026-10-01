import { getSessionUser } from "@/lib/session";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// One route, two shells (DESIGN.md section 2). Server decides, never the client.
export default async function Page() {
  const user = await getSessionUser();

  if (!user) return <LandingPage />;

  return <DashboardShell user={user} />;
}