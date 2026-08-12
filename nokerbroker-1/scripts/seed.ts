// scripts/seed.ts

// import dns from "node:dns";
// dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import dbConnect from "../lib/mongodb";
import User from "../models/User";
import Property from "../models/Property";
import Project from "../models/Project";
import Inquiry from "../models/Inquiry";
import Favorite from "../models/Favorite";

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMAGES = {
  living: unsplash("photo-1512917774080-9991f1c4c750"),
  house: unsplash("photo-1568605114967-8130f3a36994"),
  modern: unsplash("photo-1600585154340-be6161a56a0c"),
  loft: unsplash("photo-1522708323590-d24dbb6b0267"),
  warm: unsplash("photo-1600607687939-ce8a6c25118c"),
  bright: unsplash("photo-1600566753086-00f18fb6b3ea"),
  living2: unsplash("photo-1600210492486-724fe5c67fb0"),
  living3: unsplash("photo-1600047509807-ba8f99d2cdde"),
  bedroom: unsplash("photo-1600607687920-4e2a09cf159d"),
  exterior: unsplash("photo-1600585154526-990dced4db0d"),
  kitchen: unsplash("photo-1600573472592-401b489a3cdc"),
  kitchen2: unsplash("photo-1600566752355-35792bedcfea"),
  kitchen3: unsplash("photo-1600607687644-c7171b42498f"),
  modern2: unsplash("photo-1600585153490-76fb20a32601"),
  kitchen4: unsplash("photo-1600047509358-9dc75507daeb"),
  kitchen5: unsplash("photo-1556912173-3bb406ef7e77"),
  interior: unsplash("photo-1560185007-cde436f6a4d0"),
  bedroom2: unsplash("photo-1560185127-6ed189bf02f4"),
  villa: unsplash("photo-1570129477492-45c003edd2be"),
  tower: unsplash("photo-1545324418-cc1a3fa10c00"),
};

interface OwnerSeed {
  name: string;
  phone: string;
  email: string;
  locality: string;
}

const OWNERS: OwnerSeed[] = [
  { name: "Rohan Kulkarni", phone: "919999999999", email: "rohan.kulkarni@nokerbroker.com", locality: "Chembur" },
  { name: "Sneha Iyer", phone: "919999999998", email: "sneha.iyer@nokerbroker.com", locality: "Malad West" },
  { name: "Arjun Mehta", phone: "919999999997", email: "arjun.mehta@nokerbroker.com", locality: "Bandra West" },
  { name: "Kavita Shah", phone: "919999999996", email: "kavita.shah@nokerbroker.com", locality: "Powai" },
  { name: "Prakash Nair", phone: "919999999995", email: "prakash.nair@nokerbroker.com", locality: "Thane West" },
  { name: "Divya Rao", phone: "919999999994", email: "divya.rao@nokerbroker.com", locality: "Andheri West" },
  { name: "Nikhil Joshi", phone: "919999999993", email: "nikhil.joshi@nokerbroker.com", locality: "Goregaon East" },
  { name: "Farah Khan", phone: "919999999992", email: "farah.khan@nokerbroker.com", locality: "Vikhroli" },
  { name: "Ishaan Malhotra", phone: "919999999991", email: "ishaan.malhotra@nokerbroker.com", locality: "Bandra West" },
  { name: "Meera Pillai", phone: "919999999990", email: "meera.pillai@nokerbroker.com", locality: "Chembur" },
  { name: "Vikram Desai", phone: "919999999989", email: "vikram.desai@nokerbroker.com", locality: "Malad West" },
  { name: "Anita Kapoor", phone: "919999999988", email: "anita.kapoor@nokerbroker.com", locality: "Powai" },
];

interface PropertySeed {
  owner: number;
  title: string;
  slug: string;
  locality: string;
  pinCode: string;
  zone: string;
  type: string;
  price: number;
  areaSqft: number;
  bhk: number;
  floor: string;
  furnishing: string;
  description: string;
  images: string[];
}

