"use client"

import * as React from "react"
import {
  Brain,
  ClipboardList,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Gestión",
      url: "#",
      icon: ClipboardList,
      isActive: true,
      items: [
        {
          title: "Pacientes",
          url: "/dashboard/pacientes",
        },
        {
          title: "Citas",
          url: "/dashboard/citas",
        },
        {
          title: "Calendario",
          url: "/dashboard/calendario",
        },
        {
          title: "Historial Clínico",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const userData = {
    name: user ? `${user.nombre} ${user.apellido}` : "Usuario",
    email: user?.email || "usuario@ejemplo.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Consultorio</span>
                  <span className="truncate text-xs">Psicológico</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
