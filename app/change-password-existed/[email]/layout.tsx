export default function ChangePasswordExistedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "var(--fixed-background-image)", //need a root to set background
      }}
    >
      {/* <Image
        src={vegaCityBackground}
        alt="background"
        width={300}
        height={300}
      /> */}
      <div className="w-full h-full bg-slate-300 bg-opacity-30 py-20 rounded-lg">
        {children}
      </div>
    </div>
  );
}
