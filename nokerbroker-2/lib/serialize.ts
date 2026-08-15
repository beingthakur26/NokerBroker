import type { PropertyView } from "@/lib/properties";
export type { PropertyView };

type OwnerRef =
  | { _id?: unknown; name?: string; email?: string; whatsappNumber?: string; whatsappVerified?: boolean }
  | string
  | null;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ownerParts(owner: OwnerRef) {
  if (!isObject(owner)) return { ownerId: String(owner ?? ""), name: "", email: "", whatsapp: "", verified: false };
  return {
    ownerId: owner._id != null ? String(owner._id) : "",
    name: typeof owner.name === "string" ? owner.name : "",
    email: typeof owner.email === "string" ? owner.email : "",
    whatsapp: typeof owner.whatsappNumber === "string" ? owner.whatsappNumber : "",
    verified: owner.whatsappVerified === true,
  };
}

interface PropertyDocRecord {
  _id: unknown;
  slug: string;
  title: string;
  locality: string;
  pinCode: string;
  zone?: string;
  type: string;
  price: number;
  areaSqft: number;
  bhk?: number;
  floor?: string;
  furnishing?: string;
  ownershipDocUrl?: string;
  description?: string;
  amenities?: string[];
  viewCount?: number;
  status: string;
  images?: string[];
  location?: { latitude?: number; longitude?: number };
  geo?: { type?: string; coordinates?: number[] };
  duplicateReview?: { flagged?: boolean; reason?: string };
  ownerId: OwnerRef;
}

export function toPropertyView(doc: PropertyDocRecord): PropertyView {
  const owner = ownerParts(doc.ownerId);
  const docUrl = doc.ownershipDocUrl ?? "";
  return {
    _id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    locality: doc.locality,
    pinCode: doc.pinCode,
    zone: doc.zone,
    type: doc.type,
    priceValue: doc.price,
    areaSqft: doc.areaSqft,
    bhk: doc.bhk ?? 0,
    floor: doc.floor ?? "",
    furnishing: doc.furnishing ?? "UNFURNISHED",
    verified: owner.verified && Boolean(docUrl) && docUrl !== "placeholder",
    images: doc.images ?? [],
    description: doc.description ?? "",
    amenities: doc.amenities ?? [],
    viewCount: doc.viewCount ?? 0,
    status: doc.status,
    ownerId: owner.ownerId,
    ownerName: owner.name,
    ownerWhatsapp: owner.whatsapp,
    latitude: doc.geo?.coordinates?.[1] ?? doc.location?.latitude,
    longitude: doc.geo?.coordinates?.[0] ?? doc.location?.longitude,
    duplicateReview: doc.duplicateReview ? { flagged: doc.duplicateReview.flagged === true, reason: doc.duplicateReview.reason } : undefined,
  };
}

export interface ProjectView {
  _id: string;
  name: string;
  slug: string;
  locality: string;
  pinCode: string;
  zone?: string;
  description: string;
  constructionStatus: string;
  progressPct: number;
  possessionDate?: string;
  reraNumber?: string;
  amenities: string[];
  images: string[];
  status: string;
  builderId: string;
  builderName: string;
  builderWhatsapp: string;
  units: {
    _id?: string;
    unitType: string;
    priceFrom: number;
    priceTo?: number;
    areaSqft: number;
    floorPlanUrl?: string;
  }[];
  updates: {
    _id?: string;
    month: string;
    imageUrls: string[];
    note?: string;
  }[];
}

interface ProjectDocRecord {
  _id: unknown;
  name: string;
  slug: string;
  locality: string;
  pinCode: string;
  zone?: string;
  description?: string;
  constructionStatus: string;
  progressPct?: number;
  possessionDate?: Date;
  reraNumber?: string;
  amenities?: string[];
  images?: string[];
  status: string;
  builderId: OwnerRef;
  units?: {
    _id?: unknown;
    unitType: string;
    priceFrom: number;
    priceTo?: number;
    areaSqft: number;
    floorPlanUrl?: string;
  }[];
  updates?: {
    _id?: unknown;
    month: Date;
    imageUrls?: string[];
    note?: string;
  }[];
}

