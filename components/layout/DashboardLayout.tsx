import type { ReactNode } from "react";
import { Sidebar } from "../dashboard/Sidebar";
import { Topbar } from "../dashboard/Topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <Sidebar />

      <div className="min-h-screen lg:pl-72">
        <div className="hidden lg:block">
          <Topbar />
        </div>

        <main className="w-full overflow-x-hidden px-3 py-4 sm:px-5 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
