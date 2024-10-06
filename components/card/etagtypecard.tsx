import React from 'react';
import { EtagType } from "@/types/etagtype";
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ETagTypeCardProps {
  etagtype: EtagType;
  onGenerateETag: (id: string) => void;
}

const ETagTypeCard: React.FC<ETagTypeCardProps> = ({ etagtype, onGenerateETag }) => {
  const validImageUrl = etagtype.imageUrl && etagtype.imageUrl.startsWith('http') ? etagtype.imageUrl : '/default-image.png';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol',
    }).format(amount).replace('₫', 'đ');
  };

  return (
    <Card className="flex flex-col justify-between h-full shadow-lg rounded-lg overflow-hidden">
      <div className="w-full aspect-square relative">
        <Image
          src={validImageUrl}
          alt={etagtype.name || 'Package Image'}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2 h-14">{etagtype.name}</h3>
        <p className="text-red-600 text-lg font-medium">{typeof etagtype.amount === 'number' ? formatCurrency(etagtype.amount) : ''}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Link href={`/user/etagtypes/generate/${etagtype.id}`} className='w-full'>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all"
            onClick={() => onGenerateETag(etagtype.id)}
          >
            Generate E-Tag
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ETagTypeCard;