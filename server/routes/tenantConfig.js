const express = require('express');
const router = express.Router();

// GET tenant branding and public configuration
router.get('/', (req, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant context missing' });
  }

  return res.json({
    success: true,
    data: {
      tenantId: req.tenantId,
      collegeName: tenant.branding?.collegeName || tenant.name,
      logoUrl: tenant.branding?.logoUrl || '',
      primaryColor: tenant.branding?.primaryColor || '#0f172a',
      status: tenant.status,
      plan: tenant.plan,
      domain: tenant.domain,
      subdomain: tenant.subdomain
    }
  });
});

module.exports = router;
