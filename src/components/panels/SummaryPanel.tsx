import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SummaryPanel() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!uploaded ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setUploaded(true)}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">Upload a PDF</h3>
          <p className="text-muted-foreground text-sm">
            Drop your textbook or notes here and get an AI-generated summary
          </p>
          <Button className="mt-6" variant="default">
            Choose File
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Introduction_to_Biology.pdf</p>
              <p className="text-xs text-muted-foreground">24 pages · 2.4 MB</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> AI Summary
            </h3>
            <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong>Chapter 1: The Science of Life</strong> — Biology is the study of living organisms and their interactions. Key themes include evolution, energy processing, and homeostasis.
              </p>
              <p>
                <strong>Chapter 2: Cell Structure</strong> — All living things are made of cells. Prokaryotic cells lack a nucleus while eukaryotic cells have membrane-bound organelles including mitochondria and the endoplasmic reticulum.
              </p>
              <p>
                <strong>Key Concepts:</strong> DNA replication, cell division (mitosis & meiosis), protein synthesis, and cellular respiration are fundamental processes covered across chapters 3-8.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default">Generate Quiz</Button>
              <Button size="sm" variant="outline">Create Notes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
