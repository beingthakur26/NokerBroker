// scripts/seed.ts

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";

import dbConnect from "../lib/mongodb";
import User from "../models/User";
import Property from "../models/Property";

async function seed() {
  await dbConnect();

  // Clear existing seed data
  await Property.deleteMany({});
  await User.deleteMany({});

  // Create demo owner
  const owner = await User.create({
    name: "Demo Owner",
    email: "owner@nokerbroker.com",
    whatsappNumber: "+919999999999",
    whatsappVerified: true,
    emailVerified: true,
    city: "Mumbai",
    locality: "Chembur",
  });

  // Create properties
  await Property.insertMany([
    {
      title: "2 BHK Apartment",
      slug: "2bhk-chembur-1",
      locality: "Chembur",
      pinCode: "400071",
      type: "FLAT",
      price: 11500000,
      areaSqft: 820,
      bhk: 2,
      furnishing: "SEMI_FURNISHED",
      ownershipDocUrl: "placeholder",
      images: [],
      ownerId: owner._id,
    },

    {
      title: "3 BHK Premium Apartment",
      slug: "3bhk-chembur-1",
      locality: "Chembur",
      pinCode: "400071",
      type: "FLAT",
      price: 16500000,
      areaSqft: 1250,
      bhk: 3,
      furnishing: "FULLY_FURNISHED",
      ownershipDocUrl: "placeholder",
      images: [],
      ownerId: owner._id,
    },

    {
      title: "1 BHK Apartment",
      slug: "1bhk-chembur-1",
      locality: "Chembur",
      pinCode: "400071",
      type: "FLAT",
      price: 7800000,
      areaSqft: 560,
      bhk: 1,
      furnishing: "SEMI_FURNISHED",
      ownershipDocUrl: "placeholder",
      images: [],
      ownerId: owner._id,
    },
  ]);

  console.log("✅ Database seeded successfully.");
  console.log(`Created user: ${owner.email}`);
  console.log("Created 3 properties.");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});