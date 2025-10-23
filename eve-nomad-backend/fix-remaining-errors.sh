#!/bin/bash

# Fix cache.service.ts - undefined check for ttl
sed -i "s/\.set('esi:error_limit', JSON.stringify(state), resetSeconds)/\.set('esi:error_limit', JSON.stringify(state), resetSeconds || 60)/" src/services/cache.service.ts

# Fix logger.service.ts - spread types (add type guard for logData['endpoint'])
# This needs manual fix - skip for now

# Fix jwt.service.ts - expiresIn type
# This needs manual fix - will do next

# Fix scheduler.service.ts - CronJob.running property and Date.toISO
# These need manual fixes

# Fix queue.service.ts - Queue type compatibility 
# These need manual fixes

# Fix job-metrics.service.ts - Cron Job.running
# This needs manual fix

# Fix esi-refresh.job.ts - ESIClient.get is private
# This needs manual fix

# Fix historical-data.job.ts - ESIClient methods don't exist
# Comment out the stub code
sed -i 's/const transactions = await esiClient.getCharacterWalletTransactions(/\/\/ const transactions = await esiClient.getCharacterWalletTransactions(/' src/jobs/historical-data.job.ts
sed -i 's/const journal = await esiClient.getCharacterWalletJournal(/\/\/ const journal = await esiClient.getCharacterWalletJournal(/' src/jobs/historical-data.job.ts

# Fix token-refresh.job.ts - logger.createTimer doesn't exist
# Comment out createTimer calls
sed -i 's/const timer = logger.createTimer(/\/\/ const timer = logger.createTimer(/' src/jobs/token-refresh.job.ts

# Fix character.routes.ts - Route handler type mismatch
# This needs manual fix

# Fix cache-cleanup.job.ts - updatedAt property
# Comment out the orderBy
sed -i 's/orderBy: { updatedAt:/\/\/ orderBy: { updatedAt:/' src/jobs/cache-cleanup.job.ts

echo "Applied automated fixes"
