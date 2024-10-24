"use client";
import { AuthServices } from "@/components/services/authServices";
import { UserServices } from "@/components/services/User/userServices";
import { useToast } from "@/components/ui/use-toast";
import { Users } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useAuthUser(): {
  user: Users | null;
  roleName: string;
  loading: boolean;
} {
  const [user, setUser] = useState<Users | null>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [authUserFromLocal, setAuthUserFromLocal] = useState<string | null>("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const authUser: string | null = localStorage.getItem("userId");
    setAuthUserFromLocal(authUser);
    function fetchAuthUser() {
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
              try {
                const error = await error401;
                if (error === 401) {
                  AuthServices.logoutUser();
                  router.push("/auth");
                  toast({
                    title: "Your token is expired!",
                    description: "Please login again!",
                  });
                }
              } catch {
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
        toast({
          title: "Something went wrong!",
          description: "User is unauthorized!",
        });
        router.push("/auth");
      }
    }
    fetchAuthUser();
  }, [loading, authUserFromLocal]);

  return { user, roleName, loading };
}
