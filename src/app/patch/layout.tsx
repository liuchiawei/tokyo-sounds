export default function PatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-5xl mx-auto min-h-screen flex flex-col justify-center items-center">
      {children}
    </section>
  );
}
