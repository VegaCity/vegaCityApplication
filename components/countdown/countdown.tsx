import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CountdownTimerProps {
  duration?: number;
  onTimeout: () => void;
  isActive: boolean;
}

type AlertVariant = "default" | "destructive";

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration = 300,
  onTimeout,
  isActive,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timer) clearInterval(timer);
            onTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, onTimeout, isActive]);

  const getAlertVariant = (): AlertVariant => {
    if (timeLeft <= 60) return "destructive";
    return "default";
  };

  return (
    <Alert variant={getAlertVariant()} className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Order Timer</AlertTitle>
      <AlertDescription>
        Time remaining to complete payment: {formatTime(timeLeft)}
      </AlertDescription>
    </Alert>
  );
};

export default CountdownTimer;
