"use client";
import { useAuthUser } from "@/components/hooks/useAuthUser";
import { Role, roles } from "@/types/role";
import { useState, useEffect } from "react";

export function useUserRole(): { userRole: Role | null; loading: boolean } {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, loading: userLoading } = useAuthUser();

  useEffect(() => {
    async function fetchUserRole() {
      if (user && user.roleId) {
        const authUser = user?.roleId;
        const getUserRole = roles.find(({ id }) => id === authUser) || null;
        setUserRole(getUserRole);
      }
      setLoading(false);
    }
    fetchUserRole();
  }, [user]);

  return { userRole, loading };
}
