
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import Sell from "./pages/Sell";
import LandDetails from "./pages/LandDetails";
import Dashboard from './pages/Dashboard';
import YourListings from './pages/YourListings';
import YourListingLand from './pages/YourListingLand';
import MyLands from './pages/MyLands';
import MyLandDetails from './pages/MyLandDetails';
import VerifyLand from './pages/VerifyLand';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster theme='dark' richColors/>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/land/:id" element={<LandDetails />} />
            <Route path="/myland/:id" element={<MyLandDetails />} />
            <Route path="/sellLand" element={<Sell />} />
            <Route path="/verifyLand" element={<VerifyLand />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/myLands" element={<MyLands />} />
            <Route path="/yourListings" element={<YourListings />} />
            <Route path="/yourListing/land/:id" element={<YourListingLand />} />
           
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
