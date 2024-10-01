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

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg rounded-lg">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="w-48 h-48 relative mb-4 rounded-lg overflow-hidden shadow-sm">
          <Image
            src={validImageUrl}
            alt={etagtype.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-900">{etagtype.name}</h3>
        <p className="text-sm text-gray-600 mt-4">Amount: {etagtype.amount}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all"
          onClick={() => onGenerateETag(etagtype.id)}
        >
          <Link href={`/user/etagtypes/generate/${etagtype.id}`}>
            Generate E-Tag
          </Link>
          
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ETagTypeCard;
