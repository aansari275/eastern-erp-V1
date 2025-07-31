import React from "react";
import { Link, useLocation } from "wouter";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// 🔹 Define all possible tabs once
const allTabs = [
  "quality",
  "sampling", 
  "merchandising",
  "admin",
  "dashboard",
  "lab",
  "final",
  "bazaar",
  "compliance",
  "create",
  "gallery",
  "costing",
  "quotes",
  "buyers",
  "pdoc",
  "orders",
  "audit", // new tab you're working on
];

interface SidebarNavProps {
  user: {
    isSuperAdmin?: boolean;
    tabs?: string[];
  };
}

const AppSidebar: React.FC<SidebarNavProps> = ({ user }) => {
  const [location] = useLocation();
  
  // ✅ Decide what tabs this user should see
  const allowedTabs = user?.isSuperAdmin ? allTabs : (user?.tabs || []);

  console.log('🔍 AppSidebar Debug:', {
    userTabs: user?.tabs,
    isSuperAdmin: user?.isSuperAdmin,
    allowedTabs,
    currentLocation: location
  });

  return (
    <SidebarMenu>
      {allowedTabs.map((tab) => {
        const isActive = location === `/${tab}` || location.startsWith(`/${tab}/`);
        
        return (
          <SidebarMenuItem key={tab}>
            <SidebarMenuButton asChild>
              <Link href={`/${tab}`}>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export default AppSidebar;