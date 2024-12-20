import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FC } from "react";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVNDCurrencyValue } from "@/lib/utils/formatVNDCurrency";
import { useRouter } from "next/navigation";

interface WalletCardProps {
  balance: number;
  balanceHistory: number;
  vCards?: number;
}

const WalletCard: FC<WalletCardProps> = ({
  balance,
  balanceHistory,
  vCards,
}) => {
  const router = useRouter();

  return (
    <div className="w-full flex flex-row items-center justify-start">
      <Card className="w-full max-w-xs mr-0 shadow-md">
        <CardHeader className="flex items-center">
          <Wallet className="text-primary w-6 h-6" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm font-normal">
              Balance: &nbsp;
              {balance < 0 ? (
                <span className="text-md font-bold text-red-600">
                  {formatVNDCurrencyValue(balance)}
                </span>
              ) : (
                <span className="text-md font-bold text-green-600">
                  {formatVNDCurrencyValue(balance)}
                </span>
              )}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-normal">
              Balance History: &nbsp;
              <strong>{formatVNDCurrencyValue(balanceHistory)}</strong>
            </p>
          </div>
          {vCards && (
            <div>
              <p className="text-sm font-normal">
                V-Cards: &nbsp;
                <strong>{vCards}</strong>
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/profile")} variant="outline">
            Manage Wallet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletCard;
