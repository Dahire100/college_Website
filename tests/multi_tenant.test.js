// Comprehensive Multi-Tenant SaaS Architecture & Security Test Suite
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Set test environment configuration
process.env.NODE_ENV = 'test';
process.env.ALLOW_TENANT_HEADER_OVERRIDE = 'true';
process.env.JWT_SECRET = 'test_tenant_secret_2026';
process.env.SUPERADMIN_JWT_SECRET = 'test_superadmin_secret_2026';

const { db, Models, TenantIsolationError, aggregateScoped, getTenantDb } = require('../server/db');
const { seed } = require('../server/seed');
const { invalidateTenantCache } = require('../server/middleware/tenant');
const app = require('../server/index');

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        ...(options.headers || {})
      }
    };

    if (postData) {
      const dataStr = typeof postData === 'string' ? postData : JSON.stringify(postData);
      reqOptions.headers['Content-Type'] = reqOptions.headers['Content-Type'] || 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = null;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json, rawBody: body });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runMultiTenantTests() {
  console.log('================================================================');
  console.log('🛡️  RUNNING COMPREHENSIVE MULTI-TENANT SAAS VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 0. Seed database and initialize test tenants
  console.log('Initializing seed and test tenants...');
  await seed();

  // Clean up any test tenants from previous runs for idempotent execution
  const prevTenants = await db.Tenant.find({});
  for (const t of prevTenants) {
    if (['college-alpha.edu', 'college-beta.edu', 'suspended-univ.edu'].includes(t.domain)) {
      await db.Tenant.deleteOne({ _id: t._id || t.id });
    }
  }

  // Create two distinct test tenants
  const tenantA = await db.Tenant.create({
    name: 'College Alpha',
    domain: 'college-alpha.edu',
    subdomain: 'alpha',
    status: 'active',
    plan: 'enterprise',
    branding: {
      collegeName: 'College Alpha of Science',
      logoUrl: '/logos/alpha.png',
      primaryColor: '#1e3a8a'
    }
  });

  const tenantB = await db.Tenant.create({
    name: 'College Beta',
    domain: 'college-beta.edu',
    subdomain: 'beta',
    status: 'active',
    plan: 'standard',
    branding: {
      collegeName: 'College Beta of Engineering',
      logoUrl: '/logos/beta.png',
      primaryColor: '#047857'
    }
  });

  const tenantAId = String(tenantA._id || tenantA.id);
  const tenantBId = String(tenantB._id || tenantB.id);

  // Start HTTP test server on dynamic port
  const server = http.createServer(app);
  await new Promise(res => server.listen(0, '127.0.0.1', res));

  try {
    // -------------------------------------------------------------
    // TEST 1: Mongoose & Hybrid Pre-Hook Query Guard
    // -------------------------------------------------------------
    console.log('\n--- 1. Data-Layer Isolation: Query Guards ---');
    let threwOnUnscoped = false;
    try {
      await db.Page.find({}); // Missing tenantId
    } catch (err) {
      if (err instanceof TenantIsolationError || err.name === 'TenantIsolationError' || err.message.includes('tenantId')) {
        threwOnUnscoped = true;
      }
    }
    assert('Querying tenant-scoped model without tenantId throws TenantIsolationError', threwOnUnscoped);

    let succeededWithScoped = false;
    try {
      const pages = await db.Page.find({ tenantId: tenantAId });
      succeededWithScoped = Array.isArray(pages);
    } catch (err) {
      succeededWithScoped = false;
    }
    assert('Querying tenant-scoped model with explicit tenantId succeeds', succeededWithScoped);

    // -------------------------------------------------------------
    // TEST 2: Aggregation Guard (First stage $match tenantId)
    // -------------------------------------------------------------
    console.log('\n--- 2. Data-Layer Isolation: Aggregation Guard ---');
    let threwOnUnscopedAggregate = false;
    try {
      await db.Notice.aggregate([{ $count: 'total' }]);
    } catch (err) {
      if (err.message.includes('missing required tenantId $match as first stage')) {
        threwOnUnscopedAggregate = true;
      }
    }
    assert('Aggregation without tenantId $match as first stage throws TenantIsolationError', threwOnUnscopedAggregate);

    let succeededWithScopedAggregate = false;
    try {
      const aggResult = await aggregateScoped(db.Notice, tenantAId, [{ $count: 'total' }]);
      succeededWithScopedAggregate = Array.isArray(aggResult);
    } catch (err) {
      succeededWithScopedAggregate = false;
    }
    assert('Aggregation using aggregateScoped with first stage tenantId $match succeeds', succeededWithScopedAggregate);

    // -------------------------------------------------------------
    // TEST 3: insertMany & Mutation Guards
    // -------------------------------------------------------------
    console.log('\n--- 3. Data-Layer Isolation: insertMany Guard ---');
    let threwOnMissingDocTenant = false;
    try {
      await db.Notice.insertMany([
        { title: 'Test Notice 1', category: 'General', publishedDate: '2026-09-09' } // missing tenantId
      ]);
    } catch (err) {
      if (err.message.includes('tenantId')) {
        threwOnMissingDocTenant = true;
      }
    }
    assert('insertMany with document missing tenantId throws TenantIsolationError', threwOnMissingDocTenant);

    let succeededTaggedInsertMany = false;
    try {
      const inserted = await db.Notice.insertMany([
        { tenantId: tenantAId, title: 'Scoped Notice A1', category: 'Academic', publishedDate: '2026-09-09' },
        { tenantId: tenantAId, title: 'Scoped Notice A2', category: 'Academic', publishedDate: '2026-09-09' }
      ]);
      succeededTaggedInsertMany = inserted.length === 2;
    } catch (err) {
      succeededTaggedInsertMany = false;
    }
    assert('insertMany with tenantId stamped on all documents succeeds', succeededTaggedInsertMany);

    // -------------------------------------------------------------
    // TEST 4: Per-Tenant Compound Uniqueness
    // -------------------------------------------------------------
    console.log('\n--- 4. Per-Tenant Compound Uniqueness ---');
    let tenantAPageCreated = false;
    let tenantBPageCreated = false;
    let duplicateWithinTenantBlocked = false;

    try {
      await db.Page.create({
        tenantId: tenantAId,
        slug: 'admissions-overview',
        title: 'Alpha Admissions Overview'
      });
      tenantAPageCreated = true;
    } catch (e) {
      tenantAPageCreated = false;
    }

    try {
      // College B uses the EXACT same slug 'admissions-overview'
      await db.Page.create({
        tenantId: tenantBId,
        slug: 'admissions-overview',
        title: 'Beta Admissions Overview'
      });
      tenantBPageCreated = true;
    } catch (e) {
      tenantBPageCreated = false;
    }

    assert('Tenant A and Tenant B can both independently create page with slug "admissions-overview"', tenantAPageCreated && tenantBPageCreated);

    try {
      // Duplicate slug within Tenant A must fail
      await db.Page.create({
        tenantId: tenantAId,
        slug: 'admissions-overview',
        title: 'Duplicate Alpha Admissions'
      });
    } catch (err) {
      if (err.code === 11000 || err.message.includes('duplicate')) {
        duplicateWithinTenantBlocked = true;
      }
    }
    assert('Creating duplicate slug within the same tenant fails with duplicate key error', duplicateWithinTenantBlocked);

    // -------------------------------------------------------------
    // TEST 5: Domain Resolution & Inactive Status (404)
    // -------------------------------------------------------------
    console.log('\n--- 5. Domain Resolution & Status Checks ---');
    const unknownDomainRes = await makeRequest(server, {
      path: '/api/v1/public/config',
      headers: { Host: 'unknown-college.org' }
    });
    assert('Request to unknown host returns 404 Not Found', unknownDomainRes.status === 404);

    // Create suspended tenant
    let suspendedTenant = await db.Tenant.findOne({ domain: 'suspended-univ.edu' });
    if (suspendedTenant) {
      await db.Tenant.updateOne({ _id: suspendedTenant._id || suspendedTenant.id }, { status: 'suspended' });
    } else {
      suspendedTenant = await db.Tenant.create({
        name: 'Suspended University',
        domain: 'suspended-univ.edu',
        status: 'suspended',
        plan: 'starter'
      });
    }
    const suspendedDomainRes = await makeRequest(server, {
      path: '/api/v1/public/config',
      headers: { Host: 'suspended-univ.edu' }
    });
    assert('Request to suspended tenant returns 404 Not Found', suspendedDomainRes.status === 404);

    // -------------------------------------------------------------
    // TEST 6: Public Tenant Branding Configuration Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 6. Public Tenant Configuration ---');
    const configResA = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: { Host: 'college-alpha.edu' }
    });
    assert('GET /api/tenant-config for Alpha returns Alpha branding',
      configResA.status === 200 &&
      configResA.data?.data?.collegeName === 'College Alpha of Science' &&
      configResA.data?.data?.primaryColor === '#1e3a8a'
    );

    const configResB = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: { Host: 'college-beta.edu' }
    });
    assert('GET /api/tenant-config for Beta returns Beta branding',
      configResB.status === 200 &&
      configResB.data?.data?.collegeName === 'College Beta of Engineering' &&
      configResB.data?.data?.primaryColor === '#047857'
    );

    // -------------------------------------------------------------
    // TEST 7: Cross-Tenant JWT Attack Prevention (403)
    // -------------------------------------------------------------
    console.log('\n--- 7. Cross-Tenant JWT Attack Protection ---');
    // Seed admin for Tenant A
    const passwordHash = bcrypt.hashSync('AlphaAdmin@123', 10);
    const adminA = await db.Admin.create({
      tenantId: tenantAId,
      username: 'admin_alpha',
      email: 'admin@alpha.edu',
      passwordHash,
      fullName: 'Alpha Principal'
    });

    // Sign JWT token for Tenant A Admin
    const tokenA = jwt.sign(
      { id: adminA._id || adminA.id, username: adminA.username, email: adminA.email, tenantId: tenantAId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Tenant A admin accesses Tenant A endpoints -> 200 OK
    const legitAccess = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tokenA}`
      }
    });
    assert('Tenant A admin accessing Tenant A endpoints succeeds (200)', legitAccess.status === 200);

    // CROSS-TENANT ATTACK: Tenant A admin uses their token against Tenant B's domain -> 403 Forbidden!
    const crossTenantAttack = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-beta.edu',
        Authorization: `Bearer ${tokenA}`
      }
    });
    assert('Tenant A admin token sent to Tenant B domain is blocked with 403 Forbidden', crossTenantAttack.status === 403);

    // -------------------------------------------------------------
    // TEST 8: SuperAdmin Authentication Separation
    // -------------------------------------------------------------
    console.log('\n--- 8. SuperAdmin Authentication Separation ---');
    // 8a. Blocked login at tenant /admin (POST /api/v1/auth/login) with SuperAdmin credentials
    const blockedSuperLogin = await makeRequest(server, {
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { Host: 'college-alpha.edu' }
    }, {
      username: 'superadmin',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123'
    });
    assert('SuperAdmin login blocked at tenant /admin portal (/api/v1/auth/login)',
      blockedSuperLogin.status === 403
    );

    // 8b. Dedicated login at /superadmin/login with SuperAdmin credentials
    const dedicatedSuperLogin = await makeRequest(server, {
      path: '/superadmin/login',
      method: 'POST'
    }, {
      username: 'superadmin',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123'
    });
    assert('SuperAdmin logs in exclusively via dedicated route (/superadmin/login)',
      dedicatedSuperLogin.status === 200 && dedicatedSuperLogin.data?.superAdmin?.role === 'superadmin'
    );
    const superAdminToken = dedicatedSuperLogin.data?.token;

    // 8c. SuperAdmin authenticated via /superadmin/login has emergency access to tenant admin endpoints
    const superAdminToTenantAdmin = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${superAdminToken}`
      }
    });
    assert('SuperAdmin has emergency access to tenant admin portal endpoints', superAdminToTenantAdmin.status === 200);

    // Tenant admin token cannot access SuperAdmin endpoints -> 403 Forbidden
    const tenantAdminToSuperAdmin = await makeRequest(server, {
      path: '/superadmin/tenants',
      headers: {
        Authorization: `Bearer ${tokenA}`
      }
    });
    assert('Tenant admin token cannot access /superadmin endpoints (403 blocked)', tenantAdminToSuperAdmin.status === 403);

    // SuperAdmin can manage tenant lifecycle (list, suspend, usage)
    const listTenantsRes = await makeRequest(server, {
      path: '/superadmin/tenants',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert('SuperAdmin can list all platform tenants', listTenantsRes.status === 200 && Array.isArray(listTenantsRes.data?.tenants));

    const usageRes = await makeRequest(server, {
      path: `/superadmin/tenants/${tenantAId}/usage`,
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert('SuperAdmin can query tenant usage statistics', usageRes.status === 200 && usageRes.data?.usage?.tenantId === tenantAId);

    // Test SuperAdmin Login Rate Limiting (attempts > 5)
    let rateLimited = false;
    for (let i = 0; i < 6; i++) {
      const res = await makeRequest(server, {
        path: '/superadmin/login',
        method: 'POST'
      }, {
        username: 'superadmin',
        password: 'WrongPasswordAttempt'
      });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert('SuperAdmin brute-force protection blocks excessive login attempts with 429', rateLimited);

    // -------------------------------------------------------------
    // TEST 9: Hardened Header Spoofing Protection
    // -------------------------------------------------------------
    console.log('\n--- 9. Header Spoofing Protection ---');
    // In test environment with ALLOW_TENANT_HEADER_OVERRIDE, header works
    const testHeaderOverride = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: {
        Host: 'localhost',
        'x-tenant-domain': 'college-alpha.edu'
      }
    });
    assert('x-tenant-domain allowed in non-production with explicit opt-in', testHeaderOverride.status === 200 && testHeaderOverride.data?.data?.collegeName === 'College Alpha of Science');

    // In production simulation, header is ignored
    process.env.NODE_ENV = 'production';
    const prodSpoofAttempt = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: {
        Host: 'college-beta.edu',
        'x-tenant-domain': 'college-alpha.edu'
      }
    });
    assert('x-tenant-domain is strictly ignored in production (resolves to Host college-beta.edu)',
      prodSpoofAttempt.status === 200 && prodSpoofAttempt.data?.data?.collegeName === 'College Beta of Engineering'
    );
    process.env.NODE_ENV = 'test';

    // -------------------------------------------------------------
    // TEST 10: Media Storage Isolation
    // -------------------------------------------------------------
    console.log('\n--- 10. File Storage Partitioning & Isolation ---');
    // Create mock file in tenant A partition
    const tenantAUploadsDir = path.join(__dirname, '..', 'public', 'uploads', tenantAId);
    if (!fs.existsSync(tenantAUploadsDir)) fs.mkdirSync(tenantAUploadsDir, { recursive: true });
    fs.writeFileSync(path.join(tenantAUploadsDir, 'confidential_exam.pdf'), 'EXAM_DATA_ALPHA');

    // Accessing Tenant A file via Tenant A domain succeeds
    const accessTenantAFile = await makeRequest(server, {
      path: `/uploads/${tenantAId}/confidential_exam.pdf`,
      headers: { Host: 'college-alpha.edu' }
    });
    assert('Accessing Tenant A media file via Tenant A domain succeeds', accessTenantAFile.status === 200);

    // Cross-tenant media attack: Accessing Tenant A file via Tenant B domain returns 403 Forbidden!
    const crossTenantFileAttack = await makeRequest(server, {
      path: `/uploads/${tenantAId}/confidential_exam.pdf`,
      headers: { Host: 'college-beta.edu' }
    });
    assert('Accessing Tenant A media path via Tenant B host is blocked with 403 Forbidden', crossTenantFileAttack.status === 403);

    // -------------------------------------------------------------
    // TEST 11: Cache Invalidation on Tenant Suspension
    // -------------------------------------------------------------
    console.log('\n--- 11. Domain Caching & Instant Invalidation ---');
    // First request primes cache
    const primeCache = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: { Host: 'college-alpha.edu' }
    });
    assert('Domain cache primed for College Alpha', primeCache.status === 200);

    // Suspend College Alpha via SuperAdmin API
    const suspendRes = await makeRequest(server, {
      path: `/superadmin/tenants/${tenantAId}/suspend`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert('SuperAdmin suspended College Alpha', suspendRes.status === 200);

    // Next request to College Alpha domain must immediately 404 (not wait for cache TTL)
    const postSuspendRes = await makeRequest(server, {
      path: '/api/tenant-config',
      headers: { Host: 'college-alpha.edu' }
    });
    assert('Subsequent request to suspended tenant immediately returns 404 due to cache invalidation', postSuspendRes.status === 404);

    // Reactivate for cleanup
    await makeRequest(server, {
      path: `/superadmin/tenants/${tenantAId}/activate`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    // -------------------------------------------------------------
    // TEST 12: Request Body TenantId Spoofing Protection
    // -------------------------------------------------------------
    console.log('\n--- 12. Request Body TenantId Spoofing Protection ---');
    // 12a. Log in as Tenant A admin
    const loginRes = await makeRequest(server, {
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { Host: 'college-alpha.edu' }
    }, {
      username: 'admin_alpha',
      password: 'AlphaAdmin@123'
    });
    assert('Tenant A admin login succeeds', loginRes.status === 200 && !!loginRes.data?.token);
    const tenantAAdminToken = loginRes.data.token;

    // 12b. POST to write endpoint (/api/v1/admin/pages) with spoofed tenantId (Tenant B's real ObjectId)
    const spoofedSlug = `spoof-test-${Date.now()}`;
    const createPageRes = await makeRequest(server, {
      path: '/api/v1/admin/pages',
      method: 'POST',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tenantAAdminToken}`
      }
    }, {
      title: 'Spoofed Page Test',
      slug: spoofedSlug,
      content: 'Testing tenant isolation against spoofed tenantId in body',
      tenantId: String(tenantBId) // Maliciously spoofed Tenant B ID!
    });
    assert('POST /api/v1/admin/pages with spoofed tenantId succeeds (created)', createPageRes.status === 201);

    // Directly query database to inspect stored document (passing explicit tenantId to satisfy isolation guard)
    const createdPageDoc = await Models.Page.findOne({ slug: spoofedSlug, tenantId: tenantAId }).lean();
    const createdInTenantBDoc = await Models.Page.findOne({ slug: spoofedSlug, tenantId: tenantBId }).lean();
    assert(
      'Created page document exists under Tenant A in DB',
      createdPageDoc !== null
    );
    assert(
      "Created page document tenantId in DB equals Tenant A ID, NOT the spoofed Tenant B ID",
      createdPageDoc && String(createdPageDoc.tenantId) === String(tenantAId) && String(createdPageDoc.tenantId) !== String(tenantBId)
    );
    assert(
      'Document was NOT saved to Tenant B',
      createdInTenantBDoc === null
    );

    // 12c. PATCH update operation with spoofed tenantId (cannot redirect or reassign document)
    const updatePageRes = await makeRequest(server, {
      path: `/api/v1/admin/pages/${createdPageDoc._id || createdPageDoc.id}`,
      method: 'PATCH',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tenantAAdminToken}`
      }
    }, {
      title: 'Spoofed Page Updated Title',
      tenantId: String(tenantBId) // Attempt to reassign document to Tenant B!
    });
    assert('PATCH /api/v1/admin/pages/:id with spoofed tenantId succeeds (200)', updatePageRes.status === 200);

    const updatedPageDoc = await Models.Page.findOne({ _id: createdPageDoc._id || createdPageDoc.id, tenantId: tenantAId }).lean();
    assert(
      'Updated page document tenantId remains Tenant A ID and cannot be modified via body',
      updatedPageDoc && String(updatedPageDoc.tenantId) === String(tenantAId) && String(updatedPageDoc.tenantId) !== String(tenantBId),
      `Stored tenantId: ${updatedPageDoc?.tenantId}, Expected: ${tenantAId}`
    );
    assert(
      'Updated title was persisted correctly under Tenant A',
      updatedPageDoc && updatedPageDoc.title === 'Spoofed Page Updated Title'
    );

    // Confirm Tenant B query cannot locate this document
    const tenantBQuery = await Models.Page.findOne({ slug: spoofedSlug, tenantId: tenantBId }).lean();
    assert('Document is completely absent from Tenant B query', tenantBQuery === null);

    // -------------------------------------------------------------
    // TEST 13: SuperAdmin Action Audit Logging
    // -------------------------------------------------------------
    console.log('\n--- 13. SuperAdmin Action Audit Logging ---');
    // 13a. Create temporary tenant to suspend and audit
    const auditTestTenant = await db.Tenant.create({
      name: 'Audit Test Univ',
      domain: 'audit-test.edu',
      status: 'active',
      plan: 'standard'
    });
    const auditTenantId = String(auditTestTenant._id || auditTestTenant.id);

    // 13b. Suspend the tenant via SuperAdmin API
    const auditSuspendRes = await makeRequest(server, {
      path: `/superadmin/tenants/${auditTenantId}/suspend`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert('SuperAdmin suspended audit test tenant', auditSuspendRes.status === 200);

    // 13c. Query SuperAdminAuditLog from database
    const auditLogEntry = await Models.SuperAdminAuditLog.findOne({
      targetTenantId: auditTenantId,
      action: 'tenant_suspended'
    }).lean();

    assert('SuperAdminAuditLog entry created on suspension', auditLogEntry !== null);
    assert(
      'Audit entry records correct action and targetTenantId',
      auditLogEntry && auditLogEntry.action === 'tenant_suspended' && String(auditLogEntry.targetTenantId) === auditTenantId
    );
    assert(
      'Audit entry records correct superAdminId',
      auditLogEntry && !!auditLogEntry.superAdminId && String(auditLogEntry.superAdminId).length > 0
    );
    assert(
      'Audit entry contains metadata and timestamp',
      auditLogEntry && !!auditLogEntry.timestamp && auditLogEntry.metadata?.domain === 'audit-test.edu'
    );

    // 13d. GET /superadmin/audit-log query with filter and pagination
    const auditQueryRes = await makeRequest(server, {
      path: `/superadmin/audit-log?tenantId=${auditTenantId}&action=tenant_suspended&page=1&limit=10`,
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert('GET /superadmin/audit-log responds with 200', auditQueryRes.status === 200);
    assert('GET /superadmin/audit-log returns paginated list', auditQueryRes.data?.success && Array.isArray(auditQueryRes.data?.data));
    assert(
      'GET /superadmin/audit-log filtered results match target tenant',
      auditQueryRes.data?.data?.length > 0 && String(auditQueryRes.data.data[0].targetTenantId) === auditTenantId
    );

    // Cleanup audit test tenant
    await db.Tenant.deleteOne({ _id: auditTestTenant._id || auditTestTenant.id });

    // -------------------------------------------------------------
    // TEST 14: JWT Expiry Strategy & Refresh Mechanism
    // -------------------------------------------------------------
    console.log('\n--- 14. JWT Expiry Strategy & Refresh Mechanism ---');
    
    // 14a. SuperAdmin JWT Expiry is configured to 1 hour (3600 seconds)
    const superAdminLoginCheck = await makeRequest(server, {
      path: '/superadmin/login',
      method: 'POST',
      headers: { 'X-Forwarded-For': '10.0.0.99' }
    }, {
      username: 'superadmin',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123'
    });
    assert('SuperAdmin login responds 200', superAdminLoginCheck.status === 200);
    const superTokenDecoded = jwt.decode(superAdminLoginCheck.data?.token);
    const superExpiryWindowSec = superTokenDecoded.exp - superTokenDecoded.iat;
    assert('SuperAdmin JWT token lifespan is exactly 1 hour (3600s)', superExpiryWindowSec === 3600);

    // 14b. Tenant Admin JWT Expiry is configured to 8 hours (28800 seconds)
    const tenantLoginCheck = await makeRequest(server, {
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { Host: 'college-alpha.edu' }
    }, {
      username: 'admin_alpha',
      password: 'AlphaAdmin@123'
    });
    assert('Tenant Admin login responds 200', tenantLoginCheck.status === 200);
    const tenantTokenDecoded = jwt.decode(tenantLoginCheck.data?.token);
    const tenantExpiryWindowSec = tenantTokenDecoded.exp - tenantTokenDecoded.iat;
    assert('Tenant Admin JWT token lifespan is exactly 8 hours (28800s)', tenantExpiryWindowSec === 28800);

    // 14c. Expired token is rejected with 401 Unauthorized
    const expiredTenantToken = jwt.sign(
      { id: adminA._id || adminA.id, username: adminA.username, email: adminA.email, tenantId: tenantAId },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );
    const expiredAccessRes = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${expiredTenantToken}`
      }
    });
    assert('Expired token is rejected with 401 Unauthorized', expiredAccessRes.status === 401);

    // 14d. Valid token within expiry window is accepted (200 OK)
    const validAccessRes = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tenantLoginCheck.data?.token}`
      }
    });
    assert('Valid token within expiry window is accepted with 200 OK', validAccessRes.status === 200);

    // 14e. Refresh endpoint issues a new valid token without requiring re-login
    const refreshRes = await makeRequest(server, {
      path: '/auth/refresh',
      method: 'POST',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tenantLoginCheck.data?.token}`
      }
    });
    assert('POST /auth/refresh responds with 200 OK', refreshRes.status === 200);
    assert('Refresh endpoint returns a fresh token', !!refreshRes.data?.token && refreshRes.data.token !== tenantLoginCheck.data.token);
    
    const refreshedToken = refreshRes.data.token;
    const refreshedDecoded = jwt.decode(refreshedToken);
    assert('Refreshed token has 8-hour lifespan', (refreshedDecoded.exp - refreshedDecoded.iat) === 28800);
    assert('Refreshed token preserves tenantId', String(refreshedDecoded.tenantId) === String(tenantAId));

    // Use refreshed token on protected endpoint
    const postRefreshAccess = await makeRequest(server, {
      path: '/api/v1/admin/analytics',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${refreshedToken}`
      }
    });
    assert('Refreshed token successfully authenticates protected route', postRefreshAccess.status === 200);

    // 14f. Refresh endpoint rejects expired tokens with 401
    const refreshExpiredRes = await makeRequest(server, {
      path: '/auth/refresh',
      method: 'POST',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${expiredTenantToken}`
      }
    });
    assert('Refresh endpoint rejects expired tokens with 401 Unauthorized', refreshExpiredRes.status === 401);

    // -------------------------------------------------------------
    // TEST 15: Domain-Username Matching Condition & Username Lock
    // -------------------------------------------------------------
    console.log('\n--- 15. Domain-Username Matching & Username Immutability ---');

    // 15a. Admin login with matching domain/subdomain succeeds (200)
    const matchingDomainLoginRes = await makeRequest(server, {
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { Host: 'college-alpha.edu' }
    }, {
      username: 'college-alpha.edu',
      password: 'AlphaAdmin@123'
    });
    assert('Admin login with username matching domain (college-alpha.edu) succeeds with 200 OK', matchingDomainLoginRes.status === 200);

    // 15b. Admin login with mismatched domain username is blocked (403 Forbidden)
    const mismatchedDomainLoginRes = await makeRequest(server, {
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { Host: 'college-alpha.edu' }
    }, {
      username: 'college-beta.edu',
      password: 'BetaAdmin@123'
    });
    assert('Admin login with mismatched college username is blocked with 403 Forbidden', mismatchedDomainLoginRes.status === 403);
    assert('Mismatched login returns domain access restriction message', mismatchedDomainLoginRes.data?.message?.includes('Admin username must match the college domain'));

    // 15c. Admin cannot change username via profile update (400 Bad Request)
    const usernameChangeAttemptRes = await makeRequest(server, {
      path: '/api/v1/auth/profile',
      method: 'PUT',
      headers: {
        Host: 'college-alpha.edu',
        Authorization: `Bearer ${tenantLoginCheck.data?.token}`
      }
    }, {
      username: 'hacked_new_admin_username',
      currentPassword: 'AlphaAdmin@123'
    });
    assert('Admin attempting to change username is rejected with 400 Bad Request', usernameChangeAttemptRes.status === 400);
    assert('Username change rejection explains username is bound to college domain', usernameChangeAttemptRes.data?.message?.includes('bound to your college domain'));

    // -------------------------------------------------------------
    // TEST 16: SuperAdmin Tenant Deletion Option
    // -------------------------------------------------------------
    console.log('\n--- 16. SuperAdmin Tenant Deletion ---');

    // 16a. Attempting to delete localhost root tenant is blocked with 400
    const defaultTenant = await db.Tenant.findOne({ domain: 'localhost' });
    const deleteRootRes = await makeRequest(server, {
      path: `/superadmin/tenants/${defaultTenant._id || defaultTenant.id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('Attempting to delete root localhost tenant is blocked with 400 Bad Request', deleteRootRes.status === 400);

    // 16b. SuperAdmin can delete a college tenant
    const tempTenant = await db.Tenant.create({
      name: 'Temp College to Delete',
      domain: 'temp-delete.edu',
      status: 'active'
    });
    const tempId = String(tempTenant._id || tempTenant.id);

    const deleteCollegeRes = await makeRequest(server, {
      path: `/superadmin/tenants/${tempId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('SuperAdmin DELETE /superadmin/tenants/:id succeeds with 200 OK', deleteCollegeRes.status === 200);

    const checkDeleted = await db.Tenant.findById(tempId);
    assert('Deleted tenant no longer exists in database', checkDeleted === null);

    // -------------------------------------------------------------
    // TEST 17: SuperAdmin Profile Management & Root Security
    // -------------------------------------------------------------
    console.log('\n--- 17. SuperAdmin Profile Management ---');

    // 17a. GET /superadmin/profile returns SuperAdmin details
    const getSuperProfileRes = await makeRequest(server, {
      path: '/superadmin/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('GET /superadmin/profile succeeds with 200 OK', getSuperProfileRes.status === 200);
    assert('Profile returns superadmin username and role', getSuperProfileRes.data?.superAdmin?.username === 'superadmin' && getSuperProfileRes.data?.superAdmin?.role === 'superadmin');

    // 17b. PUT /superadmin/profile updates name and email
    const updateSuperProfileRes = await makeRequest(server, {
      path: '/superadmin/profile',
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    }, {
      fullName: 'Master Platform SuperAdmin',
      email: 'root-security@apex-platform.org'
    });
    assert('PUT /superadmin/profile updates profile details with 200 OK', updateSuperProfileRes.status === 200);
    assert('Updated full name and email are reflected', updateSuperProfileRes.data?.superAdmin?.fullName === 'Master Platform SuperAdmin' && updateSuperProfileRes.data?.superAdmin?.email === 'root-security@apex-platform.org');

    // 17c. Tenant admin token cannot access /superadmin/profile
    const tenantAccessProfileRes = await makeRequest(server, {
      path: '/superadmin/profile',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tenantLoginCheck.data?.token}`
      }
    });
    assert('Tenant admin attempting to access /superadmin/profile is blocked with 403 Forbidden', tenantAccessProfileRes.status === 403);

    // -------------------------------------------------------------
    // TEST 18: SuperAdmin Database & Storage Explorer
    // -------------------------------------------------------------
    console.log('\n--- 18. SuperAdmin Database & Storage Explorer ---');

    // 18a. GET /superadmin/database returns real-time MongoDB statistics & collections
    const getDbRes = await makeRequest(server, {
      path: '/superadmin/database',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('GET /superadmin/database succeeds with 200 OK', getDbRes.status === 200);
    assert('Database response contains connected database metadata', getDbRes.data?.database?.connected !== undefined && getDbRes.data?.database?.provider);
    assert('Database response lists registered collections', Array.isArray(getDbRes.data?.collections) && getDbRes.data?.collections.length > 0);
    assert('Database response includes per-tenant data distribution', Array.isArray(getDbRes.data?.tenantDistribution));

    // 18b. POST /superadmin/database/ping measures roundtrip latency
    const pingDbRes = await makeRequest(server, {
      path: '/superadmin/database/ping',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('POST /superadmin/database/ping succeeds with 200 OK', pingDbRes.status === 200);
    assert('Ping returns positive latency measurement (ms)', typeof pingDbRes.data?.latencyMs === 'number');

    // 18c. POST /superadmin/database/verify-integrity runs cross-tenant data audit
    const verifyIntegrityRes = await makeRequest(server, {
      path: '/superadmin/database/verify-integrity',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('POST /superadmin/database/verify-integrity succeeds with 200 OK', verifyIntegrityRes.status === 200);
    assert('Integrity response returns auditResults for tenant-scoped collections', Array.isArray(verifyIntegrityRes.data?.auditResults));

    // 18d. GET /superadmin/health returns platform metrics and db status
    const getHealthRes = await makeRequest(server, {
      path: '/superadmin/health',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminLoginCheck.data?.token}`
      }
    });
    assert('GET /superadmin/health succeeds with 200 OK', getHealthRes.status === 200 && getHealthRes.data?.status === 'healthy');

    // 18e. Tenant admin is blocked from database explorer
    const tenantAccessDbRes = await makeRequest(server, {
      path: '/superadmin/database',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tenantLoginCheck.data?.token}`
      }
    });
    assert('Tenant admin attempting to access /superadmin/database is blocked with 403 Forbidden', tenantAccessDbRes.status === 403);

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 MULTI-TENANT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMultiTenantTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
