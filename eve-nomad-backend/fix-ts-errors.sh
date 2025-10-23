#!/bin/bash
# Fix TypeScript strict mode errors

# Fix unused parameters
sed -i 's/(request: FastifyRequest, reply: FastifyReply)/(request: FastifyRequest, _reply: FastifyReply)/' src/middleware/auth.middleware.ts
sed -i 's/setupMetricsCollection(queue:/setupMetricsCollection(_queue:/' src/services/job-metrics.service.ts
sed -i 's/for (const queueName of/for (const _queueName of/' src/services/job-metrics.service.ts
sed -i 's/, result)/, _result)/' src/services/queue.service.ts
sed -i 's/, returnvalue)/, _returnvalue)/' src/services/queue.service.ts
sed -i 's/^const AUTH_TAG_LENGTH/const _AUTH_TAG_LENGTH/' src/services/token.service.ts

# Fix historical-data.job.ts unused variables
sed -i 's/^const _prisma =/\/\/ const _prisma =/' src/jobs/historical-data.job.ts
sed -i 's/  userId:/  _userId:/' src/jobs/historical-data.job.ts  
sed -i 's/  pageToken:/  _pageToken:/' src/jobs/historical-data.job.ts
sed -i 's/for (const endpoint of/for (const _endpoint of/' src/jobs/historical-data.job.ts

echo "Fixed unused parameters"
