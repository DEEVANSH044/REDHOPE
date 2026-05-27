const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding starting dashboard data...");

  // 1. Seed BloodInventory starting stocks
  const initialStocks = [
    { bloodGroup: "A+", stock: 45, total: 100 },
    { bloodGroup: "A-", stock: 12, total: 50 },
    { bloodGroup: "B+", stock: 67, total: 100 },
    { bloodGroup: "B-", stock: 8, total: 50 },
    { bloodGroup: "AB+", stock: 23, total: 50 },
    { bloodGroup: "AB-", stock: 5, total: 30 },
    { bloodGroup: "O+", stock: 89, total: 120 },
    { bloodGroup: "O-", stock: 15, total: 60 },
  ];

  for (const item of initialStocks) {
    await prisma.bloodInventory.upsert({
      where: { bloodGroup: item.bloodGroup },
      update: { stock: item.stock, total: item.total },
      create: { bloodGroup: item.bloodGroup, stock: item.stock, total: item.total },
    });
  }
  console.log("Seeded blood inventory successfully.");

  // 2. Ensure we have at least one normal User to associate requests with
  const defaultUser = await prisma.user.upsert({
    where: { email: "patient@raktasetu.org" },
    update: {},
    create: {
      name: "Default Patient",
      email: "patient@raktasetu.org",
      password: "dummy_password", // Just dummy
      role: "user",
    },
  });

  // 3. Seed starting Blood Requests
  const initialRequests = [
    {
      bloodGroup: "O-",
      quantity: 3,
      urgency: "Critical",
      note: "Urgent heart surgery requirement",
      status: "Pending",
      locationName: "City General Hospital, Mumbai",
      userId: defaultUser.id,
    },
    {
      bloodGroup: "B+",
      quantity: 2,
      urgency: "Urgent",
      note: "Accident recovery emergency",
      status: "Pending",
      locationName: "Apollo Hospital, Delhi",
      userId: defaultUser.id,
    },
    {
      bloodGroup: "A+",
      quantity: 1,
      urgency: "Normal",
      note: "Routine dialysis reserve",
      status: "Pending",
      locationName: "Max Healthcare, Pune",
      userId: defaultUser.id,
    },
  ];

  for (const req of initialRequests) {
    const existing = await prisma.bloodRequest.findFirst({
      where: {
        bloodGroup: req.bloodGroup,
        locationName: req.locationName,
        status: "Pending",
      },
    });

    if (!existing) {
      await prisma.bloodRequest.create({ data: req });
    }
  }
  console.log("Seeded pending requests successfully.");

  // 4. Seed starting Activities
  const initialActivities = [
    { type: "DONATION", title: "Blood Donation Completed", desc: "Rahul Sharma donated 450ml of A+ blood" },
    { type: "EMERGENCY", title: "Urgent Request Received", desc: "City Hospital needs 3 units of O- blood" },
    { type: "REGISTRATION", title: "New Donor Registered", desc: "Priya Patel joined as a B+ donor" },
    { type: "FULFILLMENT", title: "Request Fulfilled", desc: "2 units of AB+ sent to Metro Hospital" },
  ];

  const currentActivityCount = await prisma.activity.count();
  if (currentActivityCount === 0) {
    for (const act of initialActivities) {
      await prisma.activity.create({ data: act });
    }
    console.log("Seeded starting activities.");
  }

  // 5. Seed starting Notifications
  const initialNotifications = [
    { type: "EMERGENCY", title: "Emergency O- Request", desc: "City General Hospital needs 3 units of O- blood immediately." },
    { type: "REGISTRATION", title: "New Donor: Priya Patel", desc: "Priya Patel registered as a new B+ blood donor in Delhi." },
    { type: "LOW_STOCK", title: "Critical Stock Warning", desc: "Blood group AB- stock level is critical (5/30 units)." },
  ];

  const currentNotificationCount = await prisma.notification.count();
  if (currentNotificationCount === 0) {
    for (const notif of initialNotifications) {
      await prisma.notification.create({ data: notif });
    }
    console.log("Seeded starting notifications.");
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
