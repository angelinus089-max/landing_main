import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import GNB from './components/GNB'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import MainPage from './pages/MainPage'
import ArchivePage from './pages/ArchivePage'
import ArchiveCategoryPage from './pages/ArchiveCategoryPage'
import AdminPage from './pages/AdminPage'
import MatchingModal from './components/modals/MatchingModal'
import InquiryModal from './components/modals/InquiryModal'
import DetailModal from './components/modals/DetailModal'
import { AppStateProvider } from './state/AppState'
import { ModalStateProvider } from './state/ModalState'

function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <GNB />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <ModalStateProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/main" replace />} />
              <Route path="/main" element={<SiteLayout><MainPage /></SiteLayout>} />
              <Route path="/archive" element={<SiteLayout><ArchivePage /></SiteLayout>} />
              <Route path="/archive/:category" element={<SiteLayout><ArchiveCategoryPage /></SiteLayout>} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
            <MatchingModal />
            <InquiryModal />
            <DetailModal />
          </HashRouter>
        </ModalStateProvider>
      </AppStateProvider>
    </ErrorBoundary>
  )
}

export default App
