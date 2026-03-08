import { useState } from "react";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { callStudyAI } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function SummaryPanel() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { result } = await callStudyAI({ action: "summarize", content: text });
      setSummary(result);
      // Save as note
      if (user) {
        await supabase.from("notes").insert({
          user_id: user.id,
          title: "AI Summary — " + new Date().toLocaleDateString(),
          content: result,
          source_type: "summary",
          subject: "General",
        });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!summary ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">Paste your study material</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Paste text from your textbook, lecture notes, or any study material for an AI summary
            </p>
          </div>
          <Textarea
            placeholder="Paste your textbook content, lecture notes, or any study material here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSummarize} disabled={loading || !text.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? "Generating Summary..." : "Generate AI Summary"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Study Material</p>
              <p className="text-xs text-muted-foreground">{text.length} characters</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> AI Summary
            </h3>
            <div className="prose prose-sm max-w-none text-foreground/80">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
          <Button variant="outline" onClick={() => { setSummary(""); setText(""); }}>
            Summarize Another
          </Button>
        </div>
      )}
    </div>
  );
}
