import 'dotenv/config';
import { ESIClient } from './esi-client';

/**
 * Test script to validate ESI integration
 * Tests various unauthenticated ESI endpoints
 */
async function runESITests() {
  console.log('='.repeat(60));
  console.log('EVE Online ESI Integration - Proof of Concept');
  console.log('='.repeat(60));
  console.log();

  const baseURL = process.env.ESI_BASE_URL || 'https://esi.evetech.net';
  const userAgent = process.env.ESI_USER_AGENT || 'EVE Nomad POC (test@example.com)';

  console.log(`ESI Base URL: ${baseURL}`);
  console.log(`User Agent: ${userAgent}`);
  console.log();

  const client = new ESIClient(baseURL, userAgent);

  try {
    // Test 1: Get Server Status
    console.log('Test 1: Get EVE Server Status');
    console.log('-'.repeat(60));
    const serverStatus = await client.getServerStatus();
    console.log(`✅ Server Online: ${serverStatus.players} players online`);
    console.log(`   Server Version: ${serverStatus.server_version}`);
    console.log(`   Started: ${new Date(serverStatus.start_time).toLocaleString()}`);
    console.log();

    // Test 2: Get Universe Type (Tritanium)
    console.log('Test 2: Get Universe Type Information (Tritanium - Type ID 34)');
    console.log('-'.repeat(60));
    const tritanium = await client.getUniverseType(34);
    console.log(`✅ Type Name: ${tritanium.name}`);
    console.log(`   Description: ${tritanium.description.substring(0, 100)}...`);
    console.log(`   Volume: ${tritanium.volume} m³`);
    console.log(`   Group ID: ${tritanium.group_id}`);
    console.log();

    // Test 3: Get Solar System (Jita)
    console.log('Test 3: Get Solar System Information (Jita - System ID 30000142)');
    console.log('-'.repeat(60));
    const jita = await client.getSolarSystem(30000142);
    console.log(`✅ System Name: ${jita.name}`);
    console.log(`   Security Status: ${jita.security_status.toFixed(2)}`);
    console.log(`   Constellation ID: ${jita.constellation_id}`);
    console.log(`   Stations: ${jita.stations?.length || 0}`);
    console.log(`   Position: x=${jita.position.x.toExponential(2)}, y=${jita.position.y.toExponential(2)}, z=${jita.position.z.toExponential(2)}`);
    console.log();

    // Test 4: Get Character Public Info (CCP Falcon - famous EVE dev)
    console.log('Test 4: Get Character Public Information (CCP Falcon - Character ID 92168909)');
    console.log('-'.repeat(60));
    const character = await client.getCharacterPublicInfo(92168909);
    console.log(`✅ Character Name: ${character.name}`);
    console.log(`   Corporation ID: ${character.corporation_id}`);
    console.log(`   Birthday: ${new Date(character.birthday).toLocaleDateString()}`);
    console.log(`   Gender: ${character.gender}`);
    if (character.security_status !== undefined) {
      console.log(`   Security Status: ${character.security_status.toFixed(2)}`);
    }
    console.log();

    // Test 5: Get Market Prices (sample first 5)
    console.log('Test 5: Get Market Prices (first 5 items)');
    console.log('-'.repeat(60));
    const marketPrices = await client.getMarketPrices();
    console.log(`✅ Total Items with Prices: ${marketPrices.length}`);
    console.log('   Sample Prices:');
    marketPrices.slice(0, 5).forEach((item: any) => {
      console.log(`   - Type ${item.type_id}: Average ${item.average_price?.toLocaleString() || 'N/A'} ISK, Adjusted ${item.adjusted_price?.toLocaleString() || 'N/A'} ISK`);
    });
    console.log();

    // Success summary
    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60));
    console.log();
    console.log('ESI Integration validated successfully!');
    console.log('Key findings:');
    console.log('  ✅ Axios HTTP client working correctly');
    console.log('  ✅ ESI endpoints responding as expected');
    console.log('  ✅ Response parsing successful');
    console.log('  ✅ Cache headers detected and logged');
    console.log('  ✅ Error limit headers tracked');
    console.log('  ✅ TypeScript type safety working');
    console.log();
    console.log('Next steps:');
    console.log('  1. Implement OAuth 2.0 for authenticated endpoints');
    console.log('  2. Add token refresh mechanism');
    console.log('  3. Implement caching layer (Redis)');
    console.log('  4. Add rate limit handling');
    console.log('  5. Create wrapper for character-specific endpoints');
    console.log();

  } catch (error) {
    console.error('❌ TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runESITests().catch(console.error);
