import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import LoanApplication from "@/models/LoanApplication";
import { createNotification } from "@/lib/notifications";

const STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "").toUpperCase();
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid loan status" }, { status: 422 });
  const { id } = await params;
  await dbConnect();
  const loan = await LoanApplication.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!loan) return NextResponse.json({ error: "Loan application not found" }, { status: 404 });
  await createNotification(String(loan.userId), "LOAN_STATUS", `Your loan application is now ${status.replaceAll("_", " ").toLowerCase()}.`);
  return NextResponse.json({ loan });
}
