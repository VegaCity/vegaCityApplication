"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  text?: string;
  link?: string;
}

const BackButton = ({ text, link }: BackButtonProps) => {
  const router = useRouter();
  const handleBackToPreviousPage = () => {
    router.back();
  };

  const handleBackToPageLink = (link: string) => {
    router.push(link);
  };

  return text && link ? (
    <div className="mb-3">
      <Button onClick={() => handleBackToPageLink(link)}>
        <ArrowLeftCircle size={18} className="mr-2" /> {text}
      </Button>
    </div>
  ) : (
    <div className="mb-3">
      <Button onClick={handleBackToPreviousPage}>
        <ArrowLeftCircle size={18} className="mr-2" />
        Back
      </Button>
    </div>
  );
};

export default BackButton;
