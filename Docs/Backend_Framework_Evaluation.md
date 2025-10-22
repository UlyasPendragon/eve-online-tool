# Backend Framework Evaluation for EVE Online Tool

**Document Version:** 1.0
**Last Updated:** 2025-01-16
**Purpose:** Evaluate Node.js, Python, and Go for EVE Nomad backend development
**Decision Status:** ⏳ PENDING - Framework selection required for EVE-9

---

## Executive Summary

This document evaluates three primary backend frameworks (Node.js, Python, Go) for building the EVE Nomad backend services. The evaluation considers ESI integration, mobile app backend requirements, developer experience, performance, and ecosystem maturity.

**Recommendation:** **[TO BE DECIDED based on team expertise and requirements]**

---

## Evaluation Criteria

### Primary Requirements

1. **ESI Integration:** Quality of available EVE Online ESI client libraries
2. **Mobile Backend:** Suitability for REST API serving mobile apps
3. **Real-time Features:** Support for WebSockets, push notifications, background jobs
4. **Scalability:** Ability to handle growing user base (target: 1,000+ MAU)
5. **Developer Experience:** Learning curve, debugging tools, community support
6. **Performance:** API response times, memory efficiency, concurrent request handling
7. **Ecosystem:** Libraries for payments (Stripe), databases (PostgreSQL), caching (Redis)
8. **Deployment:** Hosting options, containerization, CI/CD support

### Secondary Considerations

- Team familiarity and expertise
- Hiring pool availability
- Long-term maintainability
- Third-party service integration quality

---

## Framework Comparison

## 1. Node.js (JavaScript/TypeScript)

### Overview

Node.js is a JavaScript runtime built on Chrome's V8 engine, known for its non-blocking I/O and event-driven architecture.

### Pros ✅

**Strong Mobile Backend Ecosystem:**
- Extensive REST API frameworks (Express.js, Fastify, Koa, NestJS)
- Excellent WebSocket support (Socket.io)
- Native JSON handling (perfect for mobile apps)
- Firebase Admin SDK for push notifications (first-class support)

**Developer Experience:**
- Large talent pool (JavaScript is ubiquitous)
- Excellent TypeScript support (type safety + modern features)
- Hot reload during development (fast iteration)
- Massive npm ecosystem (600,000+ packages)
- Great debugging tools (Chrome DevTools, VS Code integration)

**ESI Integration:**
- **eve-esi** by MichielvdVelde - Node.js client for ESI
  - Automatic token refresh
  - Character and token management
  - Authenticated and unauthenticated requests
  - GitHub: https://github.com/MichielvdVelde/eve-esi

**Performance for I/O-Bound Tasks:**
- Non-blocking I/O excellent for API calls (ESI requests)
- Event loop handles many concurrent connections efficiently
- Good for real-time features (notifications, WebSockets)

**Cross-Platform:**
- Same language for frontend (React Native mobile app) and backend
- Code sharing potential (validation logic, type definitions)
- Unified development stack

**Payment/Service Integration:**
- Stripe: Official stripe-node library (excellent)
- PostgreSQL: pg, Prisma, TypeORM (mature ORMs)
- Redis: ioredis (production-ready)
- Background jobs: Bull, BullMQ (Redis-based queues)

### Cons ❌

**Single-Threaded:**
- CPU-intensive tasks block the event loop
- Not ideal for heavy computational work (e.g., complex analytics)
- Workaround: Worker threads or offload to separate services

**Memory Usage:**
- Higher memory consumption compared to Go
- Garbage collection pauses (though rare in modern V8)

**Callback/Promise Complexity:**
- Async code can become complex (mitigated by async/await)
- Error handling requires discipline

**ESI Library Maturity:**
- eve-esi library is functional but less mature than Python's EsiPy
- May need custom wrapper for advanced features

### Best For

- Teams with JavaScript/TypeScript expertise
- Projects prioritizing developer velocity
- Real-time features and WebSocket-heavy applications
- Unified frontend/backend stack (React Native + Node.js)

---

## 2. Python

### Overview

Python is a high-level, interpreted language known for data processing, scientific computing, and web development.

### Pros ✅

**Excellent ESI Integration:**
- **EsiPy** - Mature, well-maintained EVE Online ESI client
  - GitHub: https://github.com/Kyria/EsiPy (113 stars)
  - Last updated: May 2025 (actively maintained)
  - Swagger client specifically designed for ESI
  - OAuth2 authentication built-in
  - Automatic spec updates from CCP
  - Most established ESI library across all languages

**Developer Experience:**
- Clean, readable syntax ("batteries included" philosophy)
- Excellent for rapid prototyping
- Strong community and documentation
- Great for data processing and analytics

