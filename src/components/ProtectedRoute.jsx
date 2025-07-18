import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { supabase } from '@/lib/customSupabaseClient'
import { AuthApiError } from '@supabase/supabase-js'
import { useToast } from '@/components/ui/use-toast'

const ProtectedRoute = ({ children, project }) => {
  const { user, loading: authLoading, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    // ... (copiez tout le code de useEffect ici, sans changement)
  }, [user, authLoading, navigate, project, location, toast, signOut])

  if (loading || authLoading) {
    // ... (copiez le loader ici)
  }

  return children
}

export default ProtectedRoute