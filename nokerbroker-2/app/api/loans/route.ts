// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import LoanApplication from "@/models/LoanApplication";
import { createNotification } from "@/lib/notifications";
import { encryptSensitive } from "@/lib/sensitive-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const applications = await LoanApplication.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const loanAmount = Number(body?.loanAmount);
  const tenureYears = Number(body?.tenureYears);
  const interestRate = body?.interestRate == null ? 8.5 : Number(body.interestRate);
  const monthlyIncome = Number(body?.monthlyIncome);
  const existingLoans = body?.existingLoans == null ? 0 : Number(body.existingLoans);
  const employmentType = String(body?.employmentType ?? "").toUpperCase();
  const panNumber = String(body?.panNumber ?? "").trim().toUpperCase();
  const propertyId = typeof body?.propertyId === "string" ? body.propertyId : undefined;
  const documents = Array.isArray(body?.documents) ? body.documents.filter((url: unknown): url is string => typeof url === "string" && /^https:\/\//.test(url)).slice(0, 10) : [];

  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || !Number.isInteger(tenureYears) || tenureYears < 1 || tenureYears > 30 || !Number.isFinite(interestRate) || interestRate < 1 || interestRate > 30 || !Number.isFinite(monthlyIncome) || monthlyIncome <= 0 || !Number.isFinite(existingLoans) || existingLoans < 0 || !["SALARIED", "SELF_EMPLOYED", "OTHER"].includes(employmentType) || !/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber)) {
    return NextResponse.json({ error: "Enter valid loan, income, employment, and PAN details" }, { status: 422 });
  }

  await dbConnect();
  let encryptedPan: string;
  try {
    encryptedPan = encryptSensitive(panNumber);
  } catch (error) {
    console.error("[loans] PII encryption configuration error", error);
    return NextResponse.json({ error: "Loan applications are temporarily unavailable" }, { status: 503 });
  }

  const loan = await LoanApplication.create({
    userId: session.user.id,
    propertyId,
    loanAmount,
    tenureYears,
    interestRate,
    monthlyIncome,
    employmentType,
    existingLoans,
    panNumber: encryptedPan,
    documents: documents || [],
    status: "SUBMITTED",
  });

  await createNotification(session.user.id, "LOAN_STATUS", "Your loan application has been submitted for review.");

  return NextResponse.json({ ok: true, loan });
}
