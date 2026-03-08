import { motion } from "framer-motion";
import { BookOpen, Brain, MessageCircle, Calendar, BarChart3, FileText, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: FileText, title: "PDF Summaries", desc: "Upload textbooks and get instant AI-generated summaries" },
  { icon: Brain, title: "Quiz Generator", desc: "Auto-create quizzes from your notes to test knowledge" },
  { icon: MessageCircle, title: "AI Tutor", desc: "Chat with an AI that understands your study material" },
  { icon: Calendar, title: "Study Planner", desc: "Smart schedules that adapt to your learning pace" },
  { icon: BarChart3, title: "Progress Tracking", desc: "Visualize your learning journey with detailed analytics" },
  { icon: BookOpen, title: "Note Generator", desc: "Transform lectures and readings into structured notes" },
];

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(162,63%,45%,0.2),transparent_60%)]" />
        <div className="container mx-auto px-6 py-24 md:py-36 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight tracking-tight">
              Study Smarter,
              <br />
              Not Harder.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
              Your AI-powered study companion that summarizes textbooks, generates quizzes, and tutors you through any subject.
            </p>
            <div className="mt-10 flex gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="font-heading font-semibold text-base px-8"
                onClick={onGetStarted}
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Everything you need to ace your studies
        </motion.h2>
        <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">
          Powered by AI, designed for students who want results.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-elevated rounded-xl bg-card p-6 border border-border cursor-default"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div className="hero-gradient rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to transform your study routine?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Join thousands of students using AI to learn faster and retain more.
          </p>
          <Button size="lg" variant="secondary" className="font-heading font-semibold" onClick={onGetStarted}>
            Start Studying <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-lg">StudyAI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="font-heading font-semibold text-sm">JAKKIREDDYESWAR REDDY</p>
              <a
                href="mailto:jakkireddyeswarreddy@gmail.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                jakkireddyeswarreddy@gmail.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} StudyAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.944 13.944 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.574 4.897 4.897 0 0 1-2.229-.616v.062a4.918 4.918 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.085 4.92 4.92 0 0 0 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.01-7.502 14.01-14.01 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="mailto:jakkireddyeswarreddy@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
