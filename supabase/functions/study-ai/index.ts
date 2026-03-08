import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action, content, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userMessages = messages || [];

    switch (action) {
      case "chat":
        systemPrompt = `You are StudyAI, an expert AI tutor for university students. You help students understand concepts, solve problems, and prepare for exams. Be encouraging, clear, and thorough. Use examples and analogies. Format responses with markdown for readability.`;
        break;
      case "summarize":
        systemPrompt = `You are an expert academic summarizer. Given text content from a textbook or study material, create a well-structured summary with:
- Key concepts highlighted in bold
- Main topics as headers
- Important definitions
- Key takeaways at the end
Keep it concise but comprehensive.`;
        userMessages = [{ role: "user", content: `Summarize the following study material:\n\n${content}` }];
        break;
      case "generate_quiz":
        systemPrompt = `You are a quiz generator for students. Generate exactly 5 multiple-choice questions based on the given topic/content. Return ONLY valid JSON in this exact format, no other text:
[{"q":"question text","options":["A","B","C","D"],"answer":0}]
where answer is the 0-based index of the correct option.`;
        userMessages = [{ role: "user", content: `Generate a quiz about: ${subject || content}` }];
        break;
      case "generate_notes":
        systemPrompt = `You are an expert note-taker for university students. Given a topic, create structured, concise study notes with:
- Clear headings and subheadings
- Bullet points for key facts
- Bold for important terms
- Brief explanations
Make notes exam-ready and easy to review.`;
        userMessages = [{ role: "user", content: `Create study notes about: ${subject || content}` }];
        break;
      case "generate_schedule":
        systemPrompt = `You are a study planner. Given subjects and available time, create an optimized study schedule. Return ONLY valid JSON array, no other text:
[{"subject":"Subject Name","duration_minutes":45,"time":"9:00 AM"}]
Include breaks and vary subjects for optimal learning.`;
        userMessages = [{ role: "user", content: `Create a study schedule for these subjects: ${content}` }];
        break;
      default:
        systemPrompt = "You are a helpful AI study assistant.";
    }

    const isStreaming = action === "chat";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...userMessages],
        stream: isStreaming,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service error");
    }

    if (isStreaming) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
