'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import { useUserRole } from '@/components/hooks/useUserRole';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import { EtagType } from "@/types/etagtype";
import ETagTypeCard from '@/components/card/etagtypecard';

const ETagsPage = () => {
  const { userRole, loading: userRoleLoading } = useUserRole();
  const [etagTypes, setEtagTypes] = useState<EtagType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchETagTypes = async () => {
      try {
        setLoading(true);
        const response = await ETagTypeServices.getETagTypes({ page: 1, size: 10 });
        setEtagTypes(response.data.items);
        setError(null);
      } catch (error) {
        console.error('Error fetching etag types:', error);
        setError('Failed to fetch E-Tag types. Please try again later.');
        setEtagTypes(null);
      } finally {
        setLoading(false);
      }
    };

    fetchETagTypes();
  }, []);

  const handleGenerateETag = async (id: string) => {
    try {
      const response = await ETagTypeServices.getETagTypeById(id);
      console.log('E-Tag details:', response.data);
      // You might want to do something with the response data here
    } catch (error) {
      console.error('Error generating E-Tag:', error);
      // Consider showing an error message to the user
    }
  };

  if (userRoleLoading || loading) {
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
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {etagTypes && etagTypes.length > 0 ? (
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
      )}
    </div>
  );
};

export default ETagsPage;