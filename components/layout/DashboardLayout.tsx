import type { ReactNode } from "react";
import { Sidebar } from "../dashboard/Sidebar";
import { Topbar } from "../dashboard/Topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <Sidebar />

      <div className="min-h-screen lg:pl-72">
        <Topbar />

        <main className="w-full overflow-x-hidden px-4 py-5 sm:px-5 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
