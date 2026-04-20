import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Menu as MenuIcon,
  BarChart3,
  FileText,
  CheckCircle,
  UserPlus,
  Settings,
  LogOut,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { VotesSection } from '../components/VotesSection';
import { RebateRequests } from '../components/RebateRequests';
import { StudentsList } from '../components/StudentsList';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExtraBuyingHistory } from '../components/ExtraBuyingHistory';
import { MenuManagement } from '../components/MenuManagement';
import { PollManagement } from '../components/PollManagement';
import { NewPersonRequests } from '../components/NewPersonRequests';
import { AnnouncementManagement } from '../components/AnnouncementManagement';
import { ManagerSettings } from '../components/ManagerSettings';
import logo from '../../assets/IIT_Kanpur_Logo.svg.png';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('managerActiveSection') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Stats persisting at parent level
  const [stats, setStats] = useState({
    totalStudents: '...',
    pendingRebates: '...',
    activePolls: '...',
    newPersonRequests: '...',
    todaysPrebookings: '...'
  });
  const [recentActivities, setRecentActivities] = useState<{time: string, text: string, type: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5000';
      const res = await fetch(`${API_HOST}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalStudents: String(data.totalStudents || 0),
          pendingRebates: String(data.pendingRebates || 0),
          activePolls: String(data.activePolls || 0),
          newPersonRequests: String(data.newPersonRequests || 0),
          todaysPrebookings: String(data.todaysPrebookings || 0)
        });
        setRecentActivities(data.recentActivities || []);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('managerActiveSection', activeSection);
  }, [activeSection]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'votes', label: 'View Votes', icon: CheckCircle },
    { id: 'rebate', label: 'Rebate Requests', icon: FileText },
    { id: 'newperson', label: 'New Person Requests', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'history', label: 'Extra Buying History', icon: ShoppingCart },
    { id: 'menu', label: 'Menu Management', icon: Calendar },
    { id: 'polls', label: 'Poll Management', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'votes':
        return <VotesSection />;
      case 'rebate':
        return <RebateRequests />;
      case 'newperson':
        return <NewPersonRequests />;
      case 'students':
        return <StudentsList />;
      case 'feedback':
        return <FeedbackSection />;
      case 'history':
        return <ExtraBuyingHistory />;
      case 'menu':
        return <MenuManagement />;
      case 'polls':
        return <PollManagement />;
      case 'announcements':
        return <AnnouncementManagement />;
      case 'settings':
        return <ManagerSettings />;
      case 'dashboard':
      default:
        return (
          <DashboardOverview 
            onNavigate={setActiveSection} 
            stats={stats} 
            recentActivities={recentActivities} 
            isLoading={isLoading} 
            onRefresh={fetchStats}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black z-50 flex items-center px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 ml-4">
          <img src={logo} alt="IIT Kanpur Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-lg">Mess Management for Managers</h1>
            <p className="text-xs text-gray-600">IIT Kanpur</p>
          </div>
        </div>

        <div className="ml-auto text-sm text-right pr-4 border-r border-gray-300">
          <p className="font-medium">{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-gray-600">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
        </div>

        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          menuItems={menuItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className={`flex-1 p-8 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
  stats: any;
  recentActivities: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

function DashboardOverview({ onNavigate, stats, recentActivities, isLoading, onRefresh }: DashboardOverviewProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const statsList = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users },
    { label: 'Pending Rebates', value: stats.pendingRebates, icon: FileText },
    { label: 'Today\'s Pre-bookings', value: stats.todaysPrebookings, icon: ShoppingCart },
    { label: 'New Requests', value: stats.newPersonRequests, icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <button 
          onClick={() => onRefresh()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all disabled:opacity-50 group"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border-2 border-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => onNavigate('menu')} className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Update Daily Menu
          </button>
          <button onClick={() => onNavigate('polls')} className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Create New Poll
          </button>
          <button onClick={() => onNavigate('announcements')} className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Post Notification
          </button>
        </div>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-200 last:border-0">
                <span className="text-xs text-gray-500 w-24">{formatTime(activity.time)}</span>
                <span className="text-sm">{activity.text}</span>
              </div>
            ))
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No recent activities found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
