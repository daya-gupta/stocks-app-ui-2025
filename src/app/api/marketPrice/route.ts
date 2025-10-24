// tbd - what is this file for?

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isin = searchParams.get('isin');

  // Replace this with actual market data API integration
  const mockPrice = Math.random() * 1000 + 100;
  const mockChange = (Math.random() - 0.5) * 20;
  const mockChangePercent = (mockChange / mockPrice) * 100;

  return NextResponse.json({
    price: mockPrice,
    change: mockChange,
    changePercent: mockChangePercent,
  });
}
