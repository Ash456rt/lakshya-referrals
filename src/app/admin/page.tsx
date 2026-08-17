import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin — Lakshya Referrals" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin" && session.role !== "superadmin")
    redirect("/dashboard");

  return <AdminDashboard user={session} />;
}
