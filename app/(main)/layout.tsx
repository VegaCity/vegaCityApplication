import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { redirect } from "next/navigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  // const auth = false;
  // if(!auth){
  //   redirect('/auth');
  // }

  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="hidden md:block h-[127vh] w-1/8">
          <Sidebar />
        </div>
        <div className="p-10 w-full md:max-w-[1400px]">{children}</div>
        <Toaster />
      </div>
    </>
  );
};

export default MainLayout;
