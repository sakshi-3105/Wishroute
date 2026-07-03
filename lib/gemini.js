// lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateItinerary({ destination, budget, startDate, endDate, preferences }) {
  // ✅ Debug log here
  console.log("🔍 Generating with:", {
    destination,
    budget,
    startDate,
    endDate,
    preferences,
    apiKeyPresent: !!process.env.GEMINI_API_KEY // Also log if key is missing
  });

  const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });

  const prompt = `
Create a day-wise travel itinerary for:
- Destination: ${destination}
- Budget: ₹${budget}
- Dates: ${startDate} to ${endDate}
- Preferences: ${preferences.join(', ')}

Include suggestions for places to visit, things to do, meals, and local tips.
Make it exciting but stay within the budget.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
