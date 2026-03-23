import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn("Gemini API Key is missing or default. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

/**
 * Generate a performance narrative based on quant and qual scores.
 */
export async function generateAINarrative(member, scores) {
  try {
    const ai = getClient();
    const prompt = `You are an HR performance analyst writing a short, professional performance summary narrative for an employee.
    
Employee: ${member.name}
Role: ${member.role}
Quantitative Score: ${scores.quant}/100 
Qualitative Score: ${scores.qual}/100

Write a 3-4 sentence summary of their performance. If their quantitative score is higher, emphasize their output and velocity. If their qualitative score is higher, emphasize their collaboration and teamwork. Be encouraging but objective.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "Error generating AI narrative. Please check your API key and connection.";
  }
}

/**
 * Generate a 3-point strategic roadmap based on scores.
 */
export async function generateStrategicRoadmap(member, scores) {
  try {
    const ai = getClient();
    const prompt = `You are a manager creating a strategic growth roadmap for your report.
    
Employee: ${member.name}
Role: ${member.role}
Quantitative Score: ${scores.quant}/100 
Qualitative Score: ${scores.qual}/100

Provide exactly 3 bullet points with actionable advice for their next milestone. Focus on improving the lower of the two scores, or pushing them to the next level if both are high. Keep each point under 15 words. Format as a plain text list using asterisks (*).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return "* Error generating roadmap\n* Check API Key\n* Check connection";
  }
}

/**
 * TTS Audio function using browser's Web Speech API as fallback or you can use Gemini if enabled.
 * For now, using Web Speech API as standard easy solution for TTS in React.
 */
export function playAudioBriefing(text) {
  if (!('speechSynthesis' in window)) {
    alert("Sorry, your browser doesn't support text to speech!");
    return;
  }
  
  // Stop any currently playing audio
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Pick an english voice if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en-'));
  if (enVoice) {
    utterance.voice = enVoice;
  }
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function stopAudioBriefing() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
