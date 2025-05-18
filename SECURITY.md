# Security Policy

## Supported Versions

The following versions of Simple Scale Solutions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of Simple Scale Solutions seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email us directly at security@simplescalesolutions.com** with details about the vulnerability
3. Include the following information in your report:
   - Type of vulnerability
   - Full path of source file(s) related to the issue
   - Any special configuration required to reproduce the issue
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability

## What to expect

- We will acknowledge receipt of your vulnerability report within 3 business days
- We will provide a more detailed response within 10 business days, including our assessment of the vulnerability and an estimated timeline for a fix
- We will keep you informed about our progress
- We will notify you when the vulnerability has been fixed

## Security Measures

This project implements the following security measures:

- All API endpoints are protected with proper authentication and authorization
- Row Level Security (RLS) is implemented in the database to ensure data isolation
- All sensitive data is encrypted at rest and in transit
- Regular security audits and penetration testing
- Automated vulnerability scanning with Dependabot
- Code scanning with GitHub CodeQL

## Security Best Practices for Contributors

If you're contributing to this project, please follow these security best practices:

1. Never commit sensitive information such as API keys, passwords, or tokens
2. Use environment variables for all sensitive configuration
3. Follow the principle of least privilege when implementing new features
4. Validate all user inputs and implement proper error handling
5. Keep dependencies up to date
6. Write tests that verify security controls are working as expected

## Responsible Disclosure

We believe in responsible disclosure and will work with security researchers to verify and address vulnerabilities. We appreciate your efforts to responsibly disclose your findings.

## Security Updates

Security updates will be released as part of our regular release cycle or as emergency patches depending on severity.
