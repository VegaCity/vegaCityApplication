"use client";
import { AuthServices } from "@/components/services/authServices";
import { UserServices } from "@/components/services/User/userServices";
import { useToast } from "@/components/ui/use-toast";
import { Users, GetUserById } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useAuthUser(): {
  user: GetUserById | null;
  roleName: string;
  loading: boolean;
  storeId: string | null;
} {
  const [user, setUser] = useState<GetUserById | null>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [storeId, setStoreId] = useState<string | null>(null);
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
            setUser(res.data.data);
            setRoleName(res.data.data.role.name);
            const userStoreId = res.data.data?.storeId;
            if (userStoreId) {
              localStorage.setItem("storeId", userStoreId);
              setStoreId(userStoreId);
            }
            console.log(res.data.data);
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
                  localStorage.removeItem("storeId");
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

  return { user, roleName, loading, storeId };
}
