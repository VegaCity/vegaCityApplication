import ThemeToggler from "@/components/ThemeToggler";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[100vh] flex items-center justify-center relative">
      {/* Overlay to darken the background and apply a blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-xs"></div>
      <div className="absolute bottom-5 right-0 text-white">
        <ThemeToggler />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