**Web Frameworks:**
- Django: Full-featured, "batteries included" (REST Framework, Admin panel)
- FastAPI: Modern, async, automatic OpenAPI docs, type hints
- Flask: Lightweight, flexible

**Data Processing Strength:**
- Superior for analytics, profitability calculations, data transformations
- NumPy, Pandas for complex data manipulation
- Perfect for industry production chain optimization

**Payment/Service Integration:**
- Stripe: Official stripe-python library
- PostgreSQL: psycopg2, SQLAlchemy, Django ORM
- Redis: redis-py
- Background jobs: Celery (mature, production-proven), RQ

### Cons ❌

**Performance:**
- Slower than Node.js and Go for pure API serving
- GIL (Global Interpreter Lock) limits true parallelism
- Higher latency for high-throughput APIs

**Deployment Complexity:**
- Requires WSGI/ASGI server (Gunicorn, Uvicorn)
- Dependency management can be challenging (virtualenv, pip, poetry)
- Larger container images compared to Go

**Async Support:**
- Async/await added relatively recently (compared to Node.js)
- Async ecosystem still maturing (FastAPI is modern solution)
- Many libraries still synchronous-only

**Mobile Backend:**
- Less common choice for mobile backends (though capable)
- Not as "JavaScript-native" as Node.js for JSON APIs

### Best For

- Teams with Python expertise
- Projects requiring complex data analytics (industry planning tools)
- Organizations already using Django/Python stack
- Prioritizing ESI integration quality (EsiPy is best-in-class)

---

## 3. Go (Golang)

### Overview

Go is a statically typed, compiled language designed by Google for systems programming and high-performance services.

### Pros ✅

**Performance:**
- Compiled to native machine code (extremely fast)
- Low latency API responses
- Excellent concurrent request handling (goroutines)
- Low memory footprint (~10-50 MB vs 100+ MB for Node.js/Python)

**Concurrency:**
- Goroutines and channels make concurrent programming simple
- Perfect for handling thousands of simultaneous API calls to ESI
- No event loop complexity (unlike Node.js)

**ESI Integration:**
- **goesi** by antihax - Well-designed Go client for ESI
  - GitHub: https://github.com/antihax/goesi (77 stars)
  - Versioned endpoints (follows ESI versioning)
  - OAuth2 authentication built-in
  - HTTP/2 support out of the box
  - Handles multiple tokens with different scopes
  - Nightly builds to CCP ESI spec
  - 100% ESI API coverage

**Deployment:**
- Single binary deployment (no runtime dependencies)
- Tiny Docker images (5-20 MB compressed)
- Fast startup times (~milliseconds)
- Cross-compilation built-in (compile for Linux from Windows)

**Type Safety:**
- Strong static typing catches errors at compile time
- No runtime type errors (unlike JavaScript/Python)

**Payment/Service Integration:**
- Stripe: stripe-go (official library)
- PostgreSQL: pgx, GORM (mature ORMs)
- Redis: go-redis
- Background jobs: asynq (Redis-based, type-safe)

**Scalability:**
- Designed for microservices and distributed systems
- Excellent for high-throughput, low-latency APIs
- Used by major companies (Google, Uber, Dropbox)

### Cons ❌

**Learning Curve:**
- Steeper learning curve than JavaScript/Python
- Different paradigms (goroutines, channels, error handling)
- Smaller talent pool compared to JavaScript/Python

**Ecosystem:**
- Smaller package ecosystem than npm/PyPI
- Fewer third-party integrations (though growing)
- Some libraries less mature than Node.js/Python equivalents

**Developer Experience:**
- More verbose than Python/JavaScript
- No REPL for quick experimentation
- Stricter compilation requirements

**Web Framework Fragmentation:**
- No dominant "Rails" or "Django" equivalent
- Many competing frameworks (Gin, Echo, Fiber, Chi)
- More "DIY" approach to web development

### Best For

- Performance-critical applications (high-throughput APIs)
- Microservices architecture
- Teams prioritizing operational efficiency and low costs
- Projects requiring excellent concurrency (thousands of background jobs)

---

## EVE Nomad Specific Analysis

### Backend Requirements for EVE Nomad

1. **ESI API Integration** - Critical
2. **REST API for Mobile Apps** (React Native/Flutter) - Critical
3. **Push Notifications** (Firebase) - Critical
4. **Background Jobs** (skill monitoring, order alerts) - Critical
5. **Real-time WebSockets** (optional for live updates) - Nice to have
6. **Payment Processing** (Stripe, Apple IAP, Google Play) - Critical
7. **Database** (PostgreSQL) - Critical
8. **Caching** (Redis) - Critical
9. **Analytics** - Important
10. **Email Service** - Important

