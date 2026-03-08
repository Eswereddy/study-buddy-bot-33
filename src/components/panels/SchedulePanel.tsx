import { Clock, CheckCircle2 } from "lucide-react";

const schedule = [
  { time: "9:00 AM", subject: "Biology — Cell Structure", duration: "45 min", done: true },
  { time: "10:00 AM", subject: "Chemistry — Periodic Table", duration: "30 min", done: true },
  { time: "11:00 AM", subject: "Math — Calculus Review", duration: "60 min", done: false },
  { time: "1:00 PM", subject: "History — Essay Prep", duration: "45 min", done: false },
  { time: "3:00 PM", subject: "Biology Quiz Practice", duration: "30 min", done: false },
];

export default function SchedulePanel() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <p className="text-sm text-muted-foreground">Today's study plan</p>
      {schedule.map((s, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
            s.done ? "bg-primary/5 border-primary/20" : "bg-card border-border"
          }`}
        >
          {s.done ? (
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.subject}</p>
            <p className="text-xs text-muted-foreground">{s.time} · {s.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
