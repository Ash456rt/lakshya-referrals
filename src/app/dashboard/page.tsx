import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "My dashboard — Lakshya Referrals" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <Dashboard user={session} />;
}
