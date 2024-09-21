import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className='flex'>
        <div className='hidden md:block h-[127vh] w-1/8'>
          <Sidebar />
        </div>
        <div className='p-10 w-full md:max-w-[1300px]'>{children}</div>
      </div>
    </>
  );
};

export default MainLayout;
