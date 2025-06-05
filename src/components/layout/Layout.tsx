
import { ReactNode } from "react";
import { MobileTopNavigation } from "./MobileTopNavigation";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <MobileTopNavigation />
      <main className="pt-16 pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
