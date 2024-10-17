'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { useUserRole } from '@/components/hooks/useUserRole';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import { EtagType } from "@/types/etagtype";
import ETagTypeCard from '@/components/card/etagtypecard';

const ETagsPage = () => {
  const { userRole, loading } = useUserRole();
  const [etagTypes, setEtagTypes] = useState<EtagType[]>([]);

  useEffect(() => {
    const fetchETagTypes = async () => {
      try {
        const response = await ETagTypeServices.getETagTypes({ page: 1, size: 10 });
        setEtagTypes(response.data.items); 
        if (response.data && Array.isArray(response.data.data)) {
          setEtagTypes(response.data.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error fetching etag types:', error);
      }
    };

    fetchETagTypes();
  }, []);

  const handleGenerateETag = async (id: string) => {
    try {
      const response = await ETagTypeServices.getETagTypeById(id);
      console.log('E-Tag details:', response.data);
    } catch (error) {
      console.error('Error generating E-Tag:', error);
    }
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
            <ETagTypeCard 
              key={etag.id} 
              etagtype={etag} 
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
