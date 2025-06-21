import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  CheckCircle, 
  Users, 
  Briefcase, 
  BookOpen, 
  Palette,
  Sparkles,
  Zap,
  Clock,
  AlertTriangle,
  Mic,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: "How accurate is the handwriting recognition?",
      answer: "TaskBoost uses advanced AI for industry-leading accuracy with both handwritten and typed text. It works well with most handwriting styles and multiple languages."
    },
    {
      question: "Can I edit tasks after they're created?",
      answer: "Yes! All tasks, priorities, and deadlines are fully editable after creation. You have complete control over your task organization."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption and secure cloud storage. Your notes and tasks are private and only accessible to you."
    },
    {
      question: "What formats are supported?",
      answer: "We support JPG, PNG, and JPEG formats for photos. For voice recordings, we support standard audio formats with clear speech recognition."
    },
    {
      question: "How does voice transcription work?",
      answer: "Record voice memos directly in the app, and our AI will transcribe speech to text and automatically structure it into actionable tasks with priorities and deadlines."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">🚀 TaskBoost</div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it works</a>
                <a href="#faq" className="text-gray-600 hover:text-primary transition-colors">FAQ</a>
                <Button onClick={handleLogin} className="bg-primary text-white hover:bg-green-600">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Turn <span className="text-primary">scribbles</span> into structured <span className="text-secondary">progress</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Scan handwritten notes or record voice memos to extract tasks with AI and boost your productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-primary text-white px-8 py-4 text-lg hover:bg-green-600 transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 text-lg hover:border-primary hover:text-primary"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Problem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We take notes everywhere - on whiteboards, sticky notes, notebooks. But they get lost, forgotten, or buried in chaos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lost Notes</h3>
                <p className="text-gray-600">Important tasks written on paper get misplaced or forgotten</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Structure</h3>
                <p className="text-gray-600">Scribbled tasks lack priorities, deadlines, and organization</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Motivation</h3>
                <p className="text-gray-600">Traditional to-do lists are boring and don't inspire action</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">The Solution</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TaskBoost bridges the gap between handwritten chaos and digital organization with AI-powered magic.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 p-8 border-2 border-green-200 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Scan Your Notes</h3>
                <p className="text-gray-600">Take a photo of any handwritten notes, whiteboards, or sticky notes using your phone camera.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 border-2 border-blue-200 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Processing</h3>
                <p className="text-gray-600">Our AI extracts text, identifies tasks, and automatically adds priorities and suggested deadlines.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 border-2 border-purple-200 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Complete & Track</h3>
                <p className="text-gray-600">Complete tasks to grow your virtual tree, earn rewards, and track your productivity stats.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Who Is TaskBoost For?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perfect for anyone who loves handwritten planning but needs digital organization.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-blue-50 p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Students</h3>
                <p className="text-gray-600 mb-6">
                  Turn lecture notes and study plans into organized assignments with deadlines
                </p>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Class note organization</li>
                  <li>• Assignment tracking</li>
                  <li>• Study schedule planning</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-green-50 p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Professionals</h3>
                <p className="text-gray-600 mb-6">
                  Convert meeting notes and brainstorming sessions into actionable work items
                </p>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Meeting action items</li>
                  <li>• Project planning</li>
                  <li>• Team collaboration</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 p-8 text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Creatives</h3>
                <p className="text-gray-600 mb-6">
                  Transform creative sketches and ideas into structured project timelines
                </p>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Creative project planning</li>
                  <li>• Design process tracking</li>
                  <li>• Inspiration organization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform chaotic notes into productive action.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Smart Image Scanner</h3>
                  <p className="text-gray-600 mb-4">Upload photos of handwritten notes, whiteboards, or typed text. Supports JPG, PNG, and JPEG formats with instant processing.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Handwriting Recognition</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Whiteboard Capture</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">AI Task Structuring</h3>
                  <p className="text-gray-600 mb-4">AI intelligently extracts actionable tasks, adds priorities, suggests deadlines, and estimates effort required.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Auto Priorities</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Smart Deadlines</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Voice Transcription</h3>
                  <p className="text-gray-600 mb-4">Record voice memos and let AI convert speech to structured tasks with smart organization.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Speech-to-Text</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Voice Processing</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-2 border-blue-200">
                <CardContent className="text-center">
                  <div className="text-5xl mb-4">📸</div>
                  <h4 className="text-lg font-semibold mb-2">Photo Scanner</h4>
                  <p className="text-sm text-gray-600">Capture handwritten notes</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 border-2 border-purple-200">
                <CardContent className="text-center">
                  <div className="text-5xl mb-4">🎤</div>
                  <h4 className="text-lg font-semibold mb-2">Voice Recorder</h4>
                  <p className="text-sm text-gray-600">Record voice memos</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 border-2 border-green-200">
                <CardContent className="text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-lg font-semibold mb-2">Task Manager</h4>
                  <p className="text-sm text-gray-600">Organize and complete</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about TaskBoost.
            </p>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-0">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="text-2xl font-bold text-primary">🚀 TaskBoost</div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Transform your handwritten chaos into structured progress with AI-powered task management.
            </p>
            <div className="text-sm text-gray-500">
              © 2024 TaskBoost. All rights reserved.
            </div>
            <div className="text-sm text-gray-400 mt-2">
              made by{" "}
              <a
                href="https://x.com/saad32170"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                saad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}