import { requireAdmin } from "@/lib/admin";
import { getAllInquiriesAdmin } from "@/lib/inquiries-db";
import { AdminInquiryRow } from "@/components/admin-inquiry-row";

export const metadata = {
  title: "Inquiries · Admin",
};

export default async function AdminInquiriesPage() {
  await requireAdmin();
  const inquiries = await getAllInquiriesAdmin();
  const open = inquiries.filter((inquiry) => inquiry.status === "OPEN").length;
  const responded = inquiries.filter((inquiry) => inquiry.status === "RESPONDED").length;
  const closed = inquiries.filter((inquiry) => inquiry.status === "CLOSED").length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Inquiries
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {inquiries.length} total · {open} open · {responded} responded · {closed} closed
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="empty-state">
          <h2>No inquiries yet</h2>
          <p>Enquiries sent through the site appear here with the enquirer&apos;s contact details.</p>
        </div>
      ) : (
        <div className="inq-list">
          {inquiries.map((inquiry) => (
            <AdminInquiryRow
              key={inquiry._id}
              id={inquiry._id}
              senderName={inquiry.senderName}
              senderEmail={inquiry.senderEmail}
              senderWhatsapp={inquiry.senderWhatsapp}
              propertyTitle={inquiry.propertyTitle}
              propertySlug={inquiry.propertySlug}
              projectName={inquiry.projectName}
              projectSlug={inquiry.projectSlug}
              message={inquiry.message}
              contactMode={inquiry.contactMode}
              status={inquiry.status}
              createdAt={inquiry.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
