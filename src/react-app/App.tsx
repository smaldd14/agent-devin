import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Router from './router'
import { ThemeProvider } from '@components/theme-provider'
import { Toaster } from '@components/ui/sonner'
import { TooltipProvider } from '@components/ui/tooltip'
import { Navigation } from './components/layout/Navigation'
import { AppDataProvider } from './context/AppDataContext'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppDataProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </AppDataProvider>
      </ThemeProvider>      
    </BrowserRouter>
  )
}

export default App