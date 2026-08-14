import { NextResponse } from "next/server";
import { sendWhatsappOtp } from "@/lib/whatsapp-otp";
import {
  isValidIndianNumber,
  normalizeIndianNumber,
  toMsg91Mobile,
} from "@/lib/phone";
import { consumeRateLimit } from "@/lib/rate-limit";

const COOLDOWN_MS = 30_000;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;

const globalWithOtp = globalThis as typeof globalThis & {
  otpSendHistory?: Map<string, number[]>;
};

function historyStore() {
  const history = globalWithOtp.otpSendHistory ?? new Map<string, number[]>();
  globalWithOtp.otpSendHistory = history;
  return history;
}

function pruneHistory(now: number) {
  const history = historyStore();
  for (const [key, sends] of history) {
    const recent = sends.filter((sentAt) => now - sentAt < RATE_LIMIT_WINDOW_MS);
    if (recent.length) history.set(key, recent);
    else history.delete(key);
  }
  return history;
}

function remainingLimit(key: string): number {
  const now = Date.now();
  const history = pruneHistory(now);
  const sends = (history.get(key) ?? []).filter((sentAt) => now - sentAt < RATE_LIMIT_WINDOW_MS);
  history.set(key, sends);
  const lastSent = sends.at(-1);
  if (lastSent && now - lastSent < COOLDOWN_MS) return COOLDOWN_MS - (now - lastSent);
  return sends.length >= MAX_SENDS_PER_WINDOW ? RATE_LIMIT_WINDOW_MS - (now - sends[0]) : 0;
}

function recordSend(...keys: string[]) {
  const now = Date.now();
  const history = pruneHistory(now);
  for (const key of keys) {
    const sends = (history.get(key) ?? []).filter((sentAt) => now - sentAt < RATE_LIMIT_WINDOW_MS);
    history.set(key, [...sends, now]);
  }
}

export async function POST(req: Request) {
  let whatsappNumber: unknown;
  try {
    const body = await req.json();
    whatsappNumber = body?.whatsappNumber;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (typeof whatsappNumber !== "string" || !isValidIndianNumber(whatsappNumber)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number" },
      { status: 400 }
    );
  }

  const normalized = normalizeIndianNumber(whatsappNumber);
  const development = process.env.NODE_ENV !== "production";
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const remaining = development ? Math.max(remainingLimit(`phone:${normalized}`), remainingLimit(`ip:${clientIp}`)) : 0;
  if (remaining > 0) {
    return NextResponse.json(
      { error: `Too many codes requested. Please wait ${Math.ceil(remaining / 1000)}s before trying again.` },
      { status: 429 }
    );
  }
  const sharedAllowed = await Promise.all([
    consumeRateLimit(`otp-cooldown-phone:${normalized}`, 1, COOLDOWN_MS),
    consumeRateLimit(`otp-phone:${normalized}`, MAX_SENDS_PER_WINDOW, RATE_LIMIT_WINDOW_MS),
    consumeRateLimit(`otp-ip:${clientIp}`, 10, RATE_LIMIT_WINDOW_MS),
  ]);
  if (sharedAllowed.some((allowed) => !allowed)) {
    return NextResponse.json({ error: "Too many codes requested. Please try again later." }, { status: 429 });
  }

  try {
    await sendWhatsappOtp(toMsg91Mobile(normalized));
    if (development) recordSend(`phone:${normalized}`, `ip:${clientIp}`);
    return NextResponse.json({ ok: true, resendIn: COOLDOWN_MS / 1000 });
  } catch {
    return NextResponse.json(
      { error: "Could not send the code. Please try again in a moment." },
      { status: 500 }
    );
  }
}
