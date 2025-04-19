
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, BookOpen, Home, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  isParent?: boolean;
}

const Navbar = ({ isParent = false }: NavbarProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This would be from auth context in a real app
  const navigate = useNavigate();

  // Mock logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <header className={`w-full py-4 px-6 ${isParent ? "bg-white" : "bg-softpurple"} shadow-sm`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen
            size={28}
            className={`${isParent ? "text-brightpurple" : "text-primary"}`}
          />
          <h1 className={`text-xl font-bold ${isParent ? "text-brightpurple" : "text-primary"}`}>
            Bright Stars
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {isParent ? (
                <>
                  <Link to="/parent-dashboard" className="text-neutralgray hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profiles" className="text-neutralgray hover:text-primary transition-colors">
                    Child Profiles
                  </Link>
                  <Link to="/reports" className="text-neutralgray hover:text-primary transition-colors">
                    Progress Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/child-dashboard" className="text-primary font-medium hover:brightness-110 transition-colors">
                    Home
                  </Link>
                  <Link to="/english" className="text-primary font-medium hover:brightness-110 transition-colors">
                    English
                  </Link>
                  <Link to="/maths" className="text-primary font-medium hover:brightness-110 transition-colors">
                    Maths
                  </Link>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={`flex items-center gap-1 ${isParent ? "" : "text-primary"}`}
              >
                <LogOut size={18} />
                <span className="hidden lg:inline-block">Log Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/" className="text-neutralgray hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-neutralgray hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-6 pt-10">
              <Link to="/" className="flex items-center gap-2">
                <BookOpen size={24} className="text-primary" />
                <span className="font-bold text-lg">Bright Stars</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to={isParent ? "/parent-dashboard" : "/child-dashboard"} className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                      <Home size={18} />
                      Dashboard
                    </Link>
                    {isParent ? (
                      <>
                        <Link to="/profiles" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                          <UserCircle size={18} />
                          Child Profiles
                        </Link>
                        <Link to="/reports" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                          <BookOpen size={18} />
                          Progress Reports
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/english" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                          <BookOpen size={18} />
                          English
                        </Link>
                        <Link to="/maths" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                          <BookOpen size={18} />
                          Maths
                        </Link>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start p-0 hover:bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                      <Home size={18} />
                      Home
                    </Link>
                    <Link to="/about" className="flex items-center gap-2 text-neutralgray hover:text-primary transition-colors">
                      <BookOpen size={18} />
                      About
                    </Link>
                    <Link to="/login" className="mt-4">
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
