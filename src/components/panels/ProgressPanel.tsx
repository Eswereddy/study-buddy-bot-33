import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubjectProgress {
  name: string;
  quizzes: number;
  avgScore: number;
  hours: number;
}

export default function ProgressPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      // Get quiz attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total, quiz_id, quizzes(subject)")
        .eq("user_id", user.id);

      // Get study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("subject, duration_minutes, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      const quizCount = attempts?.length || 0;
      const totalScore = attempts?.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) || 0;
      const hours = (sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0) / 60;

      setTotalQuizzes(quizCount);
      setAvgScore(quizCount > 0 ? Math.round(totalScore / quizCount) : 0);
      setTotalHours(Math.round(hours * 10) / 10);

      // Group by subject
      const subjectMap: Record<string, SubjectProgress> = {};
      
      attempts?.forEach((a: any) => {
        const subj = a.quizzes?.subject || "General";
        if (!subjectMap[subj]) subjectMap[subj] = { name: subj, quizzes: 0, avgScore: 0, hours: 0 };
        subjectMap[subj].quizzes++;
        subjectMap[subj].avgScore += (a.score / a.total) * 100;
      });

      sessions?.forEach((s) => {
        if (!subjectMap[s.subject]) subjectMap[s.subject] = { name: s.subject, quizzes: 0, avgScore: 0, hours: 0 };
        subjectMap[s.subject].hours += s.duration_minutes / 60;
      });

      Object.values(subjectMap).forEach((s) => {
        if (s.quizzes > 0) s.avgScore = Math.round(s.avgScore / s.quizzes);
        s.hours = Math.round(s.hours * 10) / 10;
      });

      setSubjects(Object.values(subjectMap));
      setLoading(false);
    };
    fetchProgress();
  }, [user]);

  if (loading) {
    return <div className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Study Hours", value: `${totalHours}h` },
          { label: "Quizzes Taken", value: String(totalQuizzes) },
          { label: "Avg Score", value: `${avgScore}%` },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Subject Progress
        </h3>
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No progress data yet. Take a quiz or complete study sessions!</p>
          </div>
        ) : (
          subjects.map((s) => (
            <div key={s.name} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{s.name}</span>
                <span className="text-sm text-primary font-semibold">{s.avgScore}%</span>
              </div>
              <Progress value={s.avgScore} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{s.quizzes} quizzes</span>
                <span>{s.hours}h studied</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
