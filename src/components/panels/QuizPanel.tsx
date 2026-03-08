import { useState, useEffect } from "react";
import { Brain, CheckCircle2, XCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callStudyAI } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

export default function QuizPanel() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!subject.trim()) return;
    setGenerating(true);
    try {
      const { result } = await callStudyAI({ action: "generate_quiz", subject });
      // Parse JSON from the result (may have markdown wrapping)
      const jsonStr = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed: Question[] = JSON.parse(jsonStr);
      setQuestions(parsed);
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setDone(false);

      // Save quiz
      if (user) {
        const { data } = await supabase.from("quizzes").insert({
          user_id: user.id,
          title: `Quiz: ${subject}`,
          subject,
          questions: parsed as any,
        }).select("id").single();
        if (data) setQuizId(data.id);
      }
    } catch (err: any) {
      toast.error("Failed to generate quiz. Try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].answer) setScore((s) => s + 1);
  };

  const next = async () => {
    if (current + 1 >= questions.length) {
      setDone(true);
      // Save attempt
      if (user && quizId) {
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          quiz_id: quizId,
          score: score + (selected === questions[current].answer ? 1 : 0),
          total: questions.length,
        });
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  // No quiz yet
  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-4 py-8">
        <div className="text-center mb-6">
          <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
          <h2 className="font-heading text-xl font-bold">AI Quiz Generator</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Enter a topic and get 5 AI-generated questions instantly
          </p>
        </div>
        <Input
          placeholder="Enter a topic (e.g., Cell Biology, World War II)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
        />
        <Button onClick={generateQuiz} disabled={generating || !subject.trim()} className="w-full">
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {generating ? "Generating Quiz..." : "Generate Quiz"}
        </Button>
      </div>
    );
  }

  if (done) {
    const finalScore = score;
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
        <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-3xl font-bold text-primary mb-2">{finalScore}/{questions.length}</p>
        <p className="text-muted-foreground mb-6">
          {finalScore === questions.length ? "Perfect score! 🎉" : finalScore >= questions.length * 0.7 ? "Great job! 👏" : "Keep studying! 📚"}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setQuestions([]); setSubject(""); }}>New Quiz</Button>
          <Button variant="outline" onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <h2 className="font-heading font-semibold text-xl">{q.q}</h2>
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let cls = "border border-border bg-card hover:border-primary/40";
          if (selected !== null) {
            if (i === q.answer) cls = "border-primary bg-primary/10";
            else if (i === selected) cls = "border-destructive bg-destructive/10";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-5 py-3.5 rounded-xl transition-colors text-sm font-medium flex items-center gap-3 ${cls}`}
            >
              <span className="flex-1">{opt}</span>
              {selected !== null && i === q.answer && <CheckCircle2 className="h-5 w-5 text-primary" />}
              {selected !== null && i === selected && i !== q.answer && <XCircle className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <Button className="w-full" onClick={next}>
          {current + 1 >= questions.length ? "See Results" : "Next Question"}
        </Button>
      )}
    </div>
  );
}
