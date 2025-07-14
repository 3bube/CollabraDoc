// components/layouts/AppLayout.tsx
import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

import SidebarNav from "@/components/SidebarNav"; // ⬅️ the only client chunk
import { mockWorkspace } from "@/lib/data";
import DialogProvider from "@/context/useDialog";
import { AuthProvider } from "@/lib/auth-context";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: "home" as const },
  { title: "Search", url: "/search", icon: "search" as const },
  { title: "Settings", url: "/settings", icon: "settings" as const },
];

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AuthProvider>
        <DialogProvider>
          <div className="min-h-screen flex w-full bg-background">
            <Sidebar className="border-r border-border">
              {/* Workspace header */}
              <div className="p-4 border-b border-border flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">
                    {mockWorkspace.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {mockWorkspace.members.length} members
                  </p>
                </div>
              </div>

              {/* 👉 all interactive nav lives here */}
              <SidebarNav navigation={navigation} />
            </Sidebar>

            {/* Main column */}
            <div className="flex-1 flex flex-col">
              <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="font-semibold">CollabraDoc</h1>
                </div>

                <Button variant="outline" size="sm">
                  Share
                </Button>
              </header>

              <main className="flex-1">{children}</main>
            </div>
          </div>
        </DialogProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}
