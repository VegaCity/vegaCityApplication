'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { useUserRole } from '@/components/hooks/useUserRole';
import { ETagServices } from '@/components/services/etagService';
import { ETag } from "@/types/etag";
import ETagCard from '@/components/card/etagcard';

const ETagsPage = () => {
  const { userRole, loading } = useUserRole();
  const [etags, setEtags] = useState<ETag[]>([]);

  useEffect(() => {
    const fetchETagTypes = async () => {
      try {
        const response = await ETagServices.getETags({ page: 1, size: 10 });
        setEtags(response.data.items); 
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
        {etags.length > 0 ? (
          etags.map((etag) => (
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
