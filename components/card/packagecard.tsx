import React, { useEffect, useState } from 'react';
import { Packages } from "@/types/package";
import { PackageServices } from "@/components/services/packageServices";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface PackageCardProps {
  id: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ id }) => {
  const [pkg, setPkg] = useState<Packages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark that the component has been mounted
  }, []);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await PackageServices.getPackageById(id);
        console.log('API Response:', response.data);
        setPkg(response.data.data.package);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to load package');
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!pkg) {
    return <div className="text-center">No package found</div>;
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol',
    }).format(amount).replace('₫', 'đ'); 
  };

  return (
    <Card className="w-full h-auto flex flex-col justify-between">
      <div className="relative w-full h-40">
        <Image
          src={pkg.imageUrl || '/path/to/placeholder-image.jpg'}
          alt={pkg.name || 'Package Image'}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-center">{pkg.name}</h3>
        <p className="text-sm text-gray-600 mb-1">Description: {pkg.description}</p>
        <p className="text-sm text-gray-600 mb-1">Amount: {typeof pkg.price === 'number' ? formatCurrency(pkg.price) : 'N/A'}</p>
        <p className="text-sm text-gray-600 mb-1">Start Date: <span className="font-medium">{formatDate(pkg.startDate)}</span></p>
        <p className="text-sm text-gray-600 mb-1">End Date: <span className="font-medium">{formatDate(pkg.endDate)}</span></p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href={`/user/packages/generate/${pkg.id}`}>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-4 rounded-md">
            Generate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
