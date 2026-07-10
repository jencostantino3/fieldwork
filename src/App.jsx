import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import AuthGuard from '@/components/auth/AuthGuard'

import Home             from '@/pages/Home'
import Jobs             from '@/pages/Jobs'
import JobDetail        from '@/pages/JobDetail'
import Companies        from '@/pages/Companies'
import CompanyProfile   from '@/pages/CompanyProfile'
import Login            from '@/pages/Login'
import Register         from '@/pages/Register'
import Profile          from '@/pages/Profile'
import EmployerDashboard from '@/pages/EmployerDashboard'
import PostJob          from '@/pages/PostJob'
import Pricing          from '@/pages/Pricing'
import BillingSuccess   from '@/pages/BillingSuccess'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AuthLayout({ children }) {
  return <div className="min-h-screen">{children}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with nav */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
          <Route path="/jobs/:id" element={<Layout><JobDetail /></Layout>} />
          <Route path="/companies" element={<Layout><Companies /></Layout>} />
          <Route path="/companies/:id" element={<Layout><CompanyProfile /></Layout>} />

          {/* Public routes with nav (continued) */}
          <Route path="/pricing" element={<Layout><Pricing /></Layout>} />

          {/* Auth routes (no nav) */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          <Route path="/billing-success" element={<BillingSuccess />} />

          {/* Protected — any signed-in user */}
          <Route
            path="/profile"
            element={
              <Layout>
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              </Layout>
            }
          />

          {/* Protected — employer only */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <AuthGuard requireRole="employer">
                  <EmployerDashboard />
                </AuthGuard>
              </Layout>
            }
          />
          <Route
            path="/post-job"
            element={
              <Layout>
                <AuthGuard requireRole="employer">
                  <PostJob />
                </AuthGuard>
              </Layout>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="max-w-xl mx-auto px-4 py-32 text-center">
                  <p className="text-6xl font-black text-gray-200 mb-4">404</p>
                  <h1 className="text-2xl font-bold text-gray-700 mb-2">Page not found</h1>
                  <a href="/" className="text-brand-navy hover:underline font-medium">Go home</a>
                </div>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
