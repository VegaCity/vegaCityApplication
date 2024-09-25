'use client';

import BackButton from '@/components/BackButton';
import { useEffect, useState } from 'react';
import { PackageServices } from '@/components/services/packageServices';
import { Packages } from '@/types/package';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
interface PackageDetailPageProps {
  params: {
    id: string;
  };
}

const PackageDetailPage = ({ params }: PackageDetailPageProps) => {
  const { toast } = useToast();
  const [pkgData, setPkgData] = useState<Packages | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await PackageServices.getPackageById(params.id);
        const packageDetails = response.data.data.package;
        setPkgData(packageDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const router = useRouter();
  

  return (
    <div>
      <BackButton text='Back To Packages' link='/packages' />
      <h3 className='text-2xl mb-4'>Package Details</h3>
      {pkgData && (
        <div className='space-y-4'>
          <div>
            <strong>ID:</strong> {pkgData.id}
          </div>
          <div>
            <strong>Name:</strong> {pkgData.name}
          </div>
          <div>
            <strong>Description:</strong> {pkgData.description}
          </div>
          <div>
            <strong>Price:</strong> {pkgData.price} VND
          </div>
          <div>
            <strong>Start Date:</strong> {new Date(pkgData.startDate).toLocaleDateString()}
          </div>
          <div>
            <strong>End Date:</strong> {new Date(pkgData.endDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetailPage;
