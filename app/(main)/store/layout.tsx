import React, { ReactNode } from "react";
import storeProductBackground from "@/img/storeProductBackground.jpg";
import storeServiceBackground from "@/img/storeServiceBackground.jpg";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/loader/Loader";

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <>
      {children ? (
        <div
          // style={{ backgroundImage: "var(--fixed-background-store-product)" }}
          className="store-container w-full max-w-screen-2xl"
        >
          {/* <div className="content">{children}</div> */}
          <Card className="max-w-screen-2xl mx-auto p-6 dark:bg-black/30 backdrop-blur-sm border w-full bg-slate-100 rounded-lg">
            {children}
          </Card>

          {/* <div className="w-full h-full flex justify-center bg-slate-300 bg-opacity-30 pt-20 rounded-lg">
          <LoginForm />
          </div> */}
        </div>
      ) : (
        <div>
          <Loader />
        </div>
      )}
    </>
  );
};

export default StoreLayout;
