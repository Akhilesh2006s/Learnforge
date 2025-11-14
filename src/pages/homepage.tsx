import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  ArrowRight, Sparkles, Brain, BookOpen, Target, TrendingUp, Users, Shield, Zap, 
  GraduationCap, UserPlus, Lock, Award, CheckCircle 
} from "lucide-react";
import { InteractiveBackground, FloatingParticles } from "@/components/background/InteractiveBackground";

const Index = () => {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Interactive Background */}
      <div className="fixed inset-0 z-0">
        <InteractiveBackground />
        <FloatingParticles />
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 border border-pink-200">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">AI-Powered Learning Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-gray-900">Transform </span>
              <span className="text-pink-600">Education</span>
              <span className="text-gray-900"> with </span>
              <span className="text-pink-600">Intelligent Learning</span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Experience personalized AI learning paths with multi-board curriculum support, 
              interactive video lectures, and smart assessments. Built for students, teachers, 
              and administrators with real-time progress tracking and 24/7 AI tutor support.
            </p>
            
            {/* Multi-Board Support Badge */}
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 rounded-full bg-pink-100 border border-pink-200 text-pink-700">CBSE AP/TS</span>
              <span className="px-4 py-2 rounded-full bg-pink-100 border border-pink-200 text-pink-700">State AP/TS</span>
              <span className="px-4 py-2 rounded-full bg-pink-100 border border-pink-200 text-pink-700">Smart Assessments</span>
              <span className="px-4 py-2 rounded-full bg-pink-100 border border-pink-200 text-pink-700">IQ Rank Boost</span>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  className="group bg-pink-600 hover:bg-pink-700 text-white shadow-lg transition-all px-8 py-6"
                >
                  Sign In to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToFeatures}
                className="border-pink-200 bg-white text-pink-600 hover:bg-pink-50 px-8 py-6"
              >
                Explore Features
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>AI-Powered Personalization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Multi-Board Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span>24/7 AI Tutor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="container relative z-10 px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-pink-600">Powerful Features</span>{" "}
              <span className="text-gray-900">for Modern Learning</span>
            </h2>
            <p className="text-xl text-gray-700">
              Everything you need to deliver exceptional educational experiences and achieve academic excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Personalized Learning",
                description: "Adaptive learning paths powered by AI that adjust to each student's pace, strengths, and learning style for optimal results.",
              },
              {
                icon: BookOpen,
                title: "Multi-Board Curriculum Support",
                description: "Comprehensive coverage of CBSE AP/TS and State AP/TS boards with curriculum-aligned content and exam preparation.",
              },
              {
                icon: GraduationCap,
                title: "Interactive Video Lectures",
                description: "Engaging video content with interactive elements, quizzes, and real-time doubt resolution for immersive learning.",
              },
              {
                icon: Target,
                title: "Smart Assessments & Exams",
                description: "Intelligent assessment system with adaptive difficulty, instant feedback, and comprehensive performance analytics.",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Progress Analytics",
                description: "Detailed insights into learning progress, strengths, weaknesses, and personalized recommendations for improvement.",
              },
              {
                icon: Users,
                title: "Teacher & Admin Tools",
                description: "Comprehensive dashboards for content creation, student management, class organization, and performance tracking.",
              },
              {
                icon: Zap,
                title: "IQ Rank Boost Activities",
                description: "Specialized quizzes and activities designed to enhance cognitive abilities and boost overall academic performance.",
              },
              {
                icon: Shield,
                title: "24/7 AI Tutor Support",
                description: "Vidya AI provides instant answers, explanations, and personalized guidance whenever students need help.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group p-6 bg-pink-50 border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s backwards`,
                }}
              >
                <div className="mb-4 inline-flex p-3 rounded-xl bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-pink-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden z-10">
        <div className="container relative z-10 px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gray-900">How </span>
              <span className="text-pink-600">It Works</span>
            </h2>
            <p className="text-xl text-gray-700">
              Get started in minutes and begin your journey to academic success with our simple, intuitive process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: UserPlus,
                number: "01",
                title: "Create Your Account",
                description: "Sign up as a student, teacher, or admin and get instant access to your personalized dashboard.",
              },
              {
                icon: BookOpen,
                number: "02",
                title: "Choose Your Path",
                description: "Select your board, class, and subjects. Our AI creates a customized learning path tailored to your goals.",
              },
              {
                icon: Target,
                number: "03",
                title: "Learn & Practice",
                description: "Access interactive video lectures, practice with smart assessments, and get instant feedback from our AI tutor.",
              },
              {
                icon: TrendingUp,
                number: "04",
                title: "Track Progress",
                description: "Monitor your performance with detailed analytics, identify areas for improvement, and achieve academic excellence.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="relative group"
                style={{
                  animation: `fade-in-up 0.8s ease-out ${index * 0.15}s backwards`,
                }}
              >
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-pink-300 to-pink-400 -translate-x-1/2" />
                )}
                
                <div className="relative text-center space-y-4">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-pink-100 group-hover:text-pink-200 transition-colors">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center -mt-12 mb-4">
                    <div className="p-4 rounded-2xl bg-pink-100 border border-pink-200 group-hover:scale-110 transition-transform">
                      <step.icon className="w-8 h-8 text-pink-600" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 via-pink-50/50 to-pink-100/50" />
        
        <div className="container relative z-10 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "10,000+", label: "Active Students" },
              { value: "500+", label: "Expert Teachers" },
              { value: "50+", label: "Partner Schools" },
              { value: "95%", label: "Success Rate" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s backwards`,
                }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 relative z-10">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Data Security",
                description: "Enterprise-grade security with encrypted data storage and secure authentication.",
              },
              {
                icon: Lock,
                title: "Privacy Protected",
                description: "GDPR compliant with strict privacy controls and transparent data handling.",
              },
              {
                icon: Award,
                title: "Quality Assured",
                description: "Board-aligned curriculum verified by subject matter experts and educators.",
              },
              {
                icon: CheckCircle,
                title: "Trusted Platform",
                description: "Used by leading schools and institutions across multiple states.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="p-6 bg-white border border-pink-200 text-center"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s backwards`,
                }}
              >
                <div className="inline-flex p-2 rounded-lg bg-pink-100 text-pink-600 mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold mb-1 text-sm text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
