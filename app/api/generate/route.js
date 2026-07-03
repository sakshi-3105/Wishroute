// app/api/generate/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/gemini';

export async function POST(req) {
  const body = await req.json();

  const { destination, budget, startDate, endDate, preferences } = body;

  try {
    const itinerary = await generateItinerary({
      destination,
      budget,
      startDate,
      endDate,
      preferences,
    });

    return NextResponse.json({ success: true, itinerary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to generate itinerary' });
  }
}
