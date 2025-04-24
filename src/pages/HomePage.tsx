import { Link } from "react-router-dom";
import { ArrowRight, Star, Brain, BookOpen, Trophy, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-softpurple via-softblue to-white py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 pop-in">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Welcome to Koodle.io! 🌟
              </h1>
              <p className="text-lg text-neutralgray">
                Join us on an exciting learning adventure with fun activities, 
                cool games, and awesome rewards!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button 
                  size="lg" 
                  className="rounded-full bg-gradient-to-r from-primary to-brightpurple hover:opacity-90 transition-all"
                >
                  <Link to="/register" className="flex items-center gap-2">
                    Start Learning
                    <Rocket className="animate-bounce" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full border-2 hover:bg-softpurple/20"
                >
                  <Link to="/how-it-works" className="flex items-center gap-2">
                    See How It Works
                    <Star className="text-yellow-500" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Fun animated illustrations for kids */}
            <div className="relative bounce-in">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-softpink rounded-full animate-pulse"></div>
              <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-softblue rounded-full animate-bounce delay-100"></div>
              <div className="rounded-2xl overflow-hidden shadow-xl bg-white p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-softpurple p-4 rounded-xl">
                    <BookOpen size={40} className="text-primary mb-2" />
                    <p className="text-sm font-medium">Fun English Games</p>
                  </div>
                  <div className="bg-softblue p-4 rounded-xl">
                    <Brain size={40} className="text-skyblue mb-2" />
                    <p className="text-sm font-medium">Cool Math Activities</p>
                  </div>
                  <div className="bg-softgreen p-4 rounded-xl">
                    <Trophy size={40} className="text-yellow-500 mb-2" />
                    <p className="text-sm font-medium">Win Rewards</p>
                  </div>
                  <div className="bg-softpink p-4 rounded-xl">
                    <Star size={40} className="text-primary mb-2" />
                    <p className="text-sm font-medium">Learn & Have Fun</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2">
            <Star className="text-yellow-500" />
            What Makes Learning Fun?
            <Star className="text-yellow-500" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-gradient-to-br from-softpurple to-white p-6 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300">
              <div className="bg-white h-14 w-14 rounded-full flex items-center justify-center mb-4 shadow-md">
                <BookOpen size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fun Stories</h3>
              <p className="text-neutralgray">
                Read exciting stories and solve cool puzzles along the way!
              </p>
            </div>

            <div className="bg-gradient-to-br from-softblue to-white p-6 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300">
              <div className="bg-white h-14 w-14 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Brain size={28} className="text-skyblue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Brain Games</h3>
              <p className="text-neutralgray">
                Challenge yourself with fun math games and puzzles!
              </p>
            </div>

            <div className="bg-gradient-to-br from-softpink to-white p-6 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300">
              <div className="bg-white h-14 w-14 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Trophy size={28} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Win Stars</h3>
              <p className="text-neutralgray">
                Collect stars and unlock special rewards as you learn!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-softpurple to-softblue">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Ready for an Amazing Learning Adventure? 🚀
            </h2>
            <p className="text-lg mb-8">
              Join thousands of happy kids learning and having fun with Koodle.io!
            </p>
            <Button 
              size="lg" 
              className="rounded-full bg-white text-primary hover:bg-opacity-90"
            >
              <Link to="/register" className="flex items-center gap-2">
                Start Your Adventure
                <ArrowRight className="animate-bounce" />
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
