import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'

import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicSiteLoader } from './components/routing/PublicSiteLoader'
import { ScrollToSection } from './components/routing/ScrollToSection'
import { ScrollToTop } from './components/routing/ScrollToTop'
import { AuthProvider } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { AboutPage } from './pages/AboutPage'
import { ClassesPage } from './pages/ClassesPage'
import { HomePage } from './pages/HomePage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import {
  MemberDashboardHomePage,
  MemberGeneralClassesRoutePage,
  MemberPlansPage,
  MemberProfilePage,
  MemberRenewPage,
  MemberSessionsPage,
  MemberTermsPage,
} from './pages/MemberDashboardPages'
import { MemberDashboardLayout } from './components/MemberDashboard/MemberDashboardLayout'
import { InstructorDashboardLayout } from './components/InstructorDashboard/InstructorDashboardLayout'
import {
  InstructorAttendanceRoutePage,
  InstructorGeneralClassesRoutePage,
  InstructorHomePage,
  InstructorPlansPage,
  InstructorProfileRoutePage,
  InstructorSessionsRoutePage,
  InstructorTermsRoutePage,
} from './pages/InstructorDashboardPages'
import { AdminDashboardLayout } from './components/AdminDashboard/AdminDashboardLayout'
import {
  AdminHomePage,
  AdminInstructorsRoutePage,
  AdminInventoryRoutePage,
  AdminAttendanceRoutePage,
  AdminMembersRoutePage,
  AdminMembershipRenewalsRoutePage,
  AdminPackagesRoutePage,
  AdminPOSRoutePage,
  AdminReportsRoutePage,
  AdminSessionsPage,
  AdminGeneralClassesRoutePage,
  AdminVisitorInquiriesRoutePage,
} from './pages/AdminDashboardPages'
import { PaymentPage } from './pages/PaymentPage'
import { RegisterPage } from './pages/RegisterPage'
import { ROUTES, SECTION_IDS } from './routes/paths'
import { loadPackagesFromApi } from './utils/packageStorage'
import { initTrainerRealtimeSync, loadTrainersFromApi } from './utils/trainerStorage'

function AppRoutes() {
  useEffect(() => {
    void loadPackagesFromApi()
    void loadTrainersFromApi()
    return initTrainerRealtimeSync()
  }, [])

  return (
    <BrowserRouter>
      <LoadingProvider>
        <ScrollToTop />
        <PublicSiteLoader />
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.join} element={<JoinPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route path={ROUTES.payment} element={<PaymentPage />} />
          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboardHomePage />} />
            <Route path="plans" element={<MemberPlansPage />} />
            <Route path="general-classes" element={<MemberGeneralClassesRoutePage />} />
            <Route path="sessions" element={<MemberSessionsPage />} />
            <Route path="renew" element={<MemberRenewPage />} />
            <Route path="profile" element={<MemberProfilePage />} />
            <Route path="terms" element={<MemberTermsPage />} />
          </Route>
          <Route
            path={ROUTES.dashboardAdmin}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="general-classes" element={<AdminGeneralClassesRoutePage />} />
            <Route path="members" element={<AdminMembersRoutePage />} />
            <Route path="members/renewals" element={<AdminMembershipRenewalsRoutePage />} />
            <Route path="instructors" element={<AdminInstructorsRoutePage />} />
            <Route path="packages" element={<AdminPackagesRoutePage />} />
            <Route path="attendance" element={<AdminAttendanceRoutePage />} />
            <Route path="inventory" element={<AdminInventoryRoutePage />} />
            <Route path="pos" element={<AdminPOSRoutePage />} />
            <Route path="visitor-inquiries" element={<AdminVisitorInquiriesRoutePage />} />
            <Route path="reports" element={<AdminReportsRoutePage />} />
          </Route>
          <Route
            path={ROUTES.dashboardInstructor}
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstructorHomePage />} />
            <Route path="plans" element={<InstructorPlansPage />} />
            <Route path="sessions" element={<InstructorSessionsRoutePage />} />
            <Route path="general-classes" element={<InstructorGeneralClassesRoutePage />} />
            <Route path="attendance" element={<InstructorAttendanceRoutePage />} />
            <Route path="profile" element={<InstructorProfileRoutePage />} />
            <Route path="terms" element={<InstructorTermsRoutePage />} />
          </Route>
          <Route path={ROUTES.classes} element={<ClassesPage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          <Route path={ROUTES.home} element={<HomePage />}>
            <Route
              index
              element={<ScrollToSection sectionId={SECTION_IDS.home} />}
            />
            <Route
              path="plans"
              element={<ScrollToSection sectionId={SECTION_IDS.plans} />}
            />
            <Route
              path="trainers"
              element={<ScrollToSection sectionId={SECTION_IDS.trainers} />}
            />
            <Route
              path="contact"
              element={<ScrollToSection sectionId={SECTION_IDS.contact} />}
            />
          </Route>
        </Routes>
      </LoadingProvider>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
