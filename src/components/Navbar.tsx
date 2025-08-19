import { type FC } from "react";
import { ShieldHalf } from "lucide-react";
import { TenantProjectSwitcher } from "./TenantProjectSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar: FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b">
      <nav className="h-14 flex items-center px-3 sm:px-6 sm:pl-10">
        <div className="flex items-center gap-1 sm:gap-6">
          <div className="flex items-center gap-2">
            <ShieldHalf className="h-5 w-5 sm:h-6 sm:w-6 text-slate-50 fill-current" />
            <span className="font-semibold text-slate-50 pl-1 sm:pl-2 text-sm sm:text-base">
              RAD Security
            </span>
          </div>
          <div className="flex-1 flex justify-center sm:justify-start sm:flex-none mr-4 sm:mr-0">
            <TenantProjectSwitcher />
          </div>
        </div>
        <div className="flex-1 flex justify-end gap-3">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};
