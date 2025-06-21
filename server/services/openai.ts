import OpenAI from "openai";

// Using gpt-4o-mini as requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ExtractedTask {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  estimatedHours?: number;
  suggestedDeadline?: string;
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image. Focus on handwritten notes, typed text, whiteboard content, or sticky notes. Return only the extracted text without any analysis or formatting."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error("Failed to extract text from image: " + (error as Error).message);
  }
}

export async function structureTasksFromText(extractedText: string): Promise<ExtractedTask[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a task organization expert. Analyze the provided text and extract actionable tasks. 
          
          For each task, determine:
          - A clear, concise title (max 50 characters)
          - Optional description if more context is needed
          - Priority level (low/medium/high) based on urgency and importance
          - Estimated hours to complete (realistic estimate)
          - Suggested deadline as a human-readable string (e.g., "tomorrow", "this week", "next Monday")
          
          Only extract items that are clearly actionable tasks. Ignore dates, signatures, non-actionable notes.
          
          Respond with a JSON object containing an array of tasks.`
        },
        {
          role: "user",
          content: `Extract and structure tasks from this text:\n\n${extractedText}`
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.tasks || !Array.isArray(result.tasks)) {
      return [];
    }

    return result.tasks.map((task: any) => ({
      title: task.title || "Untitled Task",
      description: task.description || undefined,
      priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
      estimatedHours: typeof task.estimatedHours === "number" ? task.estimatedHours : undefined,
      suggestedDeadline: task.suggestedDeadline || undefined,
    }));
  } catch (error) {
    throw new Error("Failed to structure tasks from text: " + (error as Error).message);
  }
}

export async function transcribeAudioToText(audioBuffer: Buffer): Promise<string> {
  try {
    // Convert audio buffer to base64
    const base64Audio = audioBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // the newest OpenAI model is "gpt-4o-mini" which was released for transcription. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert audio transcription assistant. Transcribe the provided audio content accurately, maintaining natural speech patterns and punctuation. Return only the transcribed text without any additional commentary."
        },
        {
          role: "user",
          content: `Please transcribe this audio recording accurately. The audio is in webm format encoded as base64: ${base64Audio}`
        }
      ],
      max_tokens: 1000
    });

    const transcribedText = response.choices[0].message.content?.trim();
    
    if (!transcribedText) {
      throw new Error("No transcription received from the model");
    }
    
    return transcribedText;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio: " + (error as Error).message);
  }
}

export async function processAudioToTasks(audioBuffer: Buffer): Promise<ExtractedTask[]> {
  const transcribedText = await transcribeAudioToText(audioBuffer);
  if (!transcribedText.trim()) {
    throw new Error("No text could be transcribed from the audio");
  }
  
  const tasks = await structureTasksFromText(transcribedText);
  return tasks;
}

export async function processImageToTasks(base64Image: string): Promise<ExtractedTask[]> {
  const extractedText = await extractTextFromImage(base64Image);
  if (!extractedText.trim()) {
    throw new Error("No text could be extracted from the image");
  }
  
  const tasks = await structureTasksFromText(extractedText);
  return tasks;
}
