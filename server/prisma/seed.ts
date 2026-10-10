import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashSecret(str: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(str, salt);
}

async function main() {
  console.log('🌱 Starting CampusShield database seeding...');

  // 1. Clear previous data if needed
  await prisma.auditEvent.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.reporterFollowUp.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.reporterUpdate.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.case.deleteMany();
  await prisma.staffUser.deleteMany();

  // 2. Create Staff Users
  const adminPassword = await hashSecret('AdminPass123!');
  const officerPassword = await hashSecret('OfficerPass123!');

  const admin = await prisma.staffUser.create({
    data: {
      email: 'admin@campusshield.edu',
      passwordHash: adminPassword,
      name: 'Director Jordan Vance',
      role: 'SYSTEM_ADMIN',
      department: 'Office of Information Security & Student Affairs',
    },
  });

  const officerSarah = await prisma.staffUser.create({
    data: {
      email: 'officer.sarah@campusshield.edu',
      passwordHash: officerPassword,
      name: 'Officer Sarah Chen',
      role: 'SAFETY_OFFICER',
      department: 'Campus Safety & Cyber Incident Response',
    },
  });

  const officerMarcus = await prisma.staffUser.create({
    data: {
      email: 'officer.marcus@campusshield.edu',
      passwordHash: officerPassword,
      name: 'Officer Marcus Rodriguez',
      role: 'SAFETY_OFFICER',
      department: 'Campus Safety & Student Conduct',
    },
  });

  console.log('✅ Created Staff accounts:');
  console.log('   Admin: admin@campusshield.edu / AdminPass123!');
  console.log('   Officer: officer.sarah@campusshield.edu / OfficerPass123!');
  console.log('   Officer: officer.marcus@campusshield.edu / OfficerPass123!');

  // 3. Create Sample Cases with realistic histories
  const demoSecret1 = 'cs_sec_demo1234567890abcdef12345678';
  const demoSecret1Hash = await hashSecret(demoSecret1);

  const demoSecret2 = 'cs_sec_freshman987654321fedcba98765';
  const demoSecret2Hash = await hashSecret(demoSecret2);

  const demoSecret3 = 'cs_sec_threat8888888888888888888888';
  const demoSecret3Hash = await hashSecret(demoSecret3);

  // Case 1: Fake Profile
  const case1 = await prisma.case.create({
    data: {
      id: 'CS-2026-F9K2A1',
      trackingSecretHash: demoSecret1Hash,
      category: 'FAKE_PROFILE',
      platform: 'Instagram',
      description: 'An Instagram account (@fake_jordan_union) is using my profile photos and bio to post offensive comments in campus club group chats pretending to be me.',
      incidentDate: '2026-03-28',
      profileUrl: 'https://instagram.com/fake_jordan_union',
      isImmediateDanger: false,
      reportingMode: 'ANONYMOUS',
      status: 'ACTION_IN_PROGRESS',
      priority: 'HIGH',
      assignedOfficerId: officerSarah.id,
      privacyNoticeAck: true,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        caseId: case1.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        reason: 'Initial anonymous report submitted',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        caseId: case1.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        changedById: officerSarah.id,
        reason: 'Officer Sarah Chen opened investigation and verified Instagram URL',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        caseId: case1.id,
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'ACTION_IN_PROGRESS',
        changedById: officerSarah.id,
        reason: 'Takedown notice submitted to Meta Trust & Safety portal',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  await prisma.reporterUpdate.createMany({
    data: [
      {
        caseId: case1.id,
        message: 'Your report has been assigned to Officer Sarah Chen. Case review initiated.',
        createdById: officerSarah.id,
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        caseId: case1.id,
        message: 'Campus Safety has submitted an official impersonation escalation ticket to Meta Trust & Safety with evidence hashes.',
        createdById: officerSarah.id,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  await prisma.internalNote.createMany({
    data: [
      {
        caseId: case1.id,
        content: 'Cross-checked IP logs with campus Wi-Fi network team. The spoofed account appears to have been registered from an off-campus VPN IP.',
        createdById: officerSarah.id,
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        caseId: case1.id,
        content: 'Meta case ID #MTA-90422 filed. Awaiting platform takedown confirmation within 48h.',
        createdById: officerSarah.id,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  // Case 2: Threat / Urgent Case
  const case2 = await prisma.case.create({
    data: {
      id: 'CS-2026-C7P3W2',
      trackingSecretHash: demoSecret3Hash,
      category: 'THREATS',
      platform: 'Discord',
      description: 'Threatening direct messages received from a burner handle on the engineering departmental Discord claiming they know my dorm schedule and warning me not to attend finals.',
      incidentDate: '2026-04-01',
      profileUrl: 'https://discord.com/users/9823482348',
      isImmediateDanger: true,
      reportingMode: 'ANONYMOUS',
      status: 'REFERRED_TO_AUTHORITY',
      priority: 'CRITICAL',
      assignedOfficerId: officerMarcus.id,
      privacyNoticeAck: true,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        caseId: case2.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        reason: 'Immediate safety concern flagged by reporter',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        caseId: case2.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'REFERRED_TO_AUTHORITY',
        changedById: officerMarcus.id,
        reason: 'Escalated to University Police & Residence Life Coordinator due to threat level',
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
    ],
  });

  await prisma.reporterUpdate.create({
    data: {
      caseId: case2.id,
      message: 'Critical alert reviewed. Dorm security patrol has been notified for increased escort presence. Case escalated to University Police.',
      createdById: officerMarcus.id,
    },
  });

  await prisma.internalNote.create({
    data: {
      caseId: case2.id,
      content: 'Officer Marcus met with Campus Police Sergeant Davies. Discord subpoena packet prepared for IP header preservation.',
      createdById: officerMarcus.id,
    },
  });

  // Case 3: Additional Info Requested
  const case3 = await prisma.case.create({
    data: {
      id: 'CS-2026-X1L8Q4',
      trackingSecretHash: demoSecret2Hash,
      category: 'IMPERSONATION',
      platform: 'TikTok',
      description: 'Someone made a TikTok account posting videos with my face taken from my LinkedIn profile.',
      incidentDate: '2026-04-02',
      profileUrl: '',
      isImmediateDanger: false,
      reportingMode: 'ANONYMOUS',
      status: 'ADDITIONAL_INFO_REQUESTED',
      priority: 'HIGH',
      assignedOfficerId: officerSarah.id,
      privacyNoticeAck: true,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        caseId: case3.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        reason: 'Case submitted',
        createdAt: new Date(Date.now() - 48 * 3600000),
      },
      {
        caseId: case3.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'ADDITIONAL_INFO_REQUESTED',
        changedById: officerSarah.id,
        reason: 'Need profile handle and link to submit platform takedown',
        createdAt: new Date(Date.now() - 24 * 3600000),
      },
    ],
  });

  await prisma.reporterUpdate.create({
    data: {
      caseId: case3.id,
      message: 'Please provide the exact TikTok username handle (@...) or video link using the follow-up box below so our team can execute the takedown notice.',
      requiresInput: true,
      createdById: officerSarah.id,
    },
  });

  // Case 4: Resolved Case
  const case4 = await prisma.case.create({
    data: {
      id: 'CS-2026-R5Y9Z3',
      trackingSecretHash: await hashSecret('cs_sec_resolved123456789012345678'),
      category: 'CYBERBULLYING',
      platform: 'Snapchat',
      description: 'Defamatory group story thread targeting student org committee members with manipulated images.',
      incidentDate: '2026-03-20',
      isImmediateDanger: false,
      reportingMode: 'IDENTIFIED',
      reporterName: 'Anonymous Student Witness',
      status: 'RESOLVED',
      priority: 'LOW',
      assignedOfficerId: officerMarcus.id,
      resolutionDetails: 'Snapchat safety operations removed the story group. Student Conduct mediated with the group creators and disciplinary sanctions were issued.',
      closedAt: new Date(),
      privacyNoticeAck: true,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        caseId: case4.id,
        oldStatus: 'NONE',
        newStatus: 'SUBMITTED',
        reason: 'Case submitted',
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        caseId: case4.id,
        oldStatus: 'ACTION_IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedById: officerMarcus.id,
        reason: 'Story removed and student conduct completed hearing',
        createdAt: new Date(),
      },
    ],
  });

  // Global Audit Events
  await prisma.auditEvent.createMany({
    data: [
      {
        action: 'SYSTEM_INITIALIZED',
        details: 'CampusShield production-grade security gateway and database schema initialized',
        ipAddress: '127.0.0.1',
      },
      {
        action: 'STAFF_LOGIN',
        details: 'Director Jordan Vance logged into Administrative Console',
        staffUserId: admin.id,
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('🎉 Seeding successfully completed!');
  console.log('📌 Sample Tracking Credentials for testing "Track My Case":');
  console.log('   Case ID: CS-2026-F9K2A1');
  console.log(`   Tracking Secret: ${demoSecret1}`);
  console.log('----------------------------------------------------');
  console.log('   Case ID (Action Needed): CS-2026-X1L8Q4');
  console.log(`   Tracking Secret: ${demoSecret2}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
