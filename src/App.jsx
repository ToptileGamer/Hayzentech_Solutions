import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './pages/Layout.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'))
const ProcessPage = lazy(() => import('./pages/ProcessPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const TeamPage = lazy(() => import('./pages/TeamPage.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </MotionConfig>
  )
}
