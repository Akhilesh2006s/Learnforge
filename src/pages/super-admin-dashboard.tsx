import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SuperAdminSidebar, type SuperAdminView } from "@/components/dashboard/SuperAdminSidebar";
import AdminManagement from "@/components/admin/AdminManagement";
import SuperAdminAnalyticsDashboard from "./super-admin-analytics";
import DetailedAIAnalyticsDashboard from "./detailed-ai-analytics";
import BoardComparisonCharts from "@/components/admin/board-comparison-charts";
import ContentManagement from "@/components/super-admin/content-management";
import SubjectManagement from "@/components/super-admin/subject-management";
import ExamManagement from "@/components/super-admin/exam-management";
import IQRankBoostActivities from "@/components/super-admin/iq-rank-boost-activities";
import AIChat from "@/components/ai-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellIcon, LogOutIcon, UsersIcon, TrendingUpIcon, BookIcon, Presentation, UserPlusIcon, BookPlusIcon, SettingsIcon, DownloadIcon, HomeIcon, CrownIcon, BarChart3Icon, CreditCardIcon, ArrowUpRightIcon, ArrowDownRightIcon, StarIcon, TargetIcon, BrainIcon, ZapIcon, AlertTriangleIcon, TrendingDownIcon, RefreshCw, Sparkles, MessageSquare, Clock, Plus, Monitor, Grid3x3, FileText, FileTextIcon, Shield, Search, Camera, PieChart, User, Download, Circle, Square, Bot, Users2, UploadIcon, TrophyIcon, BarChartIcon, BrainCircuitIcon } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-config";
import { InteractiveBackground, FloatingParticles } from "@/components/background/InteractiveBackground";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<SuperAdminView>('dashboard');
  const [user] = useState({ 
    fullName: 'Super Admin', 
    role: 'super-admin',
    email: 'super.admin@aslilearn.com'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    courses: 0,
    assessments: 0,
    exams: 0,
    examResults: 0,
    activeVideos: 0,
    activeAssessments: 0,
    avgExamsPerStudent: 0,
    contentEngagement: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [realtimeAnalytics, setRealtimeAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [adminSummary, setAdminSummary] = useState<any[]>([]);

  // Fetch real dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/super-admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        } else {
          console.error('Failed to fetch dashboard stats:', response.status);
          toast({
            title: "Error",
            description: "Failed to fetch dashboard statistics",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard statistics",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
    fetchRealtimeAnalytics();
    fetchAdminSummary();
    
    // Listen for admin deletion events to refresh admin summary
    const handleAdminDeleted = () => {
      fetchAdminSummary();
    };
    
    window.addEventListener('adminDeleted', handleAdminDeleted);
    
    return () => {
      window.removeEventListener('adminDeleted', handleAdminDeleted);
    };
  }, [toast]);

  const fetchRealtimeAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealtimeAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchAdminSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin summary data:', data); // Debug log
        if (data.success && Array.isArray(data.data)) {
          setAdminSummary(data.data);
        } else if (Array.isArray(data)) {
          setAdminSummary(data);
        }
      }
    } catch (error) {
      console.error('Error fetching admin summary:', error);
    }
  };

  const fetchBoardDashboard = async (boardCode: string, showToast = true) => {
    setIsLoadingBoard(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('📊 Fetching board dashboard for:', boardCode);
      const response = await fetch(`${API_BASE_URL}/api/super-admin/boards/${boardCode}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Board dashboard response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Board dashboard data received:', data);
        if (data.success) {
          console.log('Setting board data:', data.data);
          console.log('Schools found:', data.data.schoolParticipation?.length || 0);
          setBoardData(data.data);
          setSelectedBoard(boardCode);
          setCurrentView('board');
        } else {
          console.error('API returned success: false:', data.message);
          if (showToast) {
            toast({
              title: 'Error',
              description: data.message || 'Failed to fetch board data',
              variant: 'destructive'
            });
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API error response:', errorData);
        if (showToast) {
          toast({
            title: 'Error',
            description: errorData.message || `Failed to fetch board dashboard (${response.status})`,
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching board dashboard:', error);
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to fetch board dashboard. Please check your connection.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoadingBoard(false);
    }
  };

  // Sample data for charts
  const totalStudentsData = [
    { name: 'Jan', value: 4200 },
    { name: 'Feb', value: 4500 },
    { name: 'Mar', value: 4800 },
    { name: 'Apr', value: 5000 },
    { name: 'May', value: 5230 },
  ];

  const passRateData = [
    { name: 'Jan', value: 75 },
    { name: 'Feb', value: 78 },
    { name: 'Mar', value: 80 },
    { name: 'Apr', value: 82 },
    { name: 'May', value: 80 },
  ];

  const coursesPerBoardData = [
    { name: 'ASLI EXCLUSIVE SCHOOLS', value: 100, color: '#8B5CF6' },
  ];

  const studentsPerAdminData = [
    { name: 'Week 1', admin1: 200, admin2: 150 },
    { name: 'Week 2', admin1: 250, admin2: 180 },
    { name: 'Week 3', admin1: 300, admin2: 200 },
    { name: 'Week 4', admin1: 350, admin2: 220 },
  ];

  // Icon grid using EXACT same icons as sidebar in same order
  const iconGridIcons = [
    { Icon: BarChart3Icon, view: 'dashboard', label: 'Dashboard' },
    { Icon: Users2, view: 'board', label: 'Board Management' },
    { Icon: Shield, view: 'admins', label: 'School Management' },
    { Icon: FileTextIcon, view: 'subjects', label: 'Subject Management' },
    { Icon: UploadIcon, view: 'content', label: 'Content Management' },
    { Icon: FileTextIcon, view: 'exams', label: 'Exam Management' },
    { Icon: TrophyIcon, view: 'iq-rank-boost', label: 'IQ/Rank Boost Activities' },
    { Icon: Sparkles, view: 'vidya-ai', label: 'Vidya AI' },
    { Icon: BarChartIcon, view: 'analytics', label: 'Analytics' },
    { Icon: BarChart3Icon, view: 'board-comparison', label: 'Board Comparison' },
    { Icon: BrainCircuitIcon, view: 'ai-analytics', label: 'AI Analytics' },
    { Icon: CreditCardIcon, view: 'subscriptions', label: 'Subscriptions' },
    { Icon: SettingsIcon, view: 'settings', label: 'Settings' },
    { Icon: Shield, view: 'admins', label: 'School Management' },
    { Icon: Sparkles, view: 'vidya-ai', label: 'Vidya AI' }
  ];

  const renderDashboardContent = () => {
    if (selectedBoard && currentView === 'board') {
      return renderBoardDashboard();
    }

    return (
    <div className="flex gap-6 min-h-screen relative z-10">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Super Admin</h1>
            <p className="text-gray-600">Manage boards, schools, exams and AI analytic tau at one place.</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Board Management Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Board Management</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* ASLI EXCLUSIVE SCHOOLS */}
            <Card className="bg-gradient-to-r from-blue-800 to-blue-900 text-white border-0 cursor-pointer hover:from-blue-900 hover:to-blue-950 transition-colors shadow-lg" onClick={() => fetchBoardDashboard('ASLI_EXCLUSIVE_SCHOOLS')}>
              <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold mb-1">ASLI EXCLUSIVE SCHOOLS</h3>
                    <p className="text-blue-100 text-sm">All Boards Content - Unified Platform</p>
                </div>
                  <Users2 className="h-16 w-16 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Management & AI Analytics Boxes */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Content Management - Pink */}
          <Card 
            className="bg-gradient-to-br from-pink-600 to-pink-700 text-white border-0 cursor-pointer hover:from-pink-700 hover:to-pink-800 transition-all duration-300 shadow-lg"
            onClick={() => setCurrentView('content')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">Content Management</h3>
                  <p className="text-pink-100 text-sm">Manage videos, notes & materials</p>
                </div>
                <UploadIcon className="h-12 w-12 text-white/80" />
              </div>
            </CardContent>
          </Card>

          {/* AI Analytics - Dark Green */}
          <Card 
            className="bg-gradient-to-br from-green-700 to-green-800 text-white border-0 cursor-pointer hover:from-green-800 hover:to-green-900 transition-all duration-300 shadow-lg"
            onClick={() => setCurrentView('ai-analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">AI Analytics</h3>
                  <p className="text-green-100 text-sm">Advanced ML insights</p>
                </div>
                <BrainCircuitIcon className="h-12 w-12 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Widgets Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Students Widget */}
          <Card className="bg-white">
          <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
              <div>
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoadingStats ? '...' : (stats.totalStudents || 5230).toLocaleString().replace(/\s/g, ' ')}
                  </p>
              </div>
                <div className="w-16 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={totalStudentsData}>
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
            </div>
              </div>
            </CardContent>
          </Card>

          {/* 80% Pass rate Widget */}
          <Card className="bg-white">
          <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
              <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">80%</p>
                  <p className="text-sm text-gray-600">Pass rate data</p>
              </div>
                <div className="w-16 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={passRateData}>
                      <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
            </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vidya AI Card - Clickable */}
        <Card 
          className="bg-white cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-purple-200 hover:border-purple-400"
          onClick={() => setCurrentView('vidya-ai')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Vidya AI</h3>
                <p className="text-sm text-gray-600">24/7 AI Tutor Support</p>
                <p className="text-xs text-purple-600 mt-2 font-medium">Click to access Vidya AI →</p>
              </div>
              <div className="ml-4">
                <img 
                  src="/ROBOT.gif" 
                  alt="Vidya AI Robot" 
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses per Board Widget */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Courses per Board</CardTitle>
            <span className="text-sm text-gray-500">Skima &gt;</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                {coursesPerBoardData.map((board) => (
                  <div key={board.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{board.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{board.value}%</span>
              </div>
                ))}
            </div>
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={coursesPerBoardData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {coursesPerBoardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-20">
                  <span className="text-2xl font-bold text-gray-900">40%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Students per Admin Summary */}
      {adminSummary.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Students per Admin</h2>
            <Badge className="bg-purple-100 text-purple-700">
              Total: {adminSummary.reduce((sum, admin) => {
                const count = admin.totalStudents || admin.stats?.students || admin.students || 0;
                return sum + count;
              }, 0)} students
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSummary.map((admin) => {
              const studentCount = admin.totalStudents || admin.stats?.students || admin.students || 0;
              return (
                <Card key={admin.id || admin._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{admin.name || admin.fullName}</h3>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{studentCount}</p>
                        <p className="text-xs text-gray-500">students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* AI-Powered Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TargetIcon className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">AI-Powered Recommendations</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-gray-600">AI-powered insights and recommendations will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3Icon className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-gray-900">Real-time Analytics</h2>
          </div>
          <Button onClick={fetchRealtimeAnalytics} disabled={isLoadingAnalytics} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoadingAnalytics ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3Icon className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading real-time analytics...</p>
            </CardContent>
          </Card>
        ) : realtimeAnalytics ? (
          <div className="space-y-6">
            {/* Overall Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-sm text-purple-700 font-medium">Total Students</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalStudents || realtimeAnalytics.overallMetrics?.totalStudents || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-sm text-indigo-700 font-medium">Total Exams</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{realtimeAnalytics.overallMetrics?.totalExams || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-sm text-pink-700 font-medium">Exam Results</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{realtimeAnalytics.overallMetrics?.totalExamResults || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
                <CardContent className="p-4">
                  <p className="text-sm text-violet-700 font-medium">Overall Average</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{realtimeAnalytics.overallMetrics?.overallAverage || 0}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Scorers by Exam */}
            {realtimeAnalytics.topScorersByExam && realtimeAnalytics.topScorersByExam.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Scorers by Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {realtimeAnalytics.topScorersByExam.slice(0, 3).map((exam: any) => (
                      <div key={exam.examId} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{exam.examTitle}</h4>
                        <div className="space-y-2">
                          {exam.topScorers.slice(0, 5).map((scorer: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{scorer.studentName}</p>
                                <p className="text-xs text-gray-600">{scorer.studentEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{scorer.percentage?.toFixed(1)}%</p>
                                <p className="text-xs text-gray-600">{scorer.marks}/{scorer.totalMarks} marks</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low-performing Admins */}
            {realtimeAnalytics.lowPerformingAdmins && realtimeAnalytics.lowPerformingAdmins.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center">
                    <AlertTriangleIcon className="h-5 w-5 mr-2" />
                    Low-performing Admins (Needs Attention)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtimeAnalytics.lowPerformingAdmins.map((admin: any) => (
                      <div key={admin.adminId} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                        <div>
                          <p className="font-semibold text-gray-900">{admin.adminName}</p>
                          <p className="text-sm text-gray-600">{admin.adminEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {admin.totalStudents} students • {admin.totalExams} exams
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{admin.averageScore}%</p>
                          <p className="text-xs text-gray-600">Average Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Performance Overview */}
            {realtimeAnalytics.adminAnalytics && realtimeAnalytics.adminAnalytics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtimeAnalytics.adminAnalytics.slice(0, 5).map((admin: any) => (
                      <div key={admin.adminId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{admin.adminName}</p>
                          <p className="text-xs text-gray-600">{admin.totalStudents} students</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{admin.averageScore}%</p>
                          <p className="text-xs text-gray-600">Avg Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auto-Generated Insights */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BrainIcon className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">Auto-Generated Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                  <BrainIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">Peak learning hours: 7-9 PM (43% of daily activity)</p>
                  <p className="text-xs text-gray-600">Generated 2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg">
                  <TrendingUpIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Most popular subject: Mathematics (35% of total engagement)</p>
                  <p className="text-xs text-gray-600">Generated 1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-6">
        {/* Icon Grid */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {iconGridIcons.map((item, index) => {
                const Icon = item.Icon;
                const isActive = currentView === item.view;
                return (
                  <div
                    key={index}
                    onClick={() => setCurrentView(item.view as SuperAdminView)}
                    className={`w-12 h-12 flex items-center justify-center border rounded transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    title={item.label}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? "text-blue-600" : "text-gray-700"}`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Students per Admin Widget */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Students per Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">6ost Un</p>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentsPerAdminData}>
                      <Line type="monotone" dataKey="admin1" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Admin Two</p>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentsPerAdminData}>
                      <Line type="monotone" dataKey="admin2" stroke="#10B981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  // Refresh board dashboard when view changes to board
  useEffect(() => {
    if (currentView === 'board' && selectedBoard) {
      console.log('🔄 Refreshing board dashboard for:', selectedBoard);
      fetchBoardDashboard(selectedBoard, false); // Don't show toast on auto-refresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]); // Only refresh when view changes, not on every render

  const renderBoardDashboard = () => {
    if (isLoadingBoard) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading board data...</p>
          </div>
        </div>
      );
    }

    if (!boardData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No board data available. Please try again.</p>
          <Button onClick={() => fetchBoardDashboard(selectedBoard || 'ASLI_EXCLUSIVE_SCHOOLS')} className="mt-4">
            Refresh
          </Button>
        </div>
      );
    }

    console.log('Rendering board dashboard with data:', boardData);
    const boardName = boardData.board?.name || selectedBoard || 'Board';
    
    return (
      <div className="space-y-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => { setSelectedBoard(null); setCurrentView('dashboard'); }}>
              ← Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{boardName}</h1>
              <p className="text-gray-600">Manage content, exams, subjects, and view analytics</p>
            </div>
          </div>
        </div>

        {/* Board Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-purple-700 font-medium">Students</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {typeof boardData.stats?.students === 'number' ? boardData.stats.students : 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-indigo-700 font-medium">Teachers</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {typeof boardData.stats?.teachers === 'number' ? boardData.stats.teachers : 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-pink-700 font-medium">Exams</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {typeof boardData.stats?.exams === 'number' ? boardData.stats.exams : 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-violet-700 font-medium">Avg Score</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {boardData.stats?.averageScore ? `${boardData.stats.averageScore}%` : '0.00%'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Board Comparison Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Board Performance Comparison</h2>
          <BoardComparisonCharts />
        </div>
      </div>
    );
  };

  const renderAdminsContent = () => (
    <AdminManagement />
  );

  const renderAnalyticsContent = () => (
    <SuperAdminAnalyticsDashboard />
  );

  const renderBoardComparisonContent = () => (
    <BoardComparisonCharts />
  );

  const renderSubscriptionsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription Management</h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscriptions</h3>
            <p className="text-gray-600 mb-4">Manage user subscriptions and billing</p>
            <Button>View Subscriptions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
            <Button>Open Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVidyaAIContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Vidya AI Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor your AI tutor system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vidya AI Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span>Vidya AI Chat Interface</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIChat userId="super-admin" context={{}} />
          </CardContent>
        </Card>

        {/* AI Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="w-5 h-5 text-violet-600" />
              <span>AI Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-violet-600">-</p>
              </div>
              <MessageSquare className="w-8 h-8 text-violet-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-600">-</p>
              </div>
              <ZapIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average Response Time</p>
                <p className="text-2xl font-bold text-pink-600">-</p>
              </div>
              <Clock className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-violet-600" />
              <span>AI Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">AI Status</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Model Version</span>
                <span className="text-sm text-gray-600">Latest</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Language Support</span>
                <span className="text-sm text-gray-600">Multi</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              Configure Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardContent();
      case 'board':
        return renderBoardDashboard();
      case 'admins':
        return renderAdminsContent();
      case 'content':
        return <ContentManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'iq-rank-boost':
        return <IQRankBoostActivities />;
      case 'vidya-ai':
        return renderVidyaAIContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'board-comparison':
        return renderBoardComparisonContent();
      case 'ai-analytics':
        return <DetailedAIAnalyticsDashboard />;
      case 'subscriptions':
        return renderSubscriptionsContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminUser');
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SuperAdminSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          user={user} 
        />
        
        <div className="flex-1">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
