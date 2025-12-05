# EmailJS Setup Instructions

After clicking "Create Accounts", users will receive an email with their login credentials. To set this up:

## 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Copy the **Service ID**

## 3. Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:** Your M2H Portal Login Credentials

**Content:**
```
Hello {{to_name}},

Your account has been created for the M2H Portal. Here are your login credentials:

Email: {{user_email}}
Password: {{user_password}}

Please log in at your earliest convenience and consider changing your password for security.

Best regards,
{{from_name}}
```

4. Save the template and copy the **Template ID**

## 4. Get Public Key
1. Go to "Account" > "General"
2. Copy your **Public Key**

## 5. Update Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your EmailJS credentials:
```
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## 6. Test the Implementation
1. Restart your development server
2. Go to the Register page
3. Fill in a test user with your own email
4. Click "Create Accounts"
5. Check your email for the credentials

## Template Variables Used
- `{{to_name}}` - User's full name
- `{{to_email}}` - User's email address
- `{{user_email}}` - User's email (for credentials)
- `{{user_password}}` - Generated password
- `{{from_name}}` - Set to "M2H Portal Admin"

## Free Tier Limits
EmailJS free tier includes:
- 200 emails per month
- Basic email templates
- Standard support

For production use with higher volume, consider upgrading to a paid plan.