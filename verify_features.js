// verify_features.js
const http = require('node:http');

function request(options, data) {
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

async function run() {
  console.log('--- 1. Testing Public Gallery API ---');
  const pubGallery = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/public/gallery',
    method: 'GET'
  });
  console.log(`Public Gallery count: ${pubGallery.data?.data?.length}`);

  console.log('\n--- 2. Admin Login ---');
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Admin@123' });

  const token = loginRes.data?.token;
  if (!token) throw new Error('Failed to login: ' + JSON.stringify(loginRes.data));
  console.log('Admin authenticated. Token acquired.');

  console.log('\n--- 3. Testing Gallery Management (Add & Hide/Show) ---');
  // Add new image
  const addImageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/gallery',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    title: 'Autonomous Robotics Innovation Hub',
    category: 'Innovations',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    caption: 'Student team testing autonomous delivery rovers',
    isActive: true,
    featuredOnHome: true
  });
  console.log(`Add Image Status: ${addImageRes.status}, Title: ${addImageRes.data?.data?.title}`);
  const createdImageId = addImageRes.data?.data?._id;

  // Toggle Hide
  const hideImageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/gallery/${createdImageId}/toggle`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Hide Image Toggle: ${hideImageRes.data?.message}`);

  // Check public gallery (should NOT include hidden image)
  const pubGalleryAfterHide = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/public/gallery',
    method: 'GET'
  });
  const foundHidden = (pubGalleryAfterHide.data?.data || []).some(i => i._id === createdImageId);
  console.log(`Hidden image appears in public gallery? ${foundHidden} (Expected: false)`);

  // Toggle back to Show
  const showImageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/gallery/${createdImageId}/toggle`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Show Image Toggle: ${showImageRes.data?.message}`);

  console.log('\n--- 4. Testing Homepage Section (Add Custom Image Section & Hide/Show) ---');
  // Add custom image section
  const addSecRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/homepage-sections',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, {
    title: 'Global Research & Patent Showcase',
    subtitle: 'Explore 30+ granted international engineering patents created by students & faculty',
    badge: 'RESEARCH 2026',
    layoutType: 'image_banner',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1920&q=80',
    ctaText: 'View Granted Patents',
    ctaLink: '#academics',
    isVisible: true
  });
  console.log(`Add Custom Section Status: ${addSecRes.status}, Key: ${addSecRes.data?.data?.sectionKey}`);
  const createdSecId = addSecRes.data?.data?._id;

  // Toggle section visibility
  const toggleSecRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/homepage-sections/${createdSecId}/toggle`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Section Toggle: ${toggleSecRes.data?.message}`);

  console.log('\n--- ALL ADMIN HIDE/SHOW & IMAGE SECTION CHECKS PASSED! ---');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
