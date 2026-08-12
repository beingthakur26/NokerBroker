// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import LoanApplication from "@/models/LoanApplication";

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

  const { loanAmount, tenureYears, interestRate, monthlyIncome, employmentType, panNumber, propertyId, documents } = await req.json();

  if (!loanAmount || !tenureYears || !monthlyIncome || !panNumber) {
    return NextResponse.json({ error: "Missing required fields for loan application" }, { status: 400 });
  }

  await dbConnect();
  const loan = await LoanApplication.create({
    userId: session.user.id,
    propertyId,
    loanAmount: Number(loanAmount),
    tenureYears: Number(tenureYears),
    interestRate: interestRate ? Number(interestRate) : 8.5,
    monthlyIncome: Number(monthlyIncome),
    employmentType: employmentType || "Salaried",
    panNumber,
    documents: documents || [],
    status: "SUBMITTED",
  });

  return NextResponse.json({ ok: true, loan });
}
