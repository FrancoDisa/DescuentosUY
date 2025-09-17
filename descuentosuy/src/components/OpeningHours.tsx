'use client';

import { useState } from 'react';

// Define the types to match the Google Places API structure
type OpeningHoursData = {
  open_now?: boolean;
  weekday_text?: string[];
};

type Props = {
  openingHours: OpeningHoursData | null;
};

const translations: { [key: string]: string } = {
  'Monday': 'Lunes',
  'Tuesday': 'Martes',
  'Wednesday': 'Miércoles',
  'Thursday': 'Jueves',
  'Friday': 'Viernes',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo',
  'Closed': 'Cerrado'
};

export function OpeningHours({ openingHours }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!openingHours || !openingHours.weekday_text) {
    return null;
  }

  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const todaysHoursText = openingHours.weekday_text[todayIndex] || '';
  const todaysHours = todaysHoursText.substring(todaysHoursText.indexOf(':') + 1).trim();

  const statusText = openingHours.open_now ? 'Abierto ahora' : 'Cerrado ahora';
  const statusColor = openingHours.open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  // Translate weekday text and other keywords
  const translatedWeekdayText = openingHours.weekday_text.map(line => {
    let translatedLine = line;
    for (const [english, spanish] of Object.entries(translations)) {
      // Use a regex for global replacement, in case a word appears multiple times
      translatedLine = translatedLine.replace(new RegExp(english, 'g'), spanish);
    }
    return translatedLine;
  });

  return (
    <div className="mt-2 text-sm">
      <div 
        className="cursor-pointer flex items-center" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {statusText}
        </span>
        <span className="ml-2 text-gray-600">{todaysHours.replace('Closed', 'Cerrado')}</span>
        <span className={`ml-2 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <ul className="mt-2 list-none pl-0 text-gray-600 space-y-1">
          {translatedWeekdayText.map((line, index) => (
            <li key={index} className={index === todayIndex ? 'font-bold text-gray-800' : ''}>
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