const PROPERTIES: PropertySeed[] = [
  {
    owner: 0,
    title: "2 BHK apartment",
    slug: "chembur-2-bhk-115-cr",
    locality: "Chembur",
    pinCode: "400071",
    zone: "Central Suburbs",
    type: "FLAT",
    price: 11500000,
    areaSqft: 820,
    bhk: 2,
    floor: "4th floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "Sunny 2 BHK in a gated Chembur society with direct owner contact and ownership documents on file. Walking distance to the station and a 10-acre garden.",
    images: [IMAGES.living, IMAGES.kitchen, IMAGES.bedroom],
  },
  {
    owner: 1,
    title: "1 BHK apartment",
    slug: "malad-west-1-bhk-62-l",
    locality: "Malad West",
    pinCode: "400064",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 6200000,
    areaSqft: 510,
    bhk: 1,
    floor: "2nd floor",
    furnishing: "UNFURNISHED",
    description:
      "Compact 1 BHK in Malad West near Infinity Mall. Owner-verified number, ready for immediate possession, zero brokerage.",
    images: [IMAGES.house, IMAGES.living3, IMAGES.kitchen5],
  },
  {
    owner: 2,
    title: "3 BHK apartment",
    slug: "bandra-west-3-bhk-235-cr",
    locality: "Bandra West",
    pinCode: "400050",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 23500000,
    areaSqft: 1240,
    bhk: 3,
    floor: "9th floor",
    furnishing: "FULLY_FURNISHED",
    description:
      "Fully furnished 3 BHK sea-view apartment in Bandra West. Listed directly by the owner with verified ownership paperwork.",
    images: [IMAGES.modern, IMAGES.bright, IMAGES.kitchen2],
  },
  {
    owner: 3,
    title: "2 BHK apartment",
    slug: "powai-2-bhk-140-cr",
    locality: "Powai",
    pinCode: "400076",
    zone: "Central Suburbs",
    type: "FLAT",
    price: 14000000,
    areaSqft: 900,
    bhk: 2,
    floor: "7th floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "Verified 2 BHK overlooking the Powai lake. Direct owner communication, parking included, ready to move in.",
    images: [IMAGES.loft, IMAGES.interior, IMAGES.kitchen4],
  },
  {
    owner: 4,
    title: "1 BHK apartment",
    slug: "thane-west-1-bhk-85-l",
    locality: "Thane West",
    pinCode: "400601",
    zone: "Thane",
    type: "FLAT",
    price: 8500000,
    areaSqft: 620,
    bhk: 1,
    floor: "5th floor",
    furnishing: "FULLY_FURNISHED",
    description:
      "Furnished 1 BHK in Thane West near Ghodbunder Road. Owner selling directly — no brokerage on the deal.",
    images: [IMAGES.warm, IMAGES.kitchen3],
  },
  {
    owner: 5,
    title: "1 RK studio",
    slug: "andheri-west-1-rk-48-l",
    locality: "Andheri West",
    pinCode: "400053",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 4800000,
    areaSqft: 380,
    bhk: 1,
    floor: "3rd floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "Perfect starter studio near Andheri station. Owner-verified WhatsApp number, minimal maintenance, ideal for singles.",
    images: [IMAGES.living2, IMAGES.bedroom2],
  },
  {
    owner: 6,
    title: "2 BHK apartment",
    slug: "goregaon-east-2-bhk-120-cr",
    locality: "Goregaon East",
    pinCode: "400063",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 12000000,
    areaSqft: 850,
    bhk: 2,
    floor: "6th floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "2 BHK with a balcony facing the Aarey forest line. Direct owner contact, verified documents, ready possession.",
    images: [IMAGES.bright, IMAGES.kitchen],
  },
  {
    owner: 7,
    title: "1 BHK apartment",
    slug: "vikhroli-1-bhk-55-l",
    locality: "Vikhroli",
    pinCode: "400079",
    zone: "Central Suburbs",
    type: "FLAT",
    price: 5500000,
    areaSqft: 460,
    bhk: 1,
    floor: "8th floor",
    furnishing: "UNFURNISHED",
    description:
      "Affordable 1 BHK in Vikhroli with metro connectivity. Owner selling directly, zero brokerage, quick deal possible.",
    images: [IMAGES.living3, IMAGES.kitchen5],
  },
  {
    owner: 8,
    title: "1 BHK apartment",
    slug: "bandra-west-1-bhk-110-cr",
    locality: "Bandra West",
    pinCode: "400050",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 11000000,
    areaSqft: 550,
    bhk: 1,
    floor: "5th floor",
    furnishing: "FULLY_FURNISHED",
    description:
      "Rare 1 BHK in Bandra West near Linking Road, fully furnished and ready. Verified owner, no broker fee.",
    images: [IMAGES.interior, IMAGES.bedroom],
  },
  {
    owner: 9,
    title: "3 BHK apartment",
    slug: "chembur-3-bhk-185-cr",
    locality: "Chembur",
    pinCode: "400071",
    zone: "Central Suburbs",
    type: "FLAT",
    price: 18500000,
    areaSqft: 1350,
    bhk: 3,
    floor: "11th floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "Spacious 3 BHK high-rise flat in Chembur with city views. Direct owner, verified ownership docs, parking included.",
    images: [IMAGES.warm, IMAGES.bright, IMAGES.kitchen2],
  },
  {
    owner: 10,
    title: "2 BHK apartment",
    slug: "malad-west-2-bhk-98-l",
    locality: "Malad West",
    pinCode: "400064",
    zone: "Western Suburbs",
    type: "FLAT",
    price: 9800000,
    areaSqft: 780,
    bhk: 2,
    floor: "12th floor",
    furnishing: "SEMI_FURNISHED",
    description:
      "Corner 2 BHK in Malad West with cross ventilation. Owner listed directly — message them on WhatsApp, skip the broker.",
    images: [IMAGES.loft, IMAGES.kitchen4],
  },
  {
    owner: 11,
    title: "3 BHK apartment",
    slug: "powai-3-bhk-280-cr",
    locality: "Powai",
    pinCode: "400076",
    zone: "Central Suburbs",
    type: "FLAT",
    price: 28000000,
    areaSqft: 1750,
    bhk: 3,
    floor: "15th floor",
    furnishing: "FULLY_FURNISHED",
    description:
      "Premium lake-facing 3 BHK in a 5-star clubhouse society. Fully furnished, verified ownership, direct owner deal.",
    images: [IMAGES.modern, IMAGES.living2, IMAGES.kitchen3],
  },
  {
    owner: 0,
    title: "3 BHK independent house",
    slug: "versova-house-3-bhk-320-cr",
    locality: "Versova, Andheri West",
    pinCode: "400061",
    zone: "Western Suburbs",
    type: "HOUSE",
    price: 32000000,
    areaSqft: 2400,
    bhk: 4,
    floor: "Ground + 1",
    furnishing: "SEMI_FURNISHED",
    description:
      "Rare independent 3 BHK (4-bed layout) house in Versova with private terrace and two car parks. Direct owner, verified title docs.",
    images: [IMAGES.villa, IMAGES.exterior, IMAGES.living],
  },
  {
    owner: 6,
    title: "Residential plot",
    slug: "bhandup-plot-1200-sqft-38-l",
    locality: "Bhandup",
    pinCode: "400078",
    zone: "Central Suburbs",
    type: "PLOT",
    price: 3800000,
    areaSqft: 1200,
    bhk: 0,
    floor: "",
    furnishing: "UNFURNISHED",
    description:
      "1200 sqft NA residential plot in Bhandup, clear title, corner plot with road access. Owner selling directly.",
    images: [IMAGES.tower],
  },
];

