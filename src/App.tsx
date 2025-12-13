import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Recruitment from "./pages/Recruitment";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
    <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
    <Route path="/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
    <Route path="/recruitment/:id" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
    <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