### Framework Scoring

| Criteria | Node.js | Python | Go |
|----------|---------|--------|-----|
| **ESI Integration** | 7/10 (eve-esi functional) | 9/10 (EsiPy excellent) | 8/10 (goesi solid) |
| **Mobile Backend** | 9/10 (native fit) | 7/10 (capable) | 8/10 (fast APIs) |
| **Real-time Features** | 10/10 (Socket.io) | 6/10 (async improving) | 7/10 (goroutines) |
| **Performance** | 7/10 (I/O-bound) | 5/10 (slower) | 10/10 (fastest) |
| **Developer Experience** | 9/10 (familiar, fast iteration) | 8/10 (readable, batteries included) | 6/10 (learning curve) |
| **Ecosystem** | 10/10 (npm massive) | 9/10 (mature) | 7/10 (growing) |
| **Deployment** | 7/10 (containerize) | 6/10 (complex) | 10/10 (single binary) |
| **Type Safety** | 8/10 (TypeScript) | 6/10 (type hints) | 10/10 (compiled) |
| **Scalability** | 8/10 (horizontal scaling) | 6/10 (GIL limits) | 10/10 (goroutines) |
| **Payment Integration** | 9/10 (Stripe excellent) | 9/10 (Stripe excellent) | 8/10 (Stripe good) |
| **Background Jobs** | 9/10 (Bull/BullMQ) | 10/10 (Celery mature) | 9/10 (asynq) |
| **Community/Hiring** | 10/10 (huge pool) | 9/10 (large pool) | 6/10 (smaller pool) |
| ****TOTAL** | **103/120** | **90/120** | **99/120** |

### Recommendation Matrix

**Choose Node.js if:**
- ✅ Team has JavaScript/TypeScript experience
- ✅ Using React Native for mobile app (code sharing)
- ✅ Prioritizing developer velocity and fast iteration
- ✅ Real-time features are important (WebSockets, live updates)
- ✅ Want unified language across stack

