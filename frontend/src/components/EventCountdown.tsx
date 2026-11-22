import { useState, useEffect } from 'react';
import { differenceInSeconds, isPast } from 'date-fns';
import { parseLocalDate } from '../utils/dateUtils';

interface EventCountdownProps {
  eventDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const EventCountdown: React.FC<EventCountdownProps> = ({ eventDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0 });
  const [isEventPast, setIsEventPast] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = parseLocalDate(eventDate);
      const now = new Date();

      if (isPast(eventDateTime)) {
        setIsEventPast(true);
        return;
      }

      const totalSeconds = differenceInSeconds(eventDateTime, now);
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60_000);

    return () => clearInterval(timer);
  }, [eventDate]);

  if (isEventPast) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-3 sm:p-4 text-center">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Event Has Passed</h3>
        <p className="text-sm text-gray-600">Thank you to everyone who contributed!</p>
        <p className="text-xs text-gray-500 mt-1">Donations are still accepted</p>
      </div>
    );
  }

  const cellClass =
    'bg-white bg-opacity-20 rounded-md px-1.5 py-1.5 sm:px-2 sm:py-2 backdrop-blur-sm';
  const valueClass = 'text-xl sm:text-2xl font-bold leading-tight';
  const labelClass = 'text-[10px] sm:text-xs uppercase mt-0.5 opacity-90';

  const isUrgent = timeLeft.days === 0;
  const isVerySoon = timeLeft.days <= 3;

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 ${
        isUrgent
          ? 'bg-gradient-to-r from-red-500 to-orange-500'
          : isVerySoon
            ? 'bg-gradient-to-r from-orange-400 to-yellow-400'
            : 'bg-gradient-to-r from-primary-500 to-primary-700'
      } text-white shadow-md`}
    >
      <h3 className="text-sm font-semibold mb-2 text-center">
        {isUrgent ? '🔥 Event is TODAY!' : isVerySoon ? '⚡ Event Coming Soon!' : 'Time Until Event'}
      </h3>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="text-center min-w-0">
          <div className={cellClass}>
            <div className={valueClass}>{timeLeft.days}</div>
            <div className={labelClass}>Day{timeLeft.days !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="text-center min-w-0">
          <div className={cellClass}>
            <div className={valueClass}>{timeLeft.hours}</div>
            <div className={labelClass}>Hour{timeLeft.hours !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="text-center min-w-0">
          <div className={cellClass}>
            <div className={valueClass}>{timeLeft.minutes}</div>
            <div className={labelClass}>Min{timeLeft.minutes !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {isUrgent && (
        <p className="text-center mt-2 font-semibold text-xs animate-pulse">
          Last chance to donate before the event!
        </p>
      )}

      {isVerySoon && !isUrgent && (
        <p className="text-center mt-2 text-xs">
          Make your donation count before the big day!
        </p>
      )}
    </div>
  );
};

export default EventCountdown;
