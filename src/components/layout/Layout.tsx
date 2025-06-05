
import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNavigation />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
