import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="h-full">
      <Sidebar />
      <div className="md:pl-64">
        <Navbar />
        <main className="container p-2 md:p-8">{children}</main>
      </div>
    </div>
  );
}
