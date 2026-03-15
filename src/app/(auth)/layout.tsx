export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
