import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Loader2, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { callStudyAI } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { exportToPdf } from "@/lib/export-pdf";

export default function SummaryPanel() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"choose" | "text" | "pdf">("choose");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("study-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extract text via edge function
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({ filePath }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Failed to extract text");

      setText(result.text);
      toast.success(`Extracted ${result.totalChars.toLocaleString()} characters from PDF`);
    } catch (err: any) {
      toast.error(err.message);
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { result } = await callStudyAI({ action: "summarize", content: text });
      setSummary(result);
      if (user) {
        await supabase.from("notes").insert({
          user_id: user.id,
          title: fileName ? `Summary — ${fileName}` : "AI Summary — " + new Date().toLocaleDateString(),
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

  const reset = () => {
    setSummary("");
    setText("");
    setFileName("");
    setMode("choose");
  };

  const handleExportSummary = () => {
    import("react-dom/server").then(({ renderToStaticMarkup }) => {
      const html = renderToStaticMarkup(<ReactMarkdown>{summary}</ReactMarkdown>);
      try {
        exportToPdf(fileName ? `Summary — ${fileName}` : "AI Summary", html);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  if (summary) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-sm">{fileName || "Study Material"}</p>
            <p className="text-xs text-muted-foreground">{text.length.toLocaleString()} characters</p>
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
        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>Summarize Another</Button>
          <Button variant="outline" onClick={handleExportSummary}>
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="font-heading text-xl font-bold text-center mb-6">How would you like to add your study material?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("pdf")}
            className="card-elevated bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors"
          >
            <File className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-1">Upload PDF</h3>
            <p className="text-sm text-muted-foreground">Upload a textbook or notes PDF</p>
          </button>
          <button
            onClick={() => setMode("text")}
            className="card-elevated bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors"
          >
            <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-1">Paste Text</h3>
            <p className="text-sm text-muted-foreground">Paste content from any source</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => setMode("choose")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back
      </button>

      {mode === "pdf" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!fileName ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Upload a PDF</h3>
              <p className="text-muted-foreground text-sm mb-4">Max 20MB · Text-based PDFs only</p>
              <Button variant="default" disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploading ? "Extracting text..." : `${text.length.toLocaleString()} characters extracted`}
                  </p>
                </div>
                {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>

              {text && (
                <>
                  <details className="bg-card rounded-xl border border-border p-4">
                    <summary className="text-sm font-medium cursor-pointer text-muted-foreground">
                      Preview extracted text
                    </summary>
                    <p className="mt-3 text-sm text-foreground/70 whitespace-pre-wrap max-h-48 overflow-auto">
                      {text.slice(0, 2000)}{text.length > 2000 ? "..." : ""}
                    </p>
                  </details>

                  <Button onClick={handleSummarize} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {loading ? "Generating Summary..." : "Generate AI Summary"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "text" && (
        <div className="space-y-4">
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
      )}
    </div>
  );
}
