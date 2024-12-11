import { useEffect, useState } from "react";
import { PromotionServices } from "../services/Promotion/promotionServices";
import { AlertCircle } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: number;
}

export const PromotionAlert = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        setIsLoading(true);
        const response = await PromotionServices.getPromotionsForCustomer({
          page: 1,
          size: 1000,
        });

        const currentDate = new Date();

        const activePromotions = response.data.data.filter(
          (promo: Promotion) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return (
              promo.status === 3 &&
              currentDate >= startDate &&
              currentDate <= endDate
            );
          }
        );

        setPromotions(activePromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePromotions();
  }, []);

  if (isLoading) {
    return <div className="w-full py-4">Đang tải khuyến mãi...</div>;
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="w-full  dark:from-gray-800 dark:to-gray-900 p-4">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className="flex flex-col sm:flex-row items-start gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-3 border rainbow-border"
        >
          <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 inline-block mr-4">
              {promo.description}
            </p>
            <div className="text-xs font-semibold text-gray-500 inline-block">
              <span className="mr-1">
                from: {new Date(promo.startDate).toLocaleString("vi-VN")}
              </span>
              <span>to: {new Date(promo.endDate).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
