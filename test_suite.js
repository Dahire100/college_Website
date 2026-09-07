// Comprehensive automated test suite
const http = require('node:http');

function apiCall(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SYSTEM VERIFICATION & INTEGRATION TESTS');
  console.log('====================================================\n');
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

  // 1. Health check
  console.log('1. Health & Server Connectivity:');
  const health = await apiCall({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  assert('Server health endpoint returns 200', health.status === 200);
  assert('Database status reported online', health.data?.status === 'online');

  // 2. Public Config API
  console.log('\n2. Public Configuration & Navigation:');
  const config = await apiCall({ hostname: 'localhost', port: 3000, path: '/api/v1/public/config', method: 'GET' });
  assert('Public config returns 200', config.status === 200);
  assert('Settings object exists', !!config.data?.data?.settings);
  assert('Navigation menu exists', Array.isArray(config.data?.data?.navigation) && config.data.data.navigation.length > 0);
  const hasTestProspectus = config.data?.data?.navigation?.some(n => n.title?.toLowerCase().includes('prospectus'));
  assert('Test Prospectus completely absent from header', !hasTestProspectus);

  // 3. Courses & Departments
  console.log('\n3. Academic Programs & Departments:');
  const courses = await apiCall({ hostname: 'localhost', port: 3000, path: '/api/v1/public/courses', method: 'GET' });
  assert('Courses API returns 200', courses.status === 200);
  assert('Courses list populated', Array.isArray(courses.data?.data) && courses.data.data.length > 0, `(${courses.data?.data?.length} courses found)`);

  const depts = await apiCall({ hostname: 'localhost', port: 3000, path: '/api/v1/public/departments', method: 'GET' });
  assert('Departments API returns 200', depts.status === 200);
  assert('Departments list populated', Array.isArray(depts.data?.data) && depts.data.data.length > 0, `(${depts.data?.data?.length} departments found)`);

  // 4. Student Inquiry Form Submission
  console.log('\n4. Student Inquiries Flow:');
  const inqRes = await apiCall({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/public/inquiries',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Automation Test Student',
    email: 'autotest@example.edu',
    phone: '9876543210',
    programInterested: 'B.Tech / D.Pharm Program',
    message: 'Automated verification inquiry test'
  });
  assert('Inquiry submission succeeds', inqRes.status === 201 || inqRes.status === 200, `(Status: ${inqRes.status})`);

  // 5. Admin Authentication
  console.log('\n5. Admin Security & Authentication:');
  const login = await apiCall({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Admin@123' });
  assert('Admin login successful', login.status === 200 && !!login.data?.token);
  const token = login.data?.token;

  // 6. Sub-Institutions (Group Mode verification)
  console.log('\n6. Multi-College Sub-Institutions API:');
  const subInst = await apiCall({ hostname: 'localhost', port: 3000, path: '/api/v1/public/sub-institutions', method: 'GET' });
  assert('Sub-institutions endpoint responsive', subInst.status === 200);

  // 7. Settings persistence
  console.log('\n7. Admin Settings API:');
  if (token) {
    const getSettings = await apiCall({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/settings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert('Admin can fetch site settings', getSettings.status === 200);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests().catch(console.error);
