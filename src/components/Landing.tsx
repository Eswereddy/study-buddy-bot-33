import { motion } from "framer-motion";
import { BookOpen, Brain, MessageCircle, Calendar, BarChart3, FileText, ArrowRight } from "lucide-react";
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
    </div>
  );
}
