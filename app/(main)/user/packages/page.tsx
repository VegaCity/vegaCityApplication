'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { useUserRole } from '@/components/hooks/useUserRole';
import { PackageServices } from '@/components/services/packageServices';
import { Package } from "@/types/package";
import PackageCard from '@/components/card/packagecard';

const PackagesPage = () => {
  const { userRole, loading } = useUserRole();
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await PackageServices.getPackages({ page: 1, size: 10 });
        console.log('API response:', response.data);
        if (response.data && Array.isArray(response.data.data)) {
          setPackages(response.data.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userRole && userRole.name !== 'CashierWeb') {
    return <div>You are denied access to this page!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton text='Go Back' link='/' />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} id={pkg.id} />
        ))}
      </div>
    </div>
  );
};

export default PackagesPage;