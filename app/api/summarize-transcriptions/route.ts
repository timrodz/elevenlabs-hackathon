import { NextResponse } from "next/server";

const OPENAI_API_URL = process.env.OPENAI_API_URL;

export async function POST(request: Request) {
  try {
    // Get transcriptions from request body
    const body = await request.json();
    const { transcripts } = body;

    if (
      !transcripts ||
      !Array.isArray(transcripts) ||
      transcripts.length === 0
    ) {
      return NextResponse.json(
        { error: "No transcriptions provided" },
        { status: 400 }
      );
    }

    // Combine all transcriptions into a single text
    const allText = transcripts.join(" ");

    if (!allText || allText.trim().length === 0) {
      return NextResponse.json(
        { error: "No transcriptions available to summarize" },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Prepare the prompt for summarization
    const prompt = `Please provide a comprehensive summary of the following transcriptions. The transcriptions are from a voice assistant conversation. Summarize the key points, topics discussed, and any important information mentioned.

Transcriptions:
${allText}

Please provide a clear and concise summary:`;

    // Call OpenAI API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a cost-effective model, can be changed
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes conversation transcriptions. Provide clear, concise summaries that capture the main points and important information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate summary", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: "Invalid response from OpenAI API" },
        { status: 500 }
      );
    }

    const summary = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      summary,
      transcriptionCount: transcripts.length,
      totalCharacters: allText.length,
    });
  } catch (error) {
    console.error("Error summarizing transcriptions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
