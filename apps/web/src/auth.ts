import { PublicClientApplication } from "@azure/msal-browser";

/** SPA identity adapter. Tokens authorize API reads; progress is never stored in browser storage. */
export interface PlayerAuth {
  signedIn: boolean;
  token: () => Promise<string>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

/** Initialize PKCE redirect sign-in against explicit existing-tenant registrations; no guest fallback. */
export async function initializeEntra(): Promise<PlayerAuth> {
  const authority = import.meta.env.VITE_ENTRA_AUTHORITY;
  const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
  const scope = import.meta.env.VITE_ENTRA_SCOPE;
  if (!authority || !clientId || !scope) throw new Error("Entra sign-in is not configured. Set the SPA authority, client ID and API scope before building.");
  const url = new URL(authority);
  if (url.protocol !== "https:") throw new Error("Entra authority must use HTTPS.");
  const app = new PublicClientApplication({
    auth: { authority, clientId, knownAuthorities: [url.hostname], redirectUri: window.location.origin },
    cache: { cacheLocation: "sessionStorage" },
  });
  await app.initialize();
  const redirect = await app.handleRedirectPromise();
  if (redirect?.account) app.setActiveAccount(redirect.account);
  const account = app.getActiveAccount() ?? app.getAllAccounts()[0];
  if (account) app.setActiveAccount(account);
  return {
    signedIn: Boolean(account),
    async token() {
      const current = app.getActiveAccount();
      if (!current) throw new Error("Sign in before loading saved progress.");
      const result = await app.acquireTokenSilent({ account: current, scopes: [scope] });
      return result.accessToken;
    },
    async signIn() { await app.loginRedirect({ scopes: [scope] }); },
    async signOut() { await app.logoutRedirect({ postLogoutRedirectUri: window.location.origin }); },
  };
}
