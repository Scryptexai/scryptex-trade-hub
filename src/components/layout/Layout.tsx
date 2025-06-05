
import { ReactNode } from "react";
import { MobileTopNavigation } from "./MobileTopNavigation";
import { DesktopTopNavigation } from "./DesktopTopNavigation";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <MobileTopNavigation />
      <DesktopTopNavigation />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
