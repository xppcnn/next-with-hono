"use client"

import * as React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

interface AddOrganizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddOrganizationModal({
  open,
  onOpenChange,
  onSuccess,
}: AddOrganizationModalProps) {
  const [organizationName, setOrganizationName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateOrganization = async () => {
    if (!organizationName.trim()) {
      toast.error("请输入组织名称")
      return
    }

    try {
      setIsLoading(true)
      
      // 使用 better-auth 的 organization API
      const response = await authClient.organization.create({
        name: organizationName.trim(),
        slug: organizationName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })

      if (response.error) {
        toast.error(response.error.message || "创建组织失败")
        return
      }

      toast.success("组织创建成功")
      setOrganizationName("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create organization:", error)
      toast.error("创建组织失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateOrganization()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新组织</DialogTitle>
          <DialogDescription>
            输入组织名称来创建一个新的组织
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="organization-name">组织名称</Label>
            <Input
              id="organization-name"
              placeholder="请输入组织名称"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleCreateOrganization}
            disabled={isLoading || !organizationName.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "创建中..." : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
