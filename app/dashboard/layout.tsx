import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
