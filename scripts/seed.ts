import { db } from "../src/lib/db";
import { ensureSeedData, ensureSuperAdmin } from "../src/lib/auth/seed";
import { hashPassword } from "../src/lib/auth/password";
import { ROLES } from "../src/lib/permissions";

async function main() {
  console.log("🌱 Seeding Creativo database...");

  await ensureSeedData();
  console.log("✓ Plans and Roles seeded");

  await ensureSuperAdmin();
  console.log("✓ Super admin ready (admin@creativo.app / Admin@2024)");

  // Demo users
  const demoUsers = [
    { email: "creator@creativo.app", name: "Alex Creator", role: ROLES.PRO, plan: "PRO", password: "Demo@2024", bio: "Digital illustrator & brand designer based in Lisbon." },
    { email: "student@creativo.app", name: "Jamie Student", role: ROLES.STUDENT, plan: "STUDENT", password: "Demo@2024", bio: "Graphic design student exploring creative tools." },
    { email: "free@creativo.app", name: "Sam Free", role: ROLES.FREE_USER, plan: "FREE", password: "Demo@2024", bio: "Hobbyist designer getting started." },
    { email: "mod@creativo.app", name: "Morgan Mod", role: ROLES.MODERATOR, plan: "PRO", password: "Demo@2024", bio: "Community moderator." },
  ];

  for (const d of demoUsers) {
    const existing = await db.user.findUnique({ where: { email: d.email } });
    if (existing) continue;
    const hashed = await hashPassword(d.password);
    const baseUsername = d.email.split("@")[0];
    await db.user.create({
      data: {
        email: d.email,
        name: d.name,
        password: hashed,
        emailVerified: new Date(),
        status: "active",
        lastLoginAt: new Date(Date.now() - Math.random() * 86400000 * 5),
        profile: {
          create: {
            fullName: d.name,
            username: baseUsername,
            bio: d.bio,
            role: d.role,
            plan: d.plan,
            storageLimitMb: d.plan === "PRO" ? 50000 : d.plan === "STUDENT" ? 5000 : 500,
            storageUsedMb: Math.random() * 200,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        },
        subscriptions: { create: { plan: d.plan, status: "active" } },
      },
    });
    console.log(`✓ Demo user: ${d.email}`);
  }

  // Random users for admin dashboard
  const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas", "Mia", "Leon", "Amelia", "Henry", "Harper", "Jack", "Evelyn", "Owen", "Abigail", "Wyatt"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor"];
  const roles = [ROLES.FREE_USER, ROLES.FREE_USER, ROLES.FREE_USER, ROLES.STUDENT, ROLES.PRO];
  const plans = ["FREE", "FREE", "FREE", "STUDENT", "PRO"];

  for (let i = 0; i < 28; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    if (await db.user.findUnique({ where: { email } })) continue;
    const role = roles[i % roles.length];
    const plan = plans[i % plans.length];
    const hashed = await hashPassword("Demo@2024");
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 60);
    await db.user.create({
      data: {
        email,
        name: `${fn} ${ln}`,
        password: hashed,
        emailVerified: new Date(),
        status: "active",
        createdAt,
        lastLoginAt: new Date(Date.now() - Math.random() * 86400000 * 14),
        profile: {
          create: {
            fullName: `${fn} ${ln}`,
            username: `${fn.toLowerCase()}${i}`,
            role,
            plan,
            storageLimitMb: plan === "PRO" ? 50000 : plan === "STUDENT" ? 5000 : 500,
            storageUsedMb: Math.random() * (plan === "PRO" ? 8000 : 400),
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        },
        subscriptions: { create: { plan, status: "active", startedAt: createdAt } },
      },
    });
  }
  console.log("✓ Additional demo users created");

  // Templates
  const templateData = [
    { name: "Instagram Post", category: "design", isPremium: false },
    { name: "YouTube Thumbnail", category: "design", isPremium: false },
    { name: "Business Card", category: "design", isPremium: true },
    { name: "Logo Concept", category: "design", isPremium: true },
    { name: "Character Sketch", category: "illustration", isPremium: false },
    { name: "Botanical Illustration", category: "illustration", isPremium: true },
    { name: "Portrait Retouch", category: "photo", isPremium: true },
    { name: "Cinematic Color Grade", category: "photo", isPremium: true },
    { name: "Intro Animation", category: "video", isPremium: true },
    { name: "Logo Reveal", category: "animation", isPremium: true },
    { name: "Presentation Slide", category: "design", isPremium: false },
    { name: "Poster Modern", category: "design", isPremium: false },
  ];
  for (const t of templateData) {
    const existing = await db.template.findFirst({ where: { name: t.name } });
    if (existing) continue;
    await db.template.create({
      data: {
        name: t.name,
        description: `${t.name} template for creative projects.`,
        category: t.category,
        tags: JSON.stringify([t.category, "template"]),
        isPremium: t.isPremium,
        isActive: true,
        usageCount: Math.floor(Math.random() * 500),
      },
    });
  }
  console.log("✓ Templates seeded");

  // Projects for the creator demo user
  const creator = await db.user.findUnique({ where: { email: "creator@creativo.app" } });
  if (creator) {
    const projectNames = ["Brand Identity — Aurora", "Social Media Pack — Q4", "Event Poster Series", "Product Launch Banner", "Newsletter Header", "Podcast Cover Art"];
    const types = ["design", "illustration", "photo", "video", "animation", "design"];
    for (let i = 0; i < projectNames.length; i++) {
      const existing = await db.project.findFirst({ where: { userId: creator.id, name: projectNames[i] } });
      if (existing) continue;
      await db.project.create({
        data: {
          userId: creator.id,
          name: projectNames[i],
          type: types[i],
          status: i < 4 ? "active" : "archived",
          isFavorite: i < 2,
          sizeBytes: Math.random() * 5_000_000,
          lastOpenedAt: new Date(Date.now() - i * 86400000),
          updatedAt: new Date(Date.now() - i * 3600000),
        },
      });
    }
    console.log("✓ Demo projects created");

    const folderNames = ["Brand Work", "Client Projects", "Personal", "Archived"];
    for (let i = 0; i < folderNames.length; i++) {
      const existing = await db.folder.findFirst({ where: { userId: creator.id, name: folderNames[i] } });
      if (existing) continue;
      await db.folder.create({ data: { userId: creator.id, name: folderNames[i], sortOrder: i } });
    }

    const notifs = [
      { type: "system", title: "New feature: Version History 🕑", message: "Version History is now available on Pro plans. Never lose your work again." },
      { type: "subscription", title: "Pro plan active", message: "Your Pro subscription is active. Enjoy 50 GB storage." },
      { type: "security", title: "New login detected", message: "A new login to your account was detected." },
      { type: "system", title: "Weekly summary ready", message: "Your weekly creative summary is ready to view." },
    ];
    for (const n of notifs) {
      await db.notification.create({
        data: { userId: creator.id, type: n.type, title: n.title, message: n.message, isRead: Math.random() > 0.5 },
      });
    }
  }

  // Announcements
  const announcementData = [
    { title: "Welcome to Creativo!", summary: "Get started with your creative journey.", content: "Welcome aboard! Creativo is your all-in-one creative studio. Explore our templates, create your first project, and start designing without limits.", type: "info", isPublished: true, isPinned: true },
    { title: "New: Version History is here", summary: "Never lose your work again.", content: "We're thrilled to introduce Version History, available now on Pro and Team plans. Roll back to any previous version of your project, compare changes, and never lose your creative progress.", type: "release", isPublished: true },
    { title: "Scheduled maintenance", summary: "Brief downtime this Sunday 2-4 AM UTC.", content: "We'll be performing scheduled maintenance to improve performance. The platform may be briefly unavailable.", type: "maintenance", isPublished: true },
  ];
  const adminUser = await db.user.findUnique({ where: { email: "admin@creativo.app" } });
  for (const a of announcementData) {
    const existing = await db.announcement.findFirst({ where: { title: a.title } });
    if (existing) continue;
    await db.announcement.create({ data: { ...a, authorId: adminUser?.id, publishedAt: new Date() } });
  }
  console.log("✓ Announcements seeded");

  // Support tickets
  const freeUser = await db.user.findUnique({ where: { email: "free@creativo.app" } });
  if (freeUser) {
    const ticketData = [
      { subject: "How do I upgrade my plan?", category: "billing", priority: "low", status: "open" },
      { subject: "Cannot upload large file", category: "technical", priority: "medium", status: "pending" },
    ];
    for (let i = 0; i < ticketData.length; i++) {
      const t = ticketData[i];
      const ticketNo = `TKT-${1000 + i}`;
      const existing = await db.supportTicket.findUnique({ where: { ticketNo } });
      if (existing) continue;
      const ticket = await db.supportTicket.create({
        data: { ticketNo, userId: freeUser.id, subject: t.subject, description: `${t.subject} — please assist.`, category: t.category, priority: t.priority, status: t.status },
      });
      await db.ticketReply.create({ data: { ticketId: ticket.id, userId: freeUser.id, message: "Hello team, I need help with the above.", isStaff: false } });
    }
  }
  console.log("✓ Support tickets seeded");

  console.log("\n🎉 Seed complete!");
  console.log("Login credentials:");
  console.log("  Super Admin : admin@creativo.app / Admin@2024");
  console.log("  Pro User    : creator@creativo.app / Demo@2024");
  console.log("  Student     : student@creativo.app / Demo@2024");
  console.log("  Free User   : free@creativo.app / Demo@2024");
  console.log("  Moderator   : mod@creativo.app / Demo@2024");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
