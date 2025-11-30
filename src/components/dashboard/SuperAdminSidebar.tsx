import { 
  BarChart3Icon, 
  UsersIcon, 
  BookIcon, 
  BarChartIcon, 
  CreditCardIcon, 
  SettingsIcon,
  CrownIcon,
  UserPlusIcon,
  GraduationCapIcon,
  BrainCircuitIcon,
  UploadIcon,
  FileTextIcon,
  TrophyIcon,
  Sparkles,
  CircleDot,
  Shield,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type SuperAdminView = 'dashboard' | 'admins' | 'analytics' | 'ai-analytics' | 'subscriptions' | 'settings' | 'board-comparison' | 'content' | 'board' | 'subjects' | 'exams' | 'iq-rank-boost' | 'vidya-ai' | 'courses' | 'add-admin';

interface SuperAdminSidebarProps {
  currentView: SuperAdminView;
  onViewChange: (view: SuperAdminView) => void;
  user: any;
}

export function SuperAdminSidebar({ currentView, onViewChange, user }: SuperAdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3Icon },
    { id: 'board', label: 'Board Management', icon: Users2 },
    { id: 'admins', label: 'School Management', icon: Shield },
    { id: 'subjects', label: 'Subject Management', icon: FileTextIcon },
    { id: 'content', label: 'Content Management', icon: UploadIcon },
    { id: 'exams', label: 'Exam Management', icon: FileTextIcon },
    { id: 'iq-rank-boost', label: 'IQ/Rank Boost Activities', icon: TrophyIcon },
    { id: 'vidya-ai', label: 'Vidya AI', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChartIcon },
    { id: 'board-comparison', label: 'Board Comparison', icon: BarChart3Icon },
    { id: 'ai-analytics', label: 'AI Analytics', icon: BrainCircuitIcon },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCapIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Aslilearn AI</h2>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as SuperAdminView)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <CrownIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Super Admin'}</p>
            <p className="text-xs text-gray-500">Super Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}


