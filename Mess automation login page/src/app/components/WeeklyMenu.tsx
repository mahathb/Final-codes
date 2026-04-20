import { useState, useEffect } from 'react';
import { Coffee, UtensilsCrossed, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5000';

interface DayMenu {
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export function WeeklyMenu() {
  const [weekMenu, setWeekMenu] = useState<DayMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_HOST}/api/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        const mapped = daysOrder.map(day => {
          const dayData = data[day] || {};
          return {
            day,
            breakfast: dayData['Breakfast'] || [],
            lunch: dayData['Lunch'] || [],
            dinner: dayData['Dinner'] || [],
          };
        });
        setWeekMenu(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch menus', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-32 bg-gray-50 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {weekMenu.map((day) => (
        <div key={day.day} className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-white px-6 py-3 flex justify-between items-center">
            <h3 className="text-xl font-bold uppercase tracking-wider">{day.day}</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Coffee className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-gray-800 uppercase text-sm">Breakfast</h4>
              </div>
              <ul className="space-y-1.5">
                {day.breakfast.length > 0 ? (
                  day.breakfast.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400 italic">No menu set</li>
                )}
              </ul>
            </div>

            {/* Lunch */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-gray-800 uppercase text-sm">Lunch</h4>
              </div>
              <ul className="space-y-1.5">
                {day.lunch.length > 0 ? (
                  day.lunch.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400 italic">No menu set</li>
                )}
              </ul>
            </div>

            {/* Dinner */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Moon className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-800 uppercase text-sm">Dinner</h4>
              </div>
              <ul className="space-y-1.5">
                {day.dinner.length > 0 ? (
                  day.dinner.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400 italic">No menu set</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
