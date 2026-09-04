// UAFSAIDA — SSO/SAML Authentication Configuration
export interface SSOProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml';
  issuer: string;
  clientId: string;
  clientSecret: string;
  wellknown?: string;
}

export const ssoProviders: SSOProvider[] = [
  {
    id: 'okta',
    name: 'Okta',
    type: 'oauth',
    issuer: `https://${process.env.OKTA_DOMAIN}`,
    clientId: process.env.OKTA_CLIENT_ID || '',
    clientSecret: process.env.OKTA_CLIENT_SECRET || '',
    wellknown: `https://${process.env.OKTA_DOMAIN}/.well-known/openid-configuration`,
  },
  {
    id: 'azure-ad',
    name: 'Azure AD',
    type: 'oauth',
    issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    wellknown: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    type: 'oauth',
    issuer: 'https://accounts.google.com',
    clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET || '',
  },
];

// Role assignment based on SSO groups/claims
export function assignRoleFromClaims(claims: any): string {
  const groups = claims.groups || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/group'] || [];
  
  if (groups.includes('UAFSAIDA_Admins') || groups.includes('admin')) {
    return 'admin';
  }
  if (groups.includes('UAFSAIDA_Editors') || groups.includes('editor')) {
    return 'editor';
  }
  return 'viewer';
}

// Check if SSO is configured
export function isSSOConfigured(): boolean {
  return ssoProviders.some(p => p.clientId && p.clientSecret);
}
