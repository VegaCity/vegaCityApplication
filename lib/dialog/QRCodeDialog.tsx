import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode } from "lucide-react";

interface QRCodeDialogProps {
  qrCode: string | undefined;
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ qrCode }) => {
  if (!qrCode) return null;

  // Decode base64 to get the URL
  const decodedUrl = atob(qrCode);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          Show QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              decodedUrl
            )}`}
            alt="QR Code"
            className="w-48 h-48"
          />
          <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
            Scan this QR code to access vcard details
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
