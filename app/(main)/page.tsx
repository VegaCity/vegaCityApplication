import DashboardCard from '@/components/dashboard/DashboardCard';
import PostsTable from '@/components/posts/PostsTable';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { Package, Package2, Store, Tag, User } from 'lucide-react';

export default function Home() {
  return (
    <>
      <div className='flex flex-col md:flex-row justify-between gap-5 mb-5'>
        <DashboardCard
          title='Packages'
          count={100}
          icon={<Package2 className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='E-Tags'
          count={12}
          icon={<Tag className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Users'
          count={750}
          icon={<User className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Stores'
          count={1200}
          icon={<Store className='text-slate-500' size={72} />}
        />
      </div>
      <AnalyticsChart />
      <PostsTable title='Latest Posts' limit={5} />
    </>
  );
}
