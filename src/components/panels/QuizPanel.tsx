import { useState } from "react";
import { Brain, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const questions = [
  {
    q: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    answer: 1,
  },
  {
    q: "Which process converts glucose to energy?",
    options: ["Photosynthesis", "Osmosis", "Cellular Respiration", "Fermentation"],
    answer: 2,
  },
  {
    q: "DNA stands for:",
    options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nucleus Acid", "None of the above"],
    answer: 0,
  },
];

export default function QuizPanel() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
        <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-6">
          You scored {score}/{questions.length}
        </p>
        <Button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}>
          Retry
        </Button>
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
