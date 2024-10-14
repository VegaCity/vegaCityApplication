"use client";
import { UserServices } from "@/components/services/userServices";
import { Users } from "@/types/user";
import { useState, useEffect } from "react";

export function useAuthUser(): {
  user: Users | null;
  roleName: string;
  loading: boolean;
} {
  const [user, setUser] = useState<Users | null>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const authUser: string | null = localStorage.getItem("userId");

    if (authUser) {
      UserServices.getUserById(authUser)
        .then((res) => {
          setUser(res.data.data.user);
          setRoleName(res.data.data.roleName);
          console.log(res.data.data.user);
        })
        .catch((err) => {
          console.log(err, "error message");
          setLoading(false);
        });
    } else {
      setLoading(false);
      console.log("User is unauthorized!");
    }
  }, []);

  return { user, roleName, loading };
}
