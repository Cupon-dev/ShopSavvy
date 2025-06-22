import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, TrendingUp } from 'lucide-react';

interface FomoTimerProps {
  title: string;
  description: string;
  endTime: string;
  resetHours?: number;
  className?: string;
}

export default function FomoTimer({ 
  title, 
  description, 
  endTime, 
  resetHours = 7, 
  className = "" 
}: FomoTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Convert to Indian Standard Time
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset);
      
      // Parse the end time and ensure it's in IST
      const targetTime = new Date(endTime);
      const istTargetTime = new Date(targetTime.getTime() + istOffset);
      
      // If timer has expired, reset it by adding the reset hours
      if (istNow >= istTargetTime) {
        const newEndTime = new Date(istNow.getTime() + (resetHours * 60 * 60 * 1000));
        const difference = newEndTime.getTime() - istNow.getTime();
        
        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setTimeLeft({ hours, minutes, seconds });
          setIsExpired(false);
        } else {
          setIsExpired(true);
        }
      } else {
        const difference = istTargetTime.getTime() - istNow.getTime();
        
        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setTimeLeft({ hours, minutes, seconds });
          setIsExpired(false);
        } else {
          setIsExpired(true);
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, resetHours]);

  if (isExpired) {
    return null; // Don't show expired timers
  }

  return (
    <Card className={`bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-red-100 text-sm">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <div className="flex space-x-1 text-xl font-mono font-bold">
                <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-black bg-opacity-30 px-2 py-1 rounded animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white text-red-600 font-bold">
              IST
            </Badge>
          </div>
        </div>
        
        <div className="mt-3 flex items-center text-sm text-red-100">
          <TrendingUp className="h-3 w-3 mr-1" />
          Timer resets every {resetHours} hours
        </div>
      </CardContent>
    </Card>
  );
}