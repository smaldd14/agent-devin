import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Router from './router'
import { ThemeProvider } from '@components/theme-provider'
import { Toaster } from '@components/ui/sonner'
import { TooltipProvider } from '@components/ui/tooltip'

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
      </ThemeProvider>      
    </BrowserRouter>
  )
}

export default App