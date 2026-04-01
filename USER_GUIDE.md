# CoolTech Credential Manager — User Guide

> **Important:** This is a **demo model**. All pre-loaded data (organisations, divisions, users, credentials) is sample data for demonstration purposes only. No real credentials or sensitive information are included.
>
> When you deploy this application for your own use, you replace the demo data with your organisation's real structure and credentials.

---

## What This Application Does

CoolTech Credential Manager is a secure, web-based vault for storing and sharing credentials within a team or organisation. It replaces shared spreadsheets, sticky notes, and insecure text files with a centralised, encrypted, access-controlled system.

**Core capabilities:**
- Store credentials (usernames, passwords, API keys, server logins, etc.) in named repositories
- Organise repositories by team, department, or project
- Control who can see and edit which credentials using role-based access
- Search across all credentials you have access to
- Export credential lists to CSV or PDF for auditing
- Reset passwords securely via email
- Track all access and changes in an audit log

---

## How the Application Is Structured

```
Organisation
└── Organisational Unit (e.g. "Software Reviews")
    └── Division (e.g. "Development", "QA")
        └── Repository (e.g. "Dev Server Credentials")
            └── Credentials (username + encrypted password + metadata)
```

The hierarchy mirrors a typical company org chart. An admin sets up the structure and assigns users to the divisions they need access to.

---

## Demo Accounts

The application ships with four pre-created demo accounts to let you explore different permission levels immediately:

| Email | Password | Role | What they can access |
|-------|----------|------|---------------------|
| admin@cooltech.com | Admin123! | Admin | Everything — all OUs, all divisions, user management |
| manager@cooltech.com | Manager123! | Management | News Management OU only — can edit credentials |
| user@cooltech.com | User123! | User | Software Reviews → Development division only |
| multiuser@cooltech.com | Multi123! | User | Software Reviews + Opinion Publishing divisions |

> These accounts exist only in the demo database. They will be replaced when you seed your own data.

---

## Role Permissions

| Action | User | Management | Admin |
|--------|------|-----------|-------|
| View credentials in assigned divisions | ✅ | ✅ | ✅ |
| Add new credentials | ✅ | ✅ | ✅ |
| Edit existing credentials | ❌ | ✅ | ✅ |
| Delete credentials | ❌ | ✅ | ✅ |
| Export credentials (CSV/PDF) | ✅ | ✅ | ✅ |
| Manage users (assign roles, delete) | ❌ | ❌ | ✅ |
| Assign users to OUs/divisions | ❌ | ❌ | ✅ |
| View all divisions | ❌ | ❌ | ✅ |

---

## How to Use the Application

### Logging In
1. Go to the application URL
2. Enter your email address and password
3. Click **Sign In**

If you forget your password, click **Forgot Password** on the login page. A reset link will be sent to your email (requires SendGrid to be configured).

### Navigating the Dashboard
After login you land on the Dashboard, which shows:
- **Vault Stats** — total repositories, organisational units, and average credentials per OU
- **Repository Grid** — all repositories grouped by OU that you have access to

Click any repository card to open it and view credentials.

### Viewing and Copying a Credential
Inside a repository:
1. Find the credential in the table
2. Click the **eye icon** to view the full credential including the decrypted password
3. Click the **copy icon** next to any field to copy it to clipboard

Passwords are encrypted at rest and only decrypted when you explicitly click to view them.

### Adding a Credential (User, Management, Admin)
1. Open a repository
2. Click **+ Add Credential** (floating button, bottom right)
3. Fill in: name, username, password, category, URL (optional), notes (optional)
4. The password strength meter guides you toward a strong password
5. Use **Generate Password** to create a random strong password
6. Click **Add Credential**

### Editing a Credential (Management, Admin only)
1. Find the credential in the table
2. Click the **pencil icon**
3. Update any fields
4. Click **Save Changes**

### Deleting a Credential (Management, Admin only)
- Single: click the **trash icon** on the credential row
- Bulk: tick multiple credentials → click **Delete Selected**

### Searching
Use the search bar in the top navigation to search across all credentials you have access to. Results show the credential name, category, and which division it belongs to.

---

## Admin Tasks

### Creating a New User
1. New users self-register at `/register`
2. All self-registered users get the **User** role with no division access by default
3. An admin must then assign them to divisions via the Admin Panel

### Assigning a User to Divisions
1. Go to **Admin Panel** (top navigation, admin accounts only)
2. Click the **Assignments** tab
3. Search for the user
4. Check the OUs and divisions they should access
5. Click **Save Assignments**

### Changing a User's Role
1. Go to **Admin Panel → User Management**
2. Find the user in the table
3. Use the **Role** dropdown to change their role
4. The change takes effect on their next request (no re-login needed)

### Deleting a User
1. Go to **Admin Panel → User Management**
2. Find the user in the table
3. Click the **trash icon** in the Actions column
4. Confirm the deletion in the dialog

> Deleting a user removes their account and all access permanently. Their previously created credentials remain in the system.

---

## Installing for Your Own Use

### Option A: Run Locally (Development)

**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Credential-Management-System

# 2. Set up backend environment
cd backend
cp .env.example .env          # Edit .env with your values (see below)
npm install
npm run seed                   # Populates demo data

# 3. Start the backend
npm run dev                    # Runs on http://localhost:5000

# 4. Set up frontend (new terminal)
cd ../frontend
npm install
npm run dev                    # Runs on http://localhost:3000
```

**Required `.env` values for the backend:**
```
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cooltech-dev
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ENCRYPTION_KEY=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
FRONTEND_URL=http://localhost:3000
```

> **Email / password reset** works in development without SMTP — reset tokens are printed to the console instead of being sent by email.

### Option B: Deploy to Azure (Production)

Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) for full Azure deployment instructions. The application is pre-configured for:
- **Azure App Service** (backend Node.js API)
- **Azure Static Web Apps** (frontend React SPA)
- **Azure Cosmos DB** (MongoDB-compatible database)

After deploying, run the seed script against your production database to create the demo accounts, then replace demo data with your own through the Admin Panel.

### Replacing Demo Data With Your Own

Once the application is running:
1. Log in as `admin@cooltech.com`
2. Go to **Admin Panel → Assignments** to view the current OU/division structure
3. Use the admin panel to manage your structure, or run a custom seed script
4. Delete the four demo accounts once your own admin account is set up

---

## Security Notes

- All passwords are encrypted with AES-256-CBC before being stored in the database
- Passwords are never returned in API responses — they are only decrypted when you click "View"
- JWT access tokens expire after 30 minutes; sessions are automatically renewed silently
- After 5 failed login attempts, an account is locked for 30 minutes
- Password reset tokens are single-use and expire after a short window
- All admin actions (role changes, deletions, access) are recorded in the audit log

---

## Limitations of the Demo Model

| Limitation | Notes |
|-----------|-------|
| Email to spam folder | The demo uses a free Gmail sender via SendGrid — no SPF/DKIM on a custom domain. Set up your own domain for production. |
| Free tier cold starts | The Azure App Service free tier sleeps after inactivity. First request after sleep takes ~5s. Upgrade to a paid tier for always-on. |
| No custom domain | The demo uses default Azure URLs. Add a custom domain in App Service settings for production use. |
| No 2FA | Two-factor authentication is not yet implemented. |

---

*Application version: 1.0 — March 2026*
