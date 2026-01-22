"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "../ui/skeleton"
import { AddOrganizationModal } from "./add-organization-modal"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { session, refetch } = useAuth()
  const { data: organizations, refetch: refetchOrganizations } = authClient.useListOrganizations()
  const activeOrganizationId = session?.session?.activeOrganizationId
  const activeOrganization = organizations?.find(org => org.id === activeOrganizationId)
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(activeOrganization)
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false)

  useEffect(() => {
    setActiveTeam(activeOrganization)
  }, [activeOrganization])

  if (!activeTeam) {
    return (
      <div className="h-12 w-full py-2 flex items-center">
        <Skeleton className="aspect-square size-8 rounded-lg" />
        <Skeleton className="flex-1" />
      </div>
    )
  }

  const handleAddOrganization = () => {
    setIsAddOrgModalOpen(true)
  }

  const handleOrgCreateSuccess = () => {
    refetchOrganizations()
    refetch()
    setIsAddOrgModalOpen(false)
  }

  const changeActiveOrg = (org: typeof activeTeam) => {
    authClient.organization.setActive({
      organizationId: org?.id,
      organizationSlug: org?.slug,
    })
    setActiveTeam(org)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              组织
            </DropdownMenuLabel>
            {organizations?.map((org, index) => (
              <DropdownMenuItem
                key={org.name}
                onClick={() => changeActiveOrg(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2 cursor-pointer"
              onClick={handleAddOrganization}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">添加组织</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <AddOrganizationModal
        open={isAddOrgModalOpen}
        onOpenChange={setIsAddOrgModalOpen}
        onSuccess={handleOrgCreateSuccess}
      />
    </SidebarMenu>
  )
}
