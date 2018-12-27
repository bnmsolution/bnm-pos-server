export const parsetTenantId = (req: any, res, next) => {
  const namespace = 'https://bnm.com/';
  console.log('parsetTenantId')
  if (req.user) {
    const app_metadata = req.user[namespace + 'app_metadata'];
    if (app_metadata) {
      req.user.tenantId = app_metadata.tenantId;
    }
  }
  next();
};
