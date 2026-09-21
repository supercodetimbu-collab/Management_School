import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiakadDataProvider } from './context/SiakadDataContext';
import { ModuleType } from './types';

// Layout
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Auth
import { LoginPage } from './components/auth/LoginPage';

// Dashboards
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { GuruDashboard } from './components/dashboards/GuruDashboard';
import { SiswaDashboard } from './components/dashboards/SiswaDashboard';
import { OrangTuaDashboard } from './components/dashboards/OrangTuaDashboard';
import { KepalaSekolahDashboard } from './components/dashboards/KepalaSekolahDashboard';

// Modules
import { StudentsModule } from './components/modules/StudentsModule';
import { TeachersModule } from './components/modules/TeachersModule';
import { ParentsModule } from './components/modules/ParentsModule';
import { ClassesModule } from './components/modules/ClassesModule';
import { SubjectsModule } from './components/modules/SubjectsModule';
import { SchedulesModule } from './components/modules/SchedulesModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { GradesModule } from './components/modules/GradesModule';
import { AssignmentsModule } from './components/modules/AssignmentsModule';
import { ExamsModule } from './components/modules/ExamsModule';
import { AcademicYearModule } from './components/modules/AcademicYearModule';
import { ReportCardsModule } from './components/modules/ReportCardsModule';
import { PromotionsGraduationsModule } from './components/modules/PromotionsGraduationsModule';
import { FinancesModule } from './components/modules/FinancesModule';
import { AnnouncementsModule } from './components/modules/AnnouncementsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { ProfileModule } from './components/modules/ProfileModule';
import { UserManagementModule } from './components/modules/UserManagementModule';
import { ChatModule } from './components/modules/ChatModule';
import { LiveToastNotification } from './components/common/LiveToastNotification';
import { BottomChatToastNotification } from './components/common/BottomChatToastNotification';
import { useSiakadData } from './context/SiakadDataContext';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { latestLiveToast, clearLiveToast, latestChatToast, clearChatToast } = useSiakadData();
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboardByRole = () => {
    const handleNav = (mod: string) => setCurrentModule(mod as ModuleType);
    switch (currentRole) {
      case 'superadmin':
      case 'admin':
        return <AdminDashboard setCurrentModule={handleNav} />;
      case 'guru':
        return <GuruDashboard setCurrentModule={handleNav} />;
      case 'siswa':
        return <SiswaDashboard setCurrentModule={handleNav} />;
      case 'orangtua':
        return <OrangTuaDashboard setCurrentModule={handleNav} />;
      case 'kepsek':
        return <KepalaSekolahDashboard setCurrentModule={handleNav} />;
      default:
        return <AdminDashboard setCurrentModule={handleNav} />;
    }
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'students':
        return <StudentsModule />;
      case 'teachers':
        return <TeachersModule />;
      case 'parents':
        return <ParentsModule />;
      case 'classes':
        return <ClassesModule />;
      case 'subjects':
        return <SubjectsModule />;
      case 'academic_year':
      case 'calendar':
        return <AcademicYearModule />;
      case 'schedules':
        return <SchedulesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'grades':
        return <GradesModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'exams':
        return <ExamsModule />;
      case 'report_cards':
        return <ReportCardsModule />;
      case 'promotions_graduations':
        return <PromotionsGraduationsModule />;
      case 'finances':
      case 'finance':
        return <FinancesModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'chat':
        return <ChatModule />;
      case 'settings':
        return <SettingsModule />;
      case 'profile':
        return <ProfileModule />;
      case 'user_management':
      case 'schools':
        return <UserManagementModule />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Real-time Global Live Toast for Instant Notifications */}
      <LiveToastNotification
        notification={latestLiveToast}
        onClose={clearLiveToast}
        onAction={(mod) => {
          if (mod) setCurrentModule(mod as ModuleType);
        }}
      />

      {/* Real-time Floating Bottom Chat Card (appears when on dashboard/beranda or outside chat) */}
      {currentModule !== 'chat' && (
        <BottomChatToastNotification
          chatToast={latestChatToast}
          onClose={clearChatToast}
          onOpenChat={() => {
            setCurrentModule('chat');
          }}
        />
      )}

      {/* Top Application Header */}
      <AppHeader
        currentModule={currentModule}
        setCurrentModule={(mod: string) => setCurrentModule(mod as ModuleType)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 gap-6 overflow-x-hidden items-start">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentModule={currentModule}
          setCurrentModule={(mod: string) => setCurrentModule(mod as ModuleType)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden pb-24 md:pb-6">{renderModule()}</main>
      </div>

      {/* Mobile Drawer (Full Menu) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentModule={currentModule}
        setCurrentModule={(mod: string) => {
          setCurrentModule(mod as ModuleType);
          setIsMobileMenuOpen(false);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        currentModule={currentModule}
        setCurrentModule={(mod: string) => setCurrentModule(mod as ModuleType)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(mod: string) => {
          setCurrentModule(mod as ModuleType);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SiakadDataProvider>
        <MainAppContent />
      </SiakadDataProvider>
    </AuthProvider>
  );
}
