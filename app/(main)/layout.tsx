import { Toaster } from "@/components/ui/sonner";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="pt-16">
          {children}
        </div>
        <Toaster
          richColors
          theme="dark"
          toastOptions={{
            className: "bg-card border border-border text-foreground rounded-xl",
          }}
        />
      </main>
    </>
  );
}
