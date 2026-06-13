# Frontend Integration Guide — ip-profile-service

**For:** Frontend (Web) and Android developers  
**Date:** June 2026  
**Status:** New stack deployed, ready for cutover

---

## The Short Version (TL;DR)

The profile backend has been rebuilt from scratch on a new, more reliable infrastructure.  
For you, there are **two things to change**:

1. **Update the API base URL** in your app
2. **Send one new header** (`X-User-Id`) on protected calls

That's it. Every endpoint path, method, and response shape stays exactly the same.

---

## Background — What Was There Before

The old backend was a manually deployed AWS Lambda function called `profile-manager`.  
It worked, but had a few silent problems that were affecting real users:

### Problem 1 — Razorpay payment links were being duplicated
Every time a user with an expired subscription opened the app, the backend called  
Razorpay and created a **brand new payment link**. If the user refreshed 10 times,  
10 different payment links were created. Razorpay started flagging the account for  
this behaviour.

### Problem 2 — Subscription amount was ₹0.01
Due to a leftover test value in the code, every payment link generated was for  
**₹0.01** instead of ₹2,358.82 (₹1,999 + 18% GST). Users could have paid ₹0.01  
and received a full 30-day subscription. This has been fixed.

### Problem 3 — The billing overview endpoint was open to anyone
`GET /Auth?action=billing_status&company=WH` returned names, emails, phone numbers  
and subscription dates for every user in a company — with no authentication.  
Anyone who knew a company ID could call it.

### Problem 4 — Profile updates had no identity check
`PUT /Auth` accepted updates with just an email in the body. There was nothing  
stopping one user from updating another user's profile if they knew their email.

### Problem 5 — Updates could lose data under concurrent writes
The update logic read the full record, changed it in memory, then wrote it back.  
If two updates happened at the same time, one would silently overwrite the other.

---

## What Changed in the New Stack

| Area | Before | After |
|---|---|---|
| Infrastructure | Manual Lambda, no version control | SAM (AWS Serverless Application Model) — every deploy is tracked |
| API Gateway | Old gateway `sg76vqy4vi` | New dedicated gateway `zlp6ym88u0` |
| Payment links | New link on every GET call | Link cached in user record, reused for 7 days |
| Subscription amount | ₹0.01 (bug) | ₹2,358.82 (₹1,999 + 18% GST) |
| Billing status auth | None — completely open | Requires `X-User-Id` header, admin-only |
| Profile update auth | None | Requires `X-User-Id` header, own record only |
| Duplicate registration | Returned 500 error | Returns 409 Conflict (correct) |
| Concurrent updates | Could lose data | Atomic — safe under concurrent writes |
| Lambda timeout | 3 seconds (too low) | 15 seconds |

---

## New API Endpoint

```
OLD: https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth
NEW: https://zlp6ym88u0.execute-api.ap-south-1.amazonaws.com/prod/Auth
```

**Change your base URL constant to the new one. Everything else stays the same.**

---

## New Header Required on Protected Calls

A new request header `X-User-Id` must be sent on two endpoints:

```
X-User-Id: <logged-in user's email address>
```

This tells the backend **who is making the request** so it can verify permissions.

### Where to send it

| Endpoint | X-User-Id required? |
|---|---|
| `POST /Auth` — register | ❌ No — public |
| `GET /Auth?Email=xxx` — login/fetch | ❌ No — public |
| `GET /Auth?action=billing_status` | ✅ Yes — admin check |
| `PUT /Auth` — update profile or company | ✅ Yes — identity check |

### Where to get the value

The logged-in user's email is already in the response from `GET /Auth`.  
Read `response.user.Email` and store it in your session/state.  
Send it back as the `X-User-Id` header on protected calls.

### What happens if you forget it

The backend returns `401 Unauthorized` with:
```json
{ "error": "X-User-Id header is required" }
```

---

## Endpoint Reference

### POST /Auth — Register new user

No changes. Still public.

**Request body:**
```json
{
  "email": "user@company.com",
  "phone": "+919999999999",
  "company": "WH",
  "role": "admin",
  "fullname": "John Doe",
  "adminemailid": "admin@company.com"
}
```

**Responses:**
```
201 Created     → { "message": "Profile created successfully" }
400 Bad Request → { "error": "email, phone and company are required" }
409 Conflict    → { "error": "User already exists" }   ← was 500 before, now correct
```

---

### GET /Auth?Email=user@company.com — Login / Fetch Profile

No changes. Still public. No new headers needed.

**Response (subscription active):**
```json
{
  "user": {
    "Email": "user@company.com",
    "Phone": "+919999999999",
    "company": "WH",
    "role": "admin",
    "fullname": "john doe",
    "subscription_status": "active",
    "subscription_end_date": "2026-07-05T10:00:00+00:00"
  },
  "organization": { ... company details ... },
  "access_restricted": false
}
```

