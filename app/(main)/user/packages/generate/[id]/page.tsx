import React from 'react';

interface GeneratePackageProps {
    params: {
      id: string;
    };
  }

function GeneratePackagById({ params }: GeneratePackageProps) {
    return (
        <div>
            This is Generate Packages Id: <p className='text-pretty'>{params.id}</p>
        </div>
    );
}

export default GeneratePackagById;