import { useState, useEffect } from 'react';
import { Coffee, UtensilsCrossed, Moon, Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { WeeklyMenu } from './WeeklyMenu';
import campusImg from '../../assets/sunset.jpg';
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5000';
export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayMenu, setTodayMenu] = useState<{ breakfast: string[]; lunch: string[]; dinner: string[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [extraTotal, setExtraTotal] = useState(0);
  const [bdmr, setBdmr] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_HOST}/api/menu/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTodayMenu({
            breakfast: data.menu?.Breakfast || [],
            lunch: data.menu?.Lunch || [],
            dinner: data.menu?.Dinner || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch today menu', err);
      }
    };

    const fetchExtrasTotal = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_HOST}/api/extras/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setExtraTotal(data.totalAmount || 0);
        }
      } catch {
        // student may not have extras
      }
    };

    const fetchBDMR = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const date = new Date();
        const configKey = `BDMR_${date.getFullYear()}_${date.getMonth() + 1}`;
        const res = await fetch(`${API_HOST}/api/config/${configKey}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) setBdmr(Number(data.value));
        }
      } catch (err) {
        console.error('Failed to fetch BDMR', err);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_HOST}/api/announcement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };

    fetchTodayMenu();
    fetchExtrasTotal();
    fetchBDMR();
    fetchAnnouncements();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Campus Image Banner */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <img src={campusImg} alt="IITK Library" className="w-full h-64 object-cover" />
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50">
          <h3 className="text-lg font-bold text-gray-800">P.K. Kelkar Hall</h3>
          <p className="text-sm text-gray-600">Indian Institute of Technology, Kanpur</p>
        </div>
      </div>

      {/* Date and Time */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{formatDate(currentTime)}</h2>
          <p className="text-xl text-gray-600">{formatTime(currentTime)}</p>
        </div>
      </div>

      {/* Today's Menu */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-800">
            {viewMode === 'today' ? "Today's Mess Menu" : "Full Week Menu"}
          </h2>
          <button
            onClick={() => setViewMode(viewMode === 'today' ? 'weekly' : 'today')}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-all active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] uppercase text-xs font-bold font-mono"
          >
            {viewMode === 'today' ? (
              <>
                <Calendar className="w-4 h-4" />
                View Weekly Menu
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Today's Menu
              </>
            )}
          </button>
        </div>

        {viewMode === 'today' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast */}
            <div className="border-2 border-black p-5 hover:shadow-[4px_4px_0px_0px_rgba(253,224,71,1)] transition-all bg-[#FEFCE8]">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
                <div className="bg-yellow-400 border-2 border-black p-2 rounded-none">
                  <Coffee className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black">Breakfast</h3>
              </div>
              <ul className="space-y-2">
                {todayMenu.breakfast.length > 0 ? todayMenu.breakfast.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="w-2 h-2 bg-black rounded-none"></span>
                    <span>{item}</span>
                  </li>
                )) : (
                  <li className="text-gray-500 italic text-sm">No menu set for today</li>
                )}
              </ul>
            </div>

            {/* Lunch */}
            <div className="border-2 border-black p-5 hover:shadow-[4px_4px_0px_0px_rgba(251,146,60,1)] transition-all bg-[#FFF7ED]">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
                <div className="bg-orange-400 border-2 border-black p-2 rounded-none">
                  <UtensilsCrossed className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black">Lunch</h3>
              </div>
              <ul className="space-y-2">
                {todayMenu.lunch.length > 0 ? todayMenu.lunch.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="w-2 h-2 bg-black rounded-none"></span>
                    <span>{item}</span>
                  </li>
                )) : (
                  <li className="text-gray-500 italic text-sm">No menu set for today</li>
                )}
              </ul>
            </div>

            {/* Dinner */}
            <div className="border-2 border-black p-5 hover:shadow-[4px_4px_0px_0px_rgba(96,165,250,1)] transition-all bg-[#EFF6FF]">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
                <div className="bg-blue-400 border-2 border-black p-2 rounded-none">
                  <Moon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold uppercase text-black">Dinner</h3>
              </div>
              <ul className="space-y-2">
                {todayMenu.dinner.length > 0 ? todayMenu.dinner.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="w-2 h-2 bg-black rounded-none"></span>
                    <span>{item}</span>
                  </li>
                )) : (
                  <li className="text-gray-500 italic text-sm">No menu set for today</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <WeeklyMenu />
        )}
      </div>

      {/* Financial Overview */}
      <h2 className="text-2xl font-bold mb-6 mt-8 border-b-2 border-gray-800 text-gray-800 pb-3">
        Monthly Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600 mb-2">Total Extras Spent (This Month)</p>
          <p className="text-5xl font-bold text-orange-600">₹{extraTotal}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600 mb-2">Current BDMR Rate</p>
          <p className="text-5xl font-bold text-blue-600">{bdmr ? `₹${bdmr}/day` : 'Not Set'}</p>
        </div>
      </div>

      {/* Announcements */}
      <h2 className="text-2xl font-bold mb-6 mt-8 border-b-2 border-gray-800 text-gray-800 pb-3 flex items-center gap-2">
        <Megaphone className="w-6 h-6" />
        Latest Announcements
      </h2>
      <div className="space-y-4 pb-8">
        {announcements.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center text-gray-500">
            No active announcements at the moment.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg shadow-sm p-5">
              <h3 className="font-bold text-lg text-gray-900">{ann.title}</h3>
              <p className="text-xs text-blue-600 font-medium mb-3">
                {formatDate(new Date(ann.createdAt))} at {formatTime(new Date(ann.createdAt))}
              </p>
              <p className="text-gray-800 whitespace-pre-wrap flex-1">{ann.content}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
