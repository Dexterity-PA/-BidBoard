import { NextRequest, NextResponse } from 'next/server'

type Match = { name: string; amount: string; ev: number }

const BUCKETS: Record<'low' | 'mid' | 'high' | 'elite', Match[]> = {
  low: [
    { name: 'Dollars for Scholars Local Chapter', amount: '$2,500', ev: 320 },
    { name: 'Community Service Achievement Award', amount: '$1,500', ev: 260 },
    { name: 'Hispanic Heritage Foundation', amount: '$3,500', ev: 310 },
  ],
  mid: [
    { name: 'Coca-Cola Scholars Program', amount: '$20,000', ev: 720 },
    { name: 'Horatio Alger State Scholarship', amount: '$6,000', ev: 680 },
    { name: 'Burger King Scholars', amount: '$5,000', ev: 540 },
  ],
  high: [
    { name: 'Jack Kent Cooke Foundation', amount: '$30,000', ev: 940 },
    { name: 'Elks National Foundation MVS', amount: '$12,500', ev: 820 },
    { name: 'Ron Brown Scholar Program', amount: '$40,000', ev: 780 },
  ],
  elite: [
    { name: 'Gates Millennium Scholars', amount: '$40,000', ev: 1200 },
    { name: 'Rhodes Scholarship (undergrad track)', amount: '$55,000', ev: 1060 },
    { name: 'National Merit Finalist Award', amount: '$2,500+', ev: 980 },
  ],
}

function bucketFor(gpa: number): 'low' | 'mid' | 'high' | 'elite' {
  if (gpa >= 3.8) return 'elite'
  if (gpa >= 3.5) return 'high'
  if (gpa >= 3.0) return 'mid'
  return 'low'
}

const RATE_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT = 10
const hits = new Map<string, number[]>()

function ipFromRequest(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]!.trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr)
    return false
  }
  arr.push(now)
  hits.set(ip, arr)
  return true
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const gpaRaw = (body as { gpa?: unknown })?.gpa
  const gpa = Number(gpaRaw)
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
    return NextResponse.json({ error: 'gpa must be a number between 0 and 4' }, { status: 400 })
  }

  const ip = ipFromRequest(req)
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in an hour.' },
      { status: 429 },
    )
  }

  const matches = BUCKETS[bucketFor(gpa)]
  return NextResponse.json({ matches })
}
