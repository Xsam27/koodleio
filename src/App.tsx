
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ParentDashboard from "./pages/ParentDashboard";
import ChildDashboard from "./pages/ChildDashboard";
import AddProfilePage from "./pages/AddProfilePage";
import LessonPage from "./pages/LessonPage";
import MathsLessonPage from "./pages/MathsLessonPage";
import ParentSettings from "./pages/ParentSettings";
import InitialAssessment from "./pages/InitialAssessment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/child-dashboard" element={<ChildDashboard />} />
          <Route path="/add-profile" element={<AddProfilePage />} />
          <Route path="/parent-settings" element={<ParentSettings />} />
          <Route path="/initial-assessment" element={<InitialAssessment />} />
          <Route path="/lesson/:subject" element={<LessonPage />} />
          <Route path="/lesson/maths" element={<MathsLessonPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
