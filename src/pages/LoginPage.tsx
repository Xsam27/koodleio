
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lock, Mail, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childId, setChildId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      console.log("Parent login successful:", { email });
      navigate("/parent-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!childId) {
        throw new Error("Please enter your student ID");
      }

      console.log("Child login successful:", { childId });
      navigate("/child-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
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
              <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
              <CardDescription className="text-center">
                Choose how you want to login
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="parent" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="parent">I'm a Parent</TabsTrigger>
                <TabsTrigger value="child">I'm a Student</TabsTrigger>
              </TabsList>

              <TabsContent value="parent">
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleParentLogin} className="space-y-4">
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
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login as Parent"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="child">
                <CardContent className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleChildLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="childId">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Student ID</span>
                        </div>
                      </Label>
                      <Input
                        id="childId"
                        type="text"
                        placeholder="Enter your student ID"
                        value={childId}
                        onChange={(e) => setChildId(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login as Student"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
