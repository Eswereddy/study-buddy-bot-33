import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { callStudyAI } from "@/lib/ai";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Session = Tables<"study_sessions">;

export default function SchedulePanel() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchSessions = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_at", today.toISOString())
      .order("scheduled_at", { ascending: true });
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, [user]);

  const generateSchedule = async () => {
    if (!subjects.trim()) return;
    setGenerating(true);
    try {
      const { result } = await callStudyAI({ action: "generate_schedule", content: subjects });
      const jsonStr = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const schedule = JSON.parse(jsonStr);

      const today = new Date();
      const inserts = schedule.map((s: any) => {
        const [hours, minutes] = s.time.replace(/ (AM|PM)/, (m: string) => m).match(/\d+/g) || ["9", "0"];
        const isPM = s.time.includes("PM");
        const h = parseInt(hours) + (isPM && parseInt(hours) !== 12 ? 12 : 0);
        const scheduledAt = new Date(today);
        scheduledAt.setHours(h, parseInt(minutes), 0, 0);
        return {
          user_id: user!.id,
          subject: s.subject,
          duration_minutes: s.duration_minutes,
          scheduled_at: scheduledAt.toISOString(),
        };
      });

      await supabase.from("study_sessions").insert(inserts);
      setSubjects("");
      await fetchSessions();
      toast.success("Schedule generated!");
    } catch (err: any) {
      toast.error("Failed to generate schedule");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from("study_sessions").update({ completed: !completed }).eq("id", id);
    await fetchSessions();
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <Input
          placeholder="Enter subjects (e.g., Biology, Chemistry, Math)"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />
        <Button onClick={generateSchedule} disabled={generating || !subjects.trim()} className="w-full" size="sm">
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate AI Schedule"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">Today's study plan</p>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No sessions scheduled. Generate a study plan above!</p>
        </div>
      ) : (
        sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => toggleComplete(s.id, s.completed || false)}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              s.completed ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:border-primary/30"
            }`}
          >
            {s.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${s.completed ? "line-through text-muted-foreground" : ""}`}>
                {s.subject}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {s.duration_minutes} min
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
