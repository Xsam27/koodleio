
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, BookOpen, Brain, Award, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-softpurple to-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 pop-in">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Personalized Learning for Your Child's Success
              </h1>
              <p className="text-lg text-neutralgray">
                Bright Stars delivers engaging, curriculum-aligned lessons in English and Maths 
                for children aged 5-15. Our AI tutor adapts to your child's learning style and pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" className="rounded-full hover-grow">
                  <Link to="/register" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full hover-grow">
                  <Link to="/how-it-works">Learn More</Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={18} className="text-primary" />
                  <span>UK Curriculum Aligned</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={18} className="text-primary" />
                  <span>Personalized Learning</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={18} className="text-primary" />
                  <span>Interactive Lessons</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl bounce-in">
              <div className="relative aspect-video bg-softblue rounded-2xl p-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brightpurple/20 to-skyblue/20 rounded-2xl"></div>
                <img 
                  src="/placeholder.svg" 
                  alt="Child learning with Bright Stars" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Bright Stars Works</h2>
            <p className="text-neutralgray max-w-2xl mx-auto">
              Our platform combines artificial intelligence with proven educational methods to
              deliver engaging, effective learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-softpurple hover-grow">
              <div className="bg-softpurple h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curriculum Aligned</h3>
              <p className="text-neutralgray">
                Lessons follow the UK national curriculum for Key Stages 1-3, ensuring
                relevant and comprehensive learning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-softpurple hover-grow">
              <div className="bg-softpink h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <Brain size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Personalization</h3>
              <p className="text-neutralgray">
                Our AI tutor adapts lessons to your child's learning pace, focusing more on
                areas that need improvement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-softpurple hover-grow">
              <div className="bg-softblue h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <Award size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
              <p className="text-neutralgray">
                Engaging activities keep children motivated with immediate feedback and
                fun rewards for progress.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-softpurple hover-grow">
              <div className="bg-softgray h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <BarChart size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-neutralgray">
                Detailed reports show parents their child's progress, strengths, and areas
                needing attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-softblue">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Child's Learning?</h2>
            <p className="text-lg mb-8">
              Join thousands of families using Bright Stars to support their children's education.
            </p>
            <Button size="lg" className="rounded-full hover-grow">
              <Link to="/register" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
