import { NextResponse } from 'next/server'

// MVP newsletter capture: log to server, hold in memory for local testing.
// Replace with a real provider (Resend audience, etc.) when ready.
const subscribers = new Set<string>()

function isEmail(x: unknown): x is string {
  return (
    typeof x === 'string' &&
    x.length < 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)
  )
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body as { email?: unknown })?.email
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid email' },
      { status: 400 },
    )
  }

  subscribers.add(email.toLowerCase())
  console.log('[newsletter] subscribed:', email)

  return NextResponse.json({ ok: true })
}