**Choose Python if:**
- ✅ Team has Python/Django experience
- ✅ ESI integration quality is top priority (EsiPy is best)
- ✅ Future products require complex data analytics (Industrialist's Ledger)
- ✅ Rapid prototyping more important than raw performance
- ✅ Want Django Admin panel for internal tools

**Choose Go if:**
- ✅ Team has Go experience or willing to learn
- ✅ Performance and low latency are critical (< 50ms API responses)
- ✅ Minimizing hosting costs is important (small footprint)
- ✅ Expect high user growth (10,000+ MAU)
- ✅ Want simple deployment (single binary)

---

## Recommended Stack Combinations

### Option 1: Node.js + TypeScript Stack (RECOMMENDED for EVE Nomad MVP)

**Backend:**
- **Framework:** Fastify (high performance) or NestJS (structured)
- **Language:** TypeScript (type safety)
- **ESI Client:** eve-esi (wrap with custom layer)
- **Database:** PostgreSQL + Prisma ORM
- **Caching:** Redis + ioredis
- **Background Jobs:** BullMQ
- **Auth:** Passport.js + JWT
- **Payments:** stripe-node
- **Push Notifications:** Firebase Admin SDK

**Mobile App:**
- React Native (same language as backend)

**Advantages:**
- Unified JavaScript/TypeScript across entire stack
- Fastest development velocity
- Huge ecosystem and developer availability
- Excellent for mobile backend
- Easy code sharing (types, validation)

**Disadvantages:**
- ESI library less mature than Python's EsiPy
- Higher memory usage than Go
- Requires discipline for CPU-intensive tasks

---

### Option 2: Python + FastAPI Stack

**Backend:**
- **Framework:** FastAPI (modern, async, auto docs)
- **Language:** Python 3.11+
- **ESI Client:** EsiPy (best-in-class)
- **Database:** PostgreSQL + SQLAlchemy
- **Caching:** Redis + redis-py
- **Background Jobs:** Celery + Redis
- **Auth:** FastAPI OAuth2
- **Payments:** stripe-python
- **Push Notifications:** FCM library

**Mobile App:**
- React Native or Flutter

**Advantages:**
- Best ESI integration (EsiPy is most mature)
- Excellent for data analytics (future products)
- Clean, readable code
- FastAPI provides automatic OpenAPI docs

**Disadvantages:**
- Slower than Node.js/Go
- Language mismatch with mobile app
- Deployment more complex
- GIL limits true parallelism

---

### Option 3: Go Stack (High Performance)

**Backend:**
- **Framework:** Gin or Fiber (fast HTTP routers)
- **Language:** Go 1.21+
- **ESI Client:** goesi
- **Database:** PostgreSQL + GORM
- **Caching:** Redis + go-redis
- **Background Jobs:** asynq
- **Auth:** golang-jwt
- **Payments:** stripe-go
- **Push Notifications:** Firebase Admin SDK (Go)

**Mobile App:**
- React Native or Flutter

**Advantages:**
- Fastest performance (< 10ms API latency)
- Lowest hosting costs (tiny memory footprint)
- Best scalability (goroutines)
- Simple deployment (single binary)

**Disadvantages:**
- Steeper learning curve
- Language mismatch with mobile app
- Smaller ecosystem and developer pool
- More verbose code

---

## Decision Framework

### For EVE Nomad MVP (First 6 Months)

**Primary Goal:** Launch quickly with reliable ESI integration and mobile backend

**Recommended: Node.js + TypeScript**

**Reasoning:**
1. **Speed to Market:** Fastest development velocity for MVP
2. **Mobile Fit:** Native JSON/REST API serving for React Native
3. **Unified Stack:** Same language reduces context switching
4. **Ecosystem:** Huge library availability for all integrations
5. **Hiring:** Largest developer talent pool
6. **Real-time:** Excellent WebSocket support (future features)

**Acceptable Trade-off:**
- ESI library (eve-esi) less mature than Python's EsiPy
- **Mitigation:** Wrap eve-esi with custom abstraction layer, contribute improvements upstream

### For Future Products

**The Industrialist's Ledger** (Production Planning):
- **Recommended:** Python + FastAPI
- **Reason:** Complex data analytics, production chain optimization, EsiPy integration

**The CEO's Dashboard** (Corp Management):
- **Recommended:** Node.js or Go
- **Reason:** High concurrency (many corp members), real-time dashboards

---

## Action Items for EVE-9

Based on this evaluation, the following tasks should be completed:

### If Choosing Node.js + TypeScript (Recommended):

1. **Set up Node.js development environment:**
   - Install Node.js v20 LTS
   - Install pnpm or yarn (package manager)
   - Initialize TypeScript project
   - Set up ESLint + Prettier

2. **Install ESI client library:**
   - npm install eve-esi
   - Create custom wrapper layer for ESI calls
   - Test authentication with EVE SSO

3. **Set up backend framework:**
   - Choose between Fastify (performance) or NestJS (structure)
   - Initialize REST API project
   - Configure environment variables (.env)

4. **Install core dependencies:**
   - Prisma (PostgreSQL ORM)
   - ioredis (Redis client)
   - BullMQ (background jobs)
   - stripe (payments)
   - firebase-admin (push notifications)

5. **Configure development tools:**
   - VS Code with TypeScript extensions
   - Postman/Insomnia for API testing
   - Docker Compose for local PostgreSQL + Redis

6. **Set up version control:**
   - Initialize Git repository
   - Create .gitignore for Node.js
   - Set up branches: main, develop, feature/*

7. **Create environment configs:**
   - .env.development
   - .env.staging
   - .env.production (template only)

### If Choosing Python + FastAPI:

1. **Set up Python environment:**
   - Install Python 3.11+
   - Set up virtualenv or poetry
   - Install FastAPI + Uvicorn

2. **Install ESI client:**
   - pip install EsiPy
   - Configure OAuth2

3. **Install dependencies:**
   - SQLAlchemy (ORM)
   - redis-py
   - Celery
   - stripe-python

### If Choosing Go:

1. **Set up Go environment:**
   - Install Go 1.21+
   - Initialize Go module

2. **Install ESI client:**
   - go get github.com/antihax/goesi

3. **Choose framework:**
   - Gin or Fiber

4. **Install dependencies:**
   - GORM
   - go-redis
   - asynq
   - stripe-go

---

## Next Steps

1. **Team Decision Meeting:** Discuss framework choice based on team expertise
2. **Prototype:** Build minimal ESI integration proof-of-concept in chosen framework
3. **Evaluate:** Test ESI library quality, developer experience, performance
4. **Commit:** Once validated, proceed with full environment setup (EVE-9)

---

## Conclusion

**For EVE Nomad MVP, Node.js + TypeScript is recommended** due to:
- Fastest development velocity
- Unified stack with React Native mobile app
- Excellent mobile backend ecosystem
- Large developer talent pool
- Good-enough ESI integration (eve-esi)

**Python + FastAPI is a strong alternative** if:
- Team has Python expertise
- ESI integration quality is critical
- Future analytics products are planned soon

**Go is best for later** when:
- User base grows to 10,000+ MAU
- Performance becomes critical
- Team has Go expertise or resources to learn

**Decision Required:** Team should review this analysis and make final framework selection before proceeding with EVE-9 implementation.

---

**Document Owner:** EVE Online Tool Development Team
**Next Review:** After framework selection and MVP launch
