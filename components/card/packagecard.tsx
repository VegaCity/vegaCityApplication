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

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await PackageServices.getPackageById(id);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol',
    }).format(amount).replace('₫', 'đ'); 
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg rounded-lg">

<div className="w-full flex justify-center p-4">
        <div className="w-48 h-48 relative rounded-lg overflow-hidden shadow-sm">
          <Image
            src={pkg.imageUrl || '/placeholder-image.jpg'}
            alt={pkg.name || 'Package Image'}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
        <p className="text-red-600 mb-1 text-lg">
          {typeof pkg.price === 'number' ? formatCurrency(pkg.price) : 'N/A'}
        </p>
      </CardContent>
      <CardFooter className="p-4">
      <Link href={`/user/packages/generate/${pkg.id}`} className="w-full">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all">
            Generate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;