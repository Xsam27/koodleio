
import { Link } from "react-router-dom";
import { BookOpen, Mail, Shield } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-8 border-t border-softpurple">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen size={24} className="text-brightpurple" />
              <span className="font-bold text-lg text-brightpurple">Bright Stars</span>
            </Link>
            <p className="text-sm text-neutralgray">
              Empowering children aged 5–15 with personalized, interactive learning based on the UK curriculum.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-neutralgray hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/curriculum" className="text-sm text-neutralgray hover:text-primary transition-colors">
                Our Curriculum
              </Link>
              <Link to="/how-it-works" className="text-sm text-neutralgray hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-sm text-neutralgray hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/faq" className="text-sm text-neutralgray hover:text-primary transition-colors">
                FAQs
              </Link>
            </nav>
          </div>

          {/* Contact & Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Contact & Legal</h3>
            <div className="flex flex-col gap-2">
              <a href="mailto:support@brightstars.edu" className="text-sm text-neutralgray hover:text-primary transition-colors flex items-center gap-2">
                <Mail size={16} />
                support@brightstars.edu
              </a>
              <Link to="/privacy" className="text-sm text-neutralgray hover:text-primary transition-colors flex items-center gap-2">
                <Shield size={16} />
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-neutralgray hover:text-primary transition-colors flex items-center gap-2">
                <Shield size={16} />
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-softpurple text-center">
          <p className="text-xs text-neutralgray">
            © {currentYear} Bright Stars Learning Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
