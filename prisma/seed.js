import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear any dummy seeded users if they still have the literal unhashed passwords
  await prisma.user.deleteMany({
    where: {
      email: { in: ["admin@redhope.com", "test@redhope.com"] },
      password: { in: ["hashed_admin_password", "hashed_test_password"] }
    }
  });

  const userCount = await prisma.user.count();

  if (userCount === 0) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const testPassword = await bcrypt.hash("password123", 10);

    await prisma.user.createMany({
      data: [
        {
          name: "Admin",
          email: "admin@redhope.com",
          password: adminPassword,
        },
        {
          name: "Test User",
          email: "test@redhope.com",
          password: testPassword,
        },
      ],
    });

    console.log("Seed data inserted successfully");
  } else {
    console.log("User seed data already exists, skipping");
  }

  // Seed campaigns
  const campaignCount = await prisma.campaign.count();
  if (campaignCount === 0) {
    await prisma.campaign.createMany({
      data: [
        {
          title: "World Blood Donor Day Drive",
          date: "2026-06-14",
          location: "City Hospital, Mumbai",
          organizer: "Red Cross Society",
        },
        {
          title: "Community Blood Donation Camp",
          date: "2026-03-20",
          location: "Town Hall, Delhi",
          organizer: "redhope Foundation",
        },
        {
          title: "Corporate Blood Drive",
          date: "2026-04-10",
          location: "Tech Park, Bangalore",
          organizer: "HealthFirst NGO",
        },
        {
          title: "University Blood Donation Week",
          date: "2026-05-05",
          location: "State University Campus, Pune",
          organizer: "NSS Chapter",
        },
      ],
    });
    console.log("Campaign seed data inserted");
  }

  // Seed blood banks
  const bloodBankCount = await prisma.bloodBank.count();
  if (bloodBankCount === 0) {
    await prisma.bloodBank.createMany({
      data: [
        {
          name: "Central Blood Bank",
          location: "MG Road, Mumbai",
          contact: "+91-22-1234-5678",
          availableGroups: "A+, A-, B+, B-, O+, O-, AB+, AB-",
        },
        {
          name: "City Hospital Blood Centre",
          location: "Ring Road, Delhi",
          contact: "+91-11-9876-5432",
          availableGroups: "A+, B+, O+, AB+",
        },
        {
          name: "LifeLine Blood Bank",
          location: "Koramangala, Bangalore",
          contact: "+91-80-5555-1234",
          availableGroups: "A+, A-, B+, O+, O-",
        },
        {
          name: "RedDrop Foundation",
          location: "Baner, Pune",
          contact: "+91-20-4444-7890",
          availableGroups: "B+, B-, O+, AB+, AB-",
        },
        {
          name: "Government Blood Storage",
          location: "Civil Lines, Jaipur",
          contact: "+91-141-2222-3333",
          availableGroups: "A+, B+, O+, O-",
        },
      ],
    });
    console.log("Blood bank seed data inserted");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