interface ProjectSeed {
  builder: number;
  name: string;
  slug: string;
  locality: string;
  pinCode: string;
  zone: string;
  constructionStatus: string;
  progressPct: number;
  possessionDate: string;
  reraNumber: string;
  description: string;
  images: string[];
  units: { unitType: string; priceFrom: number; priceTo: number; areaSqft: number }[];
}

const PROJECTS: ProjectSeed[] = [
  {
    builder: 0,
    name: "Orchid Residency",
    slug: "orchid-residency",
    locality: "Powai",
    pinCode: "400076",
    zone: "Central Suburbs",
    constructionStatus: "UNDER_CONSTRUCTION",
    progressPct: 45,
    possessionDate: "2027-12-31",
    reraNumber: "P51700045612",
    description:
      "Garden township in Powai with a clubhouse, jogging track and landscaped courts. Two towers, 340 homes.",
    images: [IMAGES.tower, IMAGES.exterior],
    units: [
      { unitType: "2 BHK", priceFrom: 13000000, priceTo: 14500000, areaSqft: 950 },
      { unitType: "3 BHK", priceFrom: 17500000, priceTo: 21000000, areaSqft: 1350 },
    ],
  },
  {
    builder: 2,
    name: "Skyline Meridian",
    slug: "skyline-meridian",
    locality: "Thane West",
    pinCode: "400601",
    zone: "Thane",
    constructionStatus: "UNDER_CONSTRUCTION",
    progressPct: 60,
    possessionDate: "2027-12-31",
    reraNumber: "P51700047890",
    description:
      "High-rise towers on Ghodbunder Road with 1 and 2 BHK units, smart-home ready, near the future metro line.",
    images: [IMAGES.modern2, IMAGES.bright],
    units: [
      { unitType: "1 BHK", priceFrom: 7800000, priceTo: 8400000, areaSqft: 560 },
      { unitType: "2 BHK", priceFrom: 11000000, priceTo: 12500000, areaSqft: 860 },
    ],
  },
  {
    builder: 2,
    name: "Marine Crest Towers",
    slug: "marine-crest-towers",
    locality: "Chembur",
    pinCode: "400071",
    zone: "Central Suburbs",
    constructionStatus: "PRE_LAUNCH",
    progressPct: 5,
    possessionDate: "2029-03-31",
    reraNumber: "P51700051203",
    description:
      "Premium waterfront-inspired towers in Chembur. Pre-launch pricing with 2, 3 and 4 BHK options.",
    images: [IMAGES.tower, IMAGES.modern],
    units: [
      { unitType: "2 BHK", priceFrom: 19000000, priceTo: 21000000, areaSqft: 1100 },
      { unitType: "3 BHK", priceFrom: 26000000, priceTo: 29000000, areaSqft: 1500 },
      { unitType: "4 BHK", priceFrom: 36000000, priceTo: 40000000, areaSqft: 2100 },
    ],
  },
  {
    builder: 6,
    name: "Palm Court Residences",
    slug: "palm-court-residences",
    locality: "Goregaon East",
    pinCode: "400063",
    zone: "Western Suburbs",
    constructionStatus: "UNDER_CONSTRUCTION",
    progressPct: 35,
    possessionDate: "2026-08-31",
    reraNumber: "P51700053410",
    description:
      "Mid-rise residences near the Aarey forest line with 1 and 2 BHK units, clubhouse and rooftop garden.",
    images: [IMAGES.house, IMAGES.interior],
    units: [
      { unitType: "1 BHK", priceFrom: 9500000, priceTo: 10200000, areaSqft: 580 },
      { unitType: "2 BHK", priceFrom: 13500000, priceTo: 14800000, areaSqft: 900 },
    ],
  },
  {
    builder: 7,
    name: "Sunrise Enclave",
    slug: "sunrise-enclave",
    locality: "Vikhroli",
    pinCode: "400079",
    zone: "Central Suburbs",
    constructionStatus: "READY_TO_MOVE",
    progressPct: 100,
    possessionDate: "2026-01-31",
    reraNumber: "P51700055177",
    description:
      "Ready-to-move 2 BHK homes in Vikhroli with metro connectivity. Possession available immediately.",
    images: [IMAGES.loft, IMAGES.warm],
    units: [
      { unitType: "2 BHK", priceFrom: 10500000, priceTo: 11500000, areaSqft: 820 },
    ],
  },
];

