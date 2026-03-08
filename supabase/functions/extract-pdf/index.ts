import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("study-documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    
    // Extract text from PDF by parsing the raw bytes
    // We look for text between BT (begin text) and ET (end text) operators
    // and also extract text from parenthesized strings and hex strings
    let extractedText = "";
    
    // Convert to string for pattern matching
    const rawStr = new TextDecoder("latin1").decode(bytes);
    
    // Method 1: Extract text from stream objects using Tj and TJ operators
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(rawStr)) !== null) {
      const streamContent = streamMatch[1];
      
      // Look for text showing operators: Tj, TJ, ', "
      // Extract parenthesized strings before Tj
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
        extractedText += decodePdfString(tjMatch[1]) + " ";
      }
      
      // Extract TJ arrays: [(text) kerning (text) ...] TJ
      const tjArrayRegex = /\[((?:[^[\]]*|\[(?:[^[\]]*)\])*)\]\s*TJ/g;
      let tjArrayMatch;
      while ((tjArrayMatch = tjArrayRegex.exec(streamContent)) !== null) {
        const arrayContent = tjArrayMatch[1];
        const stringRegex = /\(([^)]*)\)/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(arrayContent)) !== null) {
          extractedText += decodePdfString(strMatch[1]);
        }
        extractedText += " ";
      }
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\s+/g, " ")
      .trim();

    // If no text extracted from streams, try a simpler approach
    if (extractedText.length < 50) {
      // Try to get any readable text sequences from the PDF
      const textParts: string[] = [];
      const simpleRegex = /\(([^)]{2,})\)/g;
      let simpleMatch;
      while ((simpleMatch = simpleRegex.exec(rawStr)) !== null) {
        const decoded = decodePdfString(simpleMatch[1]);
        // Filter out binary/non-readable content
        if (decoded.length > 1 && /[a-zA-Z]/.test(decoded) && !/^[A-Z]{1,3}$/.test(decoded)) {
          textParts.push(decoded);
        }
      }
      extractedText = textParts.join(" ").replace(/\s+/g, " ").trim();
    }

    if (!extractedText || extractedText.length < 20) {
      return new Response(JSON.stringify({ 
        error: "Could not extract readable text from this PDF. It may be a scanned document or image-based PDF. Try pasting the text manually instead." 
      }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit to ~15000 chars to stay within AI context limits
    const truncated = extractedText.slice(0, 15000);

    return new Response(JSON.stringify({ text: truncated, totalChars: extractedText.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_match, oct) => String.fromCharCode(parseInt(oct, 8)));
}