export function toProjectView(doc: ProjectDocRecord): ProjectView {
  const builder = ownerParts(doc.builderId);
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    locality: doc.locality,
    pinCode: doc.pinCode,
    zone: doc.zone,
    description: doc.description ?? "",
    constructionStatus: doc.constructionStatus,
    progressPct: doc.progressPct ?? 0,
    possessionDate: doc.possessionDate ? new Date(doc.possessionDate).toISOString().slice(0, 10) : undefined,
    reraNumber: doc.reraNumber,
    amenities: doc.amenities ?? [],
    images: doc.images ?? [],
    status: doc.status,
    builderId: builder.ownerId,
    builderName: builder.name,
    builderWhatsapp: builder.whatsapp,
    units: (doc.units ?? []).map((unit) => ({
      _id: unit._id != null ? String(unit._id) : undefined,
      unitType: unit.unitType,
      priceFrom: unit.priceFrom,
      priceTo: unit.priceTo,
      areaSqft: unit.areaSqft,
      floorPlanUrl: unit.floorPlanUrl,
    })),
    updates: (doc.updates ?? []).map((update) => ({
      _id: update._id != null ? String(update._id) : undefined,
      month: new Date(update.month).toISOString(),
      imageUrls: update.imageUrls ?? [],
      note: update.note,
    })),
  };
}

export interface InquiryView {
  _id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderWhatsapp: string;
  propertyId?: string;
  propertyTitle?: string;
  propertySlug?: string;
  projectId?: string;
  projectName?: string;
  projectSlug?: string;
  message: string;
  contactMode: string;
  status: string;
  createdAt: string;
}

interface InquiryDocRecord {
  _id: unknown;
  senderId: OwnerRef;
  propertyId?: unknown;
  projectId?: unknown;
  message: string;
  contactMode: string;
  status: string;
  createdAt?: Date;
  property?: { title?: string; slug?: string } | null;
  project?: { name?: string; slug?: string } | null;
}

export function toInquiryView(doc: InquiryDocRecord): InquiryView {
  const sender = ownerParts(doc.senderId);
  return {
    _id: String(doc._id),
    senderId: sender.ownerId,
    senderName: sender.name,
    senderEmail: sender.email,
    senderWhatsapp: sender.whatsapp,
    propertyId: doc.propertyId != null ? String(doc.propertyId) : undefined,
    propertyTitle: isObject(doc.property) && typeof doc.property.title === "string" ? doc.property.title : undefined,
    propertySlug: isObject(doc.property) && typeof doc.property.slug === "string" ? doc.property.slug : undefined,
    projectId: doc.projectId != null ? String(doc.projectId) : undefined,
    projectName: isObject(doc.project) && typeof doc.project.name === "string" ? doc.project.name : undefined,
    projectSlug: isObject(doc.project) && typeof doc.project.slug === "string" ? doc.project.slug : undefined,
    message: doc.message,
    contactMode: doc.contactMode,
    status: doc.status,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export interface UserView {
  _id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  whatsappVerified: boolean;
  emailVerified: boolean;
  city?: string;
  locality?: string;
  role: string;
  createdAt: string;
}

interface UserDocRecord {
  _id: unknown;
  name: string;
  email: string;
  whatsappNumber: string;
  whatsappVerified?: boolean;
  emailVerified?: boolean;
  city?: string;
  locality?: string;
  role?: string;
  createdAt?: Date;
}

export function toUserView(doc: UserDocRecord): UserView {
  return {
    _id: String(doc._id),
    name: doc.name,
    email: doc.email,
    whatsappNumber: doc.whatsappNumber,
    whatsappVerified: doc.whatsappVerified === true,
    emailVerified: doc.emailVerified === true,
    city: doc.city,
    locality: doc.locality,
    role: doc.role ?? "USER",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function serializeDoc<T>(doc: T): T {
  if (!doc) return doc;
  return JSON.parse(JSON.stringify(doc));
}

export function serializeDocs<T>(docs: T[]): T[] {
  if (!docs) return [];
  return JSON.parse(JSON.stringify(docs));
}
