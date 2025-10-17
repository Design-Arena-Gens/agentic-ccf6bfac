import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(_request: Request): Promise<NextResponse> {
  const { blobs } = await list();
  return NextResponse.json(blobs);
}
