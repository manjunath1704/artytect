"use client";

import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";

export default function AccountLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const toastId = toast.loading("Signing out...");

    try {
      await authService.logout();
      toast.success("Signed out.", { id: toastId });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className="h-11 rounded-[10px] border-[#d9ccbc] bg-white px-5 text-[#1b1511] hover:bg-[#f5eee4]"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Logout
    </Button>
  );
}
