import { TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const subjects = [
  { name: "Biology", progress: 78, quizzes: 12, hours: 18 },
  { name: "Chemistry", progress: 54, quizzes: 7, hours: 10 },
  { name: "Mathematics", progress: 85, quizzes: 15, hours: 22 },
  { name: "History", progress: 42, quizzes: 5, hours: 8 },
];

export default function ProgressPanel() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Study Hours", value: "58h" },
          { label: "Quizzes Taken", value: "39" },
          { label: "Avg Score", value: "82%" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per subject */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Subject Progress
        </h3>
        {subjects.map((s) => (
          <div key={s.name} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{s.name}</span>
              <span className="text-sm text-primary font-semibold">{s.progress}%</span>
            </div>
            <Progress value={s.progress} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{s.quizzes} quizzes</span>
              <span>{s.hours}h studied</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
