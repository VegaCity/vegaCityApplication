import LoginForm from "./LoginForm";
import vegaCityBackground from "../../img/vegaCityBackground.jpg";
import Image from "next/image";

const Auth = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "var(--fixed-background-image)", //need a root to set background
      }}
    >
      {/* <div className="w-full h-full bg-slate-300 bg-opacity-30 py-20 rounded-lg">
        <LoginForm />
      </div> */}
      <div className="w-full h-full flex justify-center bg-slate-300 bg-opacity-30 pt-20 rounded-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default Auth;
