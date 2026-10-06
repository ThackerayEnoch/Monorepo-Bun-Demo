import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }): React.ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
