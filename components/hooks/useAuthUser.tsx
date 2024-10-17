"use client";
import { AuthServices } from "@/components/services/authServices";
import { UserServices } from "@/components/services/userServices";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

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
          console.log(err.response.status, "error message");
          setLoading(false);
          const error401 = err.response.status;
          const fetchLogoutUser = async () => {
            if (error401 === 401) {
              AuthServices.logoutUser();
            } else {
              toast({
                title: "Something wrong!",
                description: "Server have problems, try again!",
              });
            }
          };
          fetchLogoutUser();
        });
    } else {
      setLoading(false);
      console.log("User is unauthorized!");
    }
  }, [loading]);

  return { user, roleName, loading };
}
