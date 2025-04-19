
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lock, Mail, User, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Simulate registration - in a real app, this would connect to your backend
    try {
      // Artificial delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!name || !email || !password || !confirmPassword) {
        throw new Error("Please fill in all fields");
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Password validation
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      // Mock successful registration
      console.log("Registration successful:", { name, email });
      
      // Redirect to add child profile page
      navigate("/add-profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-softpurple/30 to-white">
        <div className="w-full max-w-md">
          <Card className="pop-in">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-softpurple h-12 w-12 rounded-full flex items-center justify-center">
                  <BookOpen size={24} className="text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
              <CardDescription className="text-center">
                Start your children's learning journey with Bright Stars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Full Name</span>
                    </div>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>Email</span>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <div className="flex items-center gap-2">
                      <Lock size={16} />
                      <span>Password</span>
                    </div>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="text-xs space-y-1 mt-1">
                    <p className="text-neutralgray">Password must:</p>
                    <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-neutralgray'}`}>
                      <Check size={12} className={password.length >= 8 ? 'opacity-100' : 'opacity-50'} />
                      <span>Be at least 8 characters long</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <div className="flex items-center gap-2">
                      <Lock size={16} />
                      <span>Confirm Password</span>
                    </div>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-center w-full">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
