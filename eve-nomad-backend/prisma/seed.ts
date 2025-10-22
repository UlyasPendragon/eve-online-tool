import { PrismaClient } from '@prisma/client';
import { encryptToken } from '../src/services/token.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.notificationLog.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.job.deleteMany();
    await prisma.cachedData.deleteMany();
    await prisma.session.deleteMany();
    await prisma.character.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create test users
  console.log('👤 Creating test users...');

  const testUser1 = await prisma.user.create({
    data: {
      email: 'pilot1@example.com',
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
    },
  });

  const testUser2 = await prisma.user.create({
    data: {
      email: 'pilot2@example.com',
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log(`✅ Created users: ${testUser1.id}, ${testUser2.id}`);

  // Create test characters with encrypted tokens
  console.log('🎭 Creating test characters...');

  // Mock tokens (these are example tokens, not real EVE SSO tokens)
  const mockAccessToken = 'mock_access_token_for_development_testing_only';
  const mockRefreshToken = 'mock_refresh_token_for_development_testing_only';

  const character1 = await prisma.character.create({
    data: {
      characterId: 90000001,
      characterName: 'Test Pilot Alpha',
      corporationId: 1000001,
      allianceId: 99000001,
      userId: testUser1.id,
      accessToken: encryptToken(mockAccessToken),
      refreshToken: encryptToken(mockRefreshToken),
      tokenExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
      scopes: [
        'esi-skills.read_skills.v1',
        'esi-mail.read_mail.v1',
        'esi-characters.read_notifications.v1',
        'esi-markets.read_character_orders.v1',
      ],
      lastSyncAt: new Date(),
    },
  });

  const character2 = await prisma.character.create({
    data: {
      characterId: 90000002,
      characterName: 'Test Pilot Beta',
      corporationId: 1000002,
      allianceId: null,
      userId: testUser1.id,
      accessToken: encryptToken(mockAccessToken),
      refreshToken: encryptToken(mockRefreshToken),
      tokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      scopes: ['esi-skills.read_skills.v1', 'esi-mail.read_mail.v1'],
    },
  });

  const character3 = await prisma.character.create({
    data: {
      characterId: 90000003,
      characterName: 'Test Pilot Gamma',
      corporationId: 1000003,
      allianceId: 99000002,
      userId: testUser2.id,
      accessToken: encryptToken(mockAccessToken),
      refreshToken: encryptToken(mockRefreshToken),
      tokenExpiresAt: new Date(Date.now() + 18 * 60 * 1000), // 18 minutes from now
      scopes: [
        'esi-skills.read_skills.v1',
        'esi-mail.read_mail.v1',
        'esi-markets.read_character_orders.v1',
        'esi-industry.read_character_jobs.v1',
      ],
    },
  });

  console.log(
    `✅ Created characters: ${character1.characterName}, ${character2.characterName}, ${character3.characterName}`,
  );

  // Create user settings
  console.log('⚙️  Creating user settings...');

  await prisma.userSettings.create({
    data: {
      userId: testUser1.id,
      theme: 'dark',
      defaultCharacterId: character1.characterId,
      language: 'en',
      notifySkillComplete: true,
      notifyMarketOrders: true,
      notifyIndustryJobs: true,
      notifyPIExtractors: false,
      notifyEveMail: true,
      shareActivityStats: false,
    },
  });

  await prisma.userSettings.create({
    data: {
      userId: testUser2.id,
      theme: 'auto',
      defaultCharacterId: character3.characterId,
      language: 'en',
      notifySkillComplete: true,
      notifyMarketOrders: true,
      notifyIndustryJobs: true,
      notifyPIExtractors: true,
      notifyEveMail: true,
      shareActivityStats: true,
    },
  });

  console.log('✅ Created user settings');

  // Create test sessions
  console.log('🔐 Creating test sessions...');

  await prisma.session.create({
    data: {
      userId: testUser1.id,
      token: encryptToken('mock_jwt_token_user1_session1'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      deviceType: 'ios',
      deviceToken: 'mock_fcm_token_ios_device_1',
    },
  });

  await prisma.session.create({
    data: {
      userId: testUser2.id,
      token: encryptToken('mock_jwt_token_user2_session1'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      deviceType: 'android',
      deviceToken: 'mock_fcm_token_android_device_1',
    },
  });

  console.log('✅ Created sessions');

  // Create test jobs
  console.log('📋 Creating test jobs...');

  await prisma.job.create({
    data: {
      jobType: 'token-refresh',
      characterId: character1.id,
      status: 'completed',
      priority: 10,
      payload: { characterId: character1.characterId },
      result: { success: true, newTokenExpiresAt: new Date() },
      startedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      completedAt: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
    },
  });

  await prisma.job.create({
    data: {
      jobType: 'sync-skills',
      characterId: character1.id,
      status: 'pending',
      priority: 5,
      payload: { characterId: character1.characterId },
    },
  });

  await prisma.job.create({
    data: {
      jobType: 'sync-mail',
      characterId: character2.id,
      status: 'processing',
      priority: 3,
      payload: { characterId: character2.characterId },
      startedAt: new Date(),
    },
  });

  console.log('✅ Created jobs');

  // Create cached ESI data
  console.log('💾 Creating cached data...');

  await prisma.cachedData.create({
    data: {
      cacheKey: 'esi:universe:types:34',
      data: {
        type_id: 34,
        name: 'Tritanium',
        description: 'The most common ore type in the universe.',
        published: true,
        group_id: 18,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  await prisma.cachedData.create({
    data: {
      cacheKey: 'esi:universe:types:35',
      data: {
        type_id: 35,
        name: 'Pyerite',
        description: 'A common ore type found throughout New Eden.',
        published: true,
        group_id: 18,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  console.log('✅ Created cached data');

  // Create notification logs
  console.log('🔔 Creating notification logs...');

  await prisma.notificationLog.create({
    data: {
      userId: testUser1.id,
      characterId: character1.characterId,
      type: 'skill_complete',
      title: 'Skill Training Complete',
      body: 'Your skill "Caldari Frigate V" has finished training!',
      data: {
        skillId: 3328,
        skillName: 'Caldari Frigate',
        skillLevel: 5,
      },
      status: 'sent',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId: testUser1.id,
      characterId: character1.characterId,
      type: 'market_order_filled',
      title: 'Market Order Filled',
      body: 'Your sell order for 1000x Tritanium has been completed.',
      data: {
        orderId: '12345678',
        typeId: 34,
        typeName: 'Tritanium',
        quantity: 1000,
        price: 5.5,
      },
      status: 'sent',
      sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      readAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId: testUser2.id,
      characterId: character3.characterId,
      type: 'industry_job_complete',
      title: 'Industry Job Complete',
      body: 'Manufacturing of 10x Warp Scrambler I has finished.',
      data: {
        jobId: '987654321',
        blueprintTypeId: 446,
        runs: 10,
        outputTypeId: 448,
      },
      status: 'pending',
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId: testUser2.id,
      characterId: character3.characterId,
      type: 'eve_mail_received',
      title: 'New EVE Mail',
      body: 'You have received a new mail from Corporation Recruiter.',
      data: {
        mailId: '123456',
        from: 90000999,
        fromName: 'Corporation Recruiter',
        subject: 'Join our corp!',
      },
      status: 'sent',
      sentAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
  });

  console.log('✅ Created notification logs');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 2`);
  console.log(`   - Characters: 3`);
  console.log(`   - Sessions: 2`);
  console.log(`   - Jobs: 3`);
  console.log(`   - Cached Data: 2`);
  console.log(`   - Notifications: 4`);
  console.log(`   - User Settings: 2`);
  console.log('');
  console.log('💡 You can now use these test accounts:');
  console.log(`   - User 1: ${testUser1.email} (Free tier, 2 characters)`);
  console.log(`   - User 2: ${testUser2.email} (Premium tier, 1 character)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
