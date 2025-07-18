import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'  // Sans { } , pour export default
import JournalFinanciersAuthPage from './JournalFinanciersAuthPage'

const JournalFinanciers = () => {
  return (
    <ProtectedRoute project="journal_financiers">
      <JournalFinanciersAuthPage />
    </ProtectedRoute>
  )
}

export default JournalFinanciers