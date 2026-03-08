import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockNotes = [
  { id: 1, title: "Biology Ch.1 — Science of Life", date: "Mar 5", preview: "Biology studies living organisms..." },
  { id: 2, title: "Chemistry — Atomic Structure", date: "Mar 3", preview: "Atoms consist of protons, neutrons..." },
  { id: 3, title: "History — Industrial Revolution", date: "Mar 1", preview: "The Industrial Revolution began in..." },
];

export default function NotesPanel() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{mockNotes.length} notes</p>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Note</Button>
      </div>
      {mockNotes.map((n) => (
        <div key={n.id} className="card-elevated bg-card rounded-xl border border-border p-5 cursor-pointer">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-sm">{n.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
              <p className="text-sm text-foreground/70 mt-2 truncate">{n.preview}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
