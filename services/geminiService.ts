'use server';

import { GoogleGenAI, Type } from "@google/genai";
import { Doctor } from '../types';

// The API key is safely accessed on the server side
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const getDoctorRecommendations = async (symptoms: string, doctors: Doctor[]) => {
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return {
      analysis: "Configuration Error",
      recommendedSpecialty: "General Practice",
      recommendedDoctorIds: [],
      message: "System configuration error: API Key is missing. Please add API_KEY to your .env.local file and restart the server."
    };
  }

  try {
    const doctorContext = doctors.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      bio: d.bio
    }));

    const prompt = `
      User Symptoms: "${symptoms}"
      
      Available Doctors:
      ${JSON.stringify(doctorContext)}
      
      Task:
      1. Analyze the symptoms.
      2. Determine the most appropriate medical specialty.
      3. Recommend up to 3 doctors from the provided list who are best suited to treat these symptoms.
      4. Provide a brief, reassuring explanation for the recommendation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Brief analysis of symptoms" },
            recommendedSpecialty: { type: Type.STRING },
            recommendedDoctorIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of the recommended doctors"
            },
            message: { type: Type.STRING, description: "A friendly message to the user explaining why these doctors were chosen." }
          },
          required: ["recommendedDoctorIds", "message", "analysis"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text from Gemini");

  } catch (error: any) {
    console.error("Error getting AI recommendations:", error);
    return {
      analysis: "Unable to analyze at this moment.",
      recommendedSpecialty: "General Practice",
      recommendedDoctorIds: [],
      message: `Error connecting to AI service: ${error.message || 'Unknown error'}. Please check your API key and network connection.`
    };
  }
};