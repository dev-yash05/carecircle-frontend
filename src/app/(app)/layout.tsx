export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will be added in Sprint 2 */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
