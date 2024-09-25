'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { useUserRole } from '@/components/hooks/useUserRole';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import { EtagType } from "@/types/etagtype";
import ETagCard from '@/components/card/etagcard';

const ETagsPage = () => {
  const { userRole, loading } = useUserRole();
  const [etagTypes, setEtagTypes] = useState<EtagType[]>([]);

  useEffect(() => {
    const fetchETagTypes = async () => {
      try {
        const response = await ETagTypeServices.getETagTypes({ page: 1, size: 10 });
        setEtagTypes(response.data.items); 
      } catch (error) {
        console.error('Error fetching etag types:', error);
      }
    };

    fetchETagTypes();
  }, []);

  const handleGenerateETag = (id: string) => {
    console.log('Generate E-Tag for:', id);
   
  };

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
        {etagTypes.length > 0 ? (
          etagTypes.map((etag) => (
            <ETagCard 
              key={etag.id} 
              etag={etag} 
              onGenerateETag={handleGenerateETag} 
            />
          ))
        ) : (
          <div>No E-Tags available</div>
        )}
      </div>
    </div>
  );
};

export default ETagsPage;
