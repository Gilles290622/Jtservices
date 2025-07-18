import React from 'react'  // Supprimez useState/useEffect si plus utilisés
import { Helmet } from 'react-helmet'
import { Routes, Route } from 'react-router-dom'  // Supprimez Navigate/useNavigate/useLocation si inutilisés
import Fichiers from '@/pages/Fichiers'
import LaFoi from '@/pages/LaFoi'
import Subscription from '@/pages/Subscription'
import CashRegister from '@/pages/CashRegister'
import CustomerStatement from '@/pages/CustomerStatement'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import PricingPage from '@/pages/Pricing'
import AuthPage from '@/pages/Auth'
import AdminPage from '@/pages/Admin'
import UpdatePassword from '@/pages/UpdatePassword'
import LandingPage from '@/pages/LandingPage'
import LaFoiAuthPage from '@/pages/LaFoiAuthPage'
import CaisseAuthPage from '@/pages/CaisseAuthPage'
import FacturesAuthPage from '@/pages/FacturesAuthPage'
import Factures from '@/pages/Factures'
import AdminAuthPage from '@/pages/AdminAuthPage'
import JournalFinanciersAuthPage from '@/pages/JournalFinanciersAuthPage'
import JournalFinanciers from '@/pages/JournalFinanciers'  // Assurez-vous que ce fichier existe
import ProtectedRoute from '@/components/ProtectedRoute'  // Import ici

function App() {
  return (
    <>
      <Helmet>
        <title>JTS Services</title>
        <meta name="description" content="Portail des applications JTS" />
      </Helmet>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/la-foi" element={<ProtectedRoute project="lafoi"><LaFoi /></ProtectedRoute>} />
        <Route path="/fichiers" element={<ProtectedRoute project="fichiers"><Fichiers /></ProtectedRoute>} />
        <Route path="/caisse" element={<ProtectedRoute project="caisse"><CashRegister /></ProtectedRoute>} />
        <Route path="/factures" element={<ProtectedRoute project="factures"><Factures /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute project="admin"><AdminPage /></ProtectedRoute>} />
        <Route path="/journal-financiers" element={<ProtectedRoute project="journal_financiers"><JournalFinanciers /></ProtectedRoute>} />  {/* Changé en JournalFinanciers (composant principal) */}
        
        <Route path="/auth/la-foi" element={<LaFoiAuthPage />} />
        <Route path="/auth/caisse" element={<CaisseAuthPage />} />
        <Route path="/auth/factures" element={<FacturesAuthPage />} />
        <Route path="/auth/admin" element={<AdminAuthPage />} />
        <Route path="/auth/journal-financiers" element={<JournalFinanciersAuthPage />} />

        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/subscription" element={<Subscription />} /> 
        <Route path="/customer-statement/:customerId" element={<CustomerStatement />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </>
  )
}

export default App