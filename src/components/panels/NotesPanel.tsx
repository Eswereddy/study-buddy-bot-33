import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, BookOpen, Loader2, Trash2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { callStudyAI } from "@/lib/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { exportToPdf } from "@/lib/export-pdf";
import type { Tables } from "@/integrations/supabase/types";

type Note = Tables<"notes">;

export default function NotesPanel() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [user]);

  const generateNotes = async () => {
    if (!subject.trim()) return;
    setGenerating(true);
    try {
      const { result } = await callStudyAI({ action: "generate_notes", subject });
      await supabase.from("notes").insert({
        user_id: user!.id,
        title: subject,
        content: result,
        subject,
        source_type: "ai_generated",
      });
      setSubject("");
      setCreating(false);
      await fetchNotes();
      toast.success("Notes generated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    if (selectedNote?.id === id) setSelectedNote(null);
    await fetchNotes();
  };

  const handleExportNote = (note: Note) => {
    const container = document.createElement("div");
    const root = document.createElement("div");
    // Render markdown to HTML for export
    import("react-dom/server").then(({ renderToStaticMarkup }) => {
      const html = renderToStaticMarkup(<ReactMarkdown>{note.content || ""}</ReactMarkdown>);
      try {
        exportToPdf(note.title, html);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  if (selectedNote) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSelectedNote(null)}>
            ← Back to notes
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportNote(selectedNote)}>
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
        </div>
        <h2 className="font-heading text-xl font-bold">{selectedNote.title}</h2>
        <p className="text-xs text-muted-foreground">
          {selectedNote.subject} · {new Date(selectedNote.created_at).toLocaleDateString()}
        </p>
        <div className="bg-card rounded-xl border border-border p-6 prose prose-sm max-w-none text-foreground/80">
          <ReactMarkdown>{selectedNote.content || ""}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q) ||
        (n.subject || "").toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filteredNotes.length} notes</p>
        <Button size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="h-4 w-4 mr-1" /> AI Notes
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes by title, content, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <Input
            placeholder="Enter a topic (e.g., Photosynthesis, Newton's Laws)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Button onClick={generateNotes} disabled={generating || !subject.trim()} className="w-full">
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {generating ? "Generating..." : "Generate AI Notes"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No notes yet. Generate your first AI notes!</p>
        </div>
      ) : (
        notes.map((n) => (
          <div
            key={n.id}
            className="card-elevated bg-card rounded-xl border border-border p-5 cursor-pointer"
            onClick={() => setSelectedNote(n)}
          >
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-sm">{n.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.subject} · {new Date(n.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{n.content?.slice(0, 120)}...</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