**Response (subscription expired — payment needed):**
```json
{
  "user": { ... },
  "organization": { ... },
  "access_restricted": true,
  "payment_url": "https://rzp.io/i/xxxxxxx"
}
```

**What changed about `payment_url`:**  
Before: a fresh Razorpay link was generated on every single call.  
Now: the link is generated once and reused for 7 days. After the user pays,  
the link is automatically cleared from the cache. Calling this endpoint  
100 times in a row will hit Razorpay exactly **once**.

---

### GET /Auth?action=billing_status&company=WH — Billing Overview

Now requires `X-User-Id` header. Caller must be an admin of the requested company.

**Request:**
```
GET /Auth?action=billing_status&company=WH
X-User-Id: admin@winterfellholidays.com
```

**Response:**
```json
{
  "company": "WH",
  "count": 3,
  "users": [
    {
      "Email": "user1@winterfellholidays.com",
      "fullname": "tezal negi",
      "subscription_status": "active",
      "subscription_end_date": "2026-07-02T05:47:10+00:00",
      "Phone": "+919799794008"
    }
  ]
}
```

Sorted by `subscription_end_date` — soonest expiry first.

**Error responses:**
```
401 → { "error": "X-User-Id header is required" }
403 → { "error": "Admin access required" }
403 → { "error": "Access denied: company mismatch" }
```

---

### PUT /Auth — Update Profile or Company

Now requires `X-User-Id` header.  
Rules: you can only update your own profile. Only an admin can update the company record.

**Update user profile:**
```
PUT /Auth
X-User-Id: user@winterfellholidays.com
Content-Type: application/json

{
  "Email": "user@winterfellholidays.com",
  "Phone": "+919799794008",
  "fullname": "Tezal Negi"
}
```

**Update company record:**
```
PUT /Auth
X-User-Id: admin@winterfellholidays.com
Content-Type: application/json

{
  "Email": "admin@winterfellholidays.com",
  "company": "WH",
  "companyname": "Winterfell Holidays Pvt Ltd",
  "website": "https://winterfellholidays.com"
}
```

**Response:**
```json
{ "message": "Update successful" }
```

**Error responses:**
```
401 → { "error": "X-User-Id header is required" }
403 → { "error": "Cannot modify another user's profile" }
404 → { "error": "User record not found" }
```

**Fields you cannot update via PUT** (these are system-managed):
```
Email, Phone, company, role, subscription_status,
subscription_end_date, plan_id, authsessionkey
```

---

## Payment Flow — How It Works Now

```
1. User opens app, subscription expired
   → GET /Auth?Email=xxx
   → Backend checks cache: no payment_link_url stored yet
   → Backend calls Razorpay once → gets short URL
   → Backend stores URL in user's record (cached)
   → Response includes payment_url

2. User refreshes app 10 more times
   → GET /Auth?Email=xxx (x10)
   → Backend checks cache: payment_link_url exists, age < 7 days
   → Returns cached URL every time
   → Razorpay API: ZERO additional calls

3. User clicks payment link and pays
   → Razorpay fires webhook to backend
   → Backend activates subscription (status → "active", +30 days)
   → Backend clears payment_link_url from user record

4. User opens app after payment
   → GET /Auth?Email=xxx
   → subscription_status = "active" → access_restricted = false
   → No payment_url in response
   → App unlocks normally
```

---

## Razorpay Webhook — One-Time Update Needed

The Razorpay webhook URL has changed.  
**This needs to be updated in the Razorpay dashboard by the backend team.**

```
OLD webhook URL: (old subscription-webhook Lambda — being retired)
NEW webhook URL: https://j55d6jnqvsb3e2u54ltg67c55m0ifscr.lambda-url.ap-south-1.on.aws/
```

This is not a frontend task — just noting it here for awareness.  
Until this is updated, payments will still process via the old webhook.

---

## Summary of What You Need to Do

### Web app
```javascript
// Change this one constant
const API_BASE = "https://zlp6ym88u0.execute-api.ap-south-1.amazonaws.com/prod/Auth";

// Add this header on PUT and billing_status calls
headers: {
  "Content-Type": "application/json",
  "X-User-Id": currentUser.Email   // from your session/state
}
```

### Android app
```kotlin
// Change base URL
val BASE_URL = "https://zlp6ym88u0.execute-api.ap-south-1.amazonaws.com/prod/Auth"

// Add header on PUT and billing_status calls
.addHeader("X-User-Id", currentUser.email)
```

> **Note:** CORS does not apply to Android HTTP clients (Retrofit, OkHttp).  
> The `X-User-Id` header works the same way on both platforms.

---

## Old Endpoint (Being Retired)

```
https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/Auth
```

This will stay live during the transition period.  
Once you confirm the new endpoint is working, the old one will be decommissioned.  
**Do not build any new features against the old URL.**
