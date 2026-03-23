---
title: "Integrating Keycloak OIDC authentication in Flutter apps"
description: "Step-by-step guide to implement enterprise-grade SSO in your Flutter app using Keycloak and the flutter_appauth package."
pubDate: 2025-01-15
tags: ["flutter", "keycloak", "auth"]
---

## Why Keycloak for Flutter?

When building enterprise mobile applications, you often need a centralized identity provider that supports SSO, role-based access control, and multiple authentication flows. Keycloak is an open-source IAM solution that checks all these boxes and integrates well with mobile apps through OpenID Connect (OIDC).

## Prerequisites

- A running Keycloak instance (v20+)
- A Flutter project (3.x+)
- Basic understanding of OAuth 2.0 / OIDC flows

## Setting Up Keycloak

First, create a new client in your Keycloak realm:

1. Navigate to your realm's **Clients** section
2. Create a new client with **Client ID** set to your app identifier (e.g., `flutter-app`)
3. Set **Client authentication** to Off (public client — standard for mobile)
4. Add your redirect URI: `com.yourapp://callback`
5. Enable the **Authorization Code + PKCE** flow

## Flutter Implementation

Install the `flutter_appauth` package, which provides a solid wrapper around AppAuth for both iOS and Android:

```yaml
dependencies:
  flutter_appauth: ^6.0.0
  flutter_secure_storage: ^9.0.0
```

Create an auth service that handles the OIDC flow:

```dart
class AuthService {
  final FlutterAppAuth _appAuth = FlutterAppAuth();

  static const String _clientId = 'flutter-app';
  static const String _redirectUri = 'com.yourapp://callback';
  static const String _issuer = 'https://keycloak.example.com/realms/your-realm';

  Future<AuthorizationTokenResponse?> login() async {
    return await _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
        _clientId,
        _redirectUri,
        issuer: _issuer,
        scopes: ['openid', 'profile', 'email'],
      ),
    );
  }
}
```

## Token Storage

Always store tokens securely using `flutter_secure_storage`. Never store tokens in SharedPreferences or plain text.

## Token Refresh

Implement automatic token refresh to maintain seamless user sessions without requiring re-authentication.

## Conclusion

Keycloak + OIDC provides enterprise-grade authentication for Flutter apps with minimal client-side complexity. The `flutter_appauth` package handles the heavy lifting of the authorization code flow with PKCE, while Keycloak manages users, roles, and sessions server-side.
