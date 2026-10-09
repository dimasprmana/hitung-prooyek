import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext'

// ====================
// LAYOUTS & PROTECTIONS
// ====================
import UserLayout from './layouts/UserLayout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

// ====================
// AUTH PAGES
// ====================
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/admin/AdminLogin'
import ForgotPassword from './pages/ForgotPassword'

// ====================
// PUBLIC USER PAGES
// ====================
import Home from './pages/Home'
import Calculate from './pages/Calculate'
import CalculatorPage from './pages/CalculatorPage'
import WallCalculator from './pages/WallCalculator'
import Materials from './pages/Materials'

// ====================
// PROTECTED USER PAGES
// ====================
import Projects from './pages/Projects'
import ProjectCreate from './pages/ProjectCreate'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import History from './pages/History'
import HistoryDetail from './pages/HistoryDetail'

// ====================
// PROTECTED ADMIN PAGES
// ====================
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminMaterials from './pages/admin/AdminMaterials'
import AdminMaterialForm from './pages/admin/AdminMaterialForm'
import AdminPrices from './pages/admin/AdminPrices'
import AdminProjects from './pages/admin/AdminProjects'
import AdminProjectDetail from './pages/admin/AdminProjectDetail'
import AdminCalculations from './pages/admin/AdminCalculations'
import AdminProfile from './pages/admin/AdminProfile'

const router = createBrowserRouter([
  // ==================================================
  // PUBLIC + USER ROUTES
  // ==================================================
  {
    path: '/',
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      
      // ====================
      // KALKULATOR
      // ====================
      {
        path: 'hitung',
        element: <Calculate />,
      },
      {
        path: 'hitung/dinding',
        element: <WallCalculator />,
      },
      {
        path: 'hitung/:type',
        element: <CalculatorPage />,
      },

      // ====================
      // MATERIAL
      // ====================
      {
        path: 'material',
        element: <Materials />,
      },

      // ==================================================
      // PROTECTED USER ROUTES
      // ==================================================
      {
        element: <ProtectedRoute />,
        children: [
          // ====================
          // PROYEK
          // ====================
          {
            path: 'proyek',
            element: <Projects />,
          },
          {
            path: 'proyek/buat',
            element: <ProjectCreate />,
          },
          {
            path: 'proyek/:id',
            element: <ProjectDetail />,
          },

          // ====================
          // RIWAYAT DETAIL
          // ====================
          {
            path: 'riwayat/:id',
            element: <HistoryDetail />,
          },

          // ====================
          // PROFIL
          // ====================
          {
            path: 'profil',
            element: <Profile />,
          },

          // ====================
          // SEMUA RIWAYAT
          // ====================
          {
            path: 'profil/riwayat',
            element: <History />,
          },
        ],
      },
    ],
  },

  // ==================================================
  // AUTH ROUTES
  // ==================================================
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },

  // ==================================================
  // ADMIN ROUTES
  // ==================================================
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },

          // ====================
          // USERS
          // ====================
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'users/:id',
            element: <AdminUserDetail />,
          },

          // ====================
          // MATERIALS
          // ====================
          {
            path: 'materials',
            element: <AdminMaterials />,
          },
          {
            path: 'materials/create',
            element: <AdminMaterialForm />,
          },
          {
            path: 'materials/:id/edit',
            element: <AdminMaterialForm />,
          },

          // ====================
          // PRICES
          // ====================
          {
            path: 'prices',
            element: <AdminPrices />,
          },

          // ====================
          // PROJECTS
          // ====================
          {
            path: 'projects',
            element: <AdminProjects />,
          },
          {
            path: 'projects/:id',
            element: <AdminProjectDetail />,
          },

          // ====================
          // CALCULATIONS
          // ====================
          {
            path: 'calculations',
            element: <AdminCalculations />,
          },

          // ====================
          // ADMIN PROFILE
          // ====================
          {
            path: 'profile',
            element: <AdminProfile />,
          },
        ],
      },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App