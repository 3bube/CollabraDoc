"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";

// This is a client component that will be wrapped in Suspense
export function NavItem({
  title,
  url,
  icon: Icon,
}: {
  title: string;
  url: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = pathname === url;

  return (
    <SidebarMenuItem>
      <Link href={url} passHref legacyBehavior>
        <SidebarMenuButton
          className={cn(isActive ? "bg-accent" : "hover:bg-accent/50")}
        >
          <Icon className="mr-2 h-5 w-5" />
          <span>{title}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