async function seed() {
  await dbConnect();

  await Promise.all([
    Property.deleteMany({}),
    Project.deleteMany({}),
    Inquiry.deleteMany({}),
    Favorite.deleteMany({}),
    User.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await User.create({
    name: "NokerBroker Admin",
    email: "admin@nokerbroker.com",
    whatsappNumber: "+919000000001",
    whatsappVerified: true,
    emailVerified: true,
    passwordHash,
    role: "ADMIN",
    city: "Mumbai",
    locality: "BKC",
  });

  const owners = await User.insertMany(
    OWNERS.map((owner) => ({
      name: owner.name,
      email: owner.email,
      whatsappNumber: `+${owner.phone}`,
      whatsappVerified: true,
      emailVerified: true,
      role: "USER",
      city: "Mumbai",
      locality: owner.locality,
    }))
  );

  const buyers = await User.insertMany([
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      whatsappNumber: "+919876543210",
      whatsappVerified: true,
      emailVerified: true,
      role: "USER",
      city: "Mumbai",
      locality: "Andheri West",
    },
    {
      name: "Aditya Verma",
      email: "aditya.verma@example.com",
      whatsappNumber: "+919876543211",
      whatsappVerified: true,
      emailVerified: true,
      role: "USER",
      city: "Mumbai",
      locality: "Bhandup",
    },
  ]);

  const propertyDocs = await Property.insertMany(
    PROPERTIES.map((property) => ({
      ...property,
      ownerId: owners[property.owner]._id,
      ownershipDocUrl: `https://ik.imagekit.io/oimgl4aqp/docs/${property.slug}.pdf`,
      amenities: ["Lift", "Parking", "Security", "Power backup"],
      viewCount: Math.floor(Math.random() * 90) + 10,
      status: "ACTIVE",
    }))
  );

  const projectDocs = await Project.insertMany(
    PROJECTS.map((project) => ({
      ...project,
      builderId: owners[project.builder]._id,
      possessionDate: new Date(project.possessionDate),
      amenities: ["Clubhouse", "Gym", "Swimming pool", "Jogging track"],
      status: "LIVE",
    }))
  );

  const bySlug = (slug: string) => propertyDocs.find((property) => property.slug === slug);

  await Inquiry.insertMany([
    {
      senderId: buyers[0]._id,
      propertyId: bySlug("chembur-2-bhk-115-cr")?._id,
      message: "Hi, is this still available? I'd love to visit this weekend.",
      contactMode: "WHATSAPP",
      status: "OPEN",
    },
    {
      senderId: buyers[0]._id,
      propertyId: bySlug("powai-3-bhk-280-cr")?._id,
      message: "Can you share the monthly maintenance charges?",
      contactMode: "BOTH",
      status: "OPEN",
    },
    {
      senderId: buyers[1]._id,
      propertyId: bySlug("bandra-west-3-bhk-235-cr")?._id,
      message: "Is the sea-view floor still available? Could you share more photos?",
      contactMode: "WHATSAPP",
      status: "RESPONDED",
    },
    {
      senderId: buyers[1]._id,
      projectId: projectDocs.find((project) => project.slug === "orchid-residency")?._id,
      message: "Please share the floor plans and site-visit schedule for the 2 BHK.",
      contactMode: "CALL",
      status: "OPEN",
    },
  ]);

  console.log("✅ Database seeded successfully.");
  console.log(`Admin: admin@nokerbroker.com / Admin@123`);
  console.log(`Owners: ${owners.length}, Buyers: ${buyers.length}`);
  console.log(`Properties: ${propertyDocs.length}, Projects: ${projectDocs.length}, Inquiries: 4`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
