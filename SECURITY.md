# Security Policy

## Supported Versions

Currently, we release updates and security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

The AI Crew team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [security contact to be added]

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit it

### What to Expect

* We will acknowledge receipt of your vulnerability report
* We will send you periodic updates about our progress
* We will notify you when the vulnerability is fixed
* We will publicly acknowledge your responsible disclosure (if you wish)

## Security Best Practices for Users

### API Keys

* **Never commit API keys** to version control
* Store API keys in `.env.local` (already gitignored)
* Rotate API keys regularly
* Use environment-specific API keys (dev/staging/prod)
* Consider using API key management services

### Deployment

* Use HTTPS in production
* Implement rate limiting for API endpoints
* Keep dependencies up to date (`npm audit`)
* Use environment variables for sensitive data
* Implement proper CORS policies

### Development

* Run `npm audit` regularly to check for vulnerabilities
* Keep Node.js and npm updated
* Review dependencies before adding them
* Follow the principle of least privilege

## Known Security Considerations

### API Keys in Browser

This application runs in the browser and requires API keys for AI providers. Please note:

* API keys are stored in environment variables server-side
* Never expose API keys in client-side code
* Consider implementing a backend proxy for production use
* Use API key restrictions (e.g., HTTP referrer restrictions, IP restrictions)

### AI Model Interactions

* Be aware that conversations may be stored by AI providers
* Review privacy policies of AI providers you use
* Don't send sensitive personal information to AI models
* Implement content filtering for production deployments

## Updates

This security policy may be updated from time to time. We will notify users of any significant changes.

---

Last updated: 2025-12-29
