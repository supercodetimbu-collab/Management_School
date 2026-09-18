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
import { ReportCardsModule } from './components/modules/ReportCardsModule';
import { FinancesModule } from './components/modules/FinancesModule';
import { AnnouncementsModule } from './components/modules/AnnouncementsModule';
import { SettingsModule } from './components/modules/SettingsModule';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useAuth();
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
      case 'schedules':
        return <SchedulesModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'grades':
        return <GradesModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'report_cards':
        return <ReportCardsModule />;
      case 'finances':
        return <FinancesModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Application Header */}
      <AppHeader
        currentModule={currentModule}
        setCurrentModule={(mod: string) => setCurrentModule(mod as ModuleType)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 gap-6 overflow-x-hidden">
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
