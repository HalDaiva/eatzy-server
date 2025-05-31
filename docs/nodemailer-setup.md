# Nodemailer Email Setup Guide

## Google Account Configuration
1. Go to your Google Account settings at [myaccount.google.com](https://myaccount.google.com)
2. Navigate to Security
3. Find "How you sign in to Google" section
4. Click on "2-Step Verification"
5. Enable 2-Step Verification for your account
6. Make sure that 2-Step Verification is already enabled (you should see a green checkmark)

## Generate App Password
1. Visit [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Enter your application name (e.g., "eatzy")
3. Google will generate a 16-character password for your application
4. Save this password temporarily (you won't be able to see it again)

gdsu uhbm rdqc czqw

## Project Configuration
1. Locate the `.env` file in your project root
    - If it doesn't exist, create one based on `.env.example`
    - Make sure it already has the attributes defined in `.env.example`. If not, copy the necessary attributes
2. Update the following email-related environment variables:
   ```env
   EMAIL_ADDRESS="your.email@gmail.com"    # The Gmail address you used for 2-Step Verification
   EMAIL_APP_PASSWORD="your-app-password"  # The 16-character password Google generated
   EMAIL_HOST=smtp.gmail.com               # Keep as is
   EMAIL_PORT=587                          # Keep as is
   EMAIL_SECURE=false                      # Keep as is
   ```
## Send Emails
1. To see how you can send email, check `controllers/testController.js`
2. There, you will find a function called `sendEmail`
3. You can use that code as a reference to setup your code for sending emails

## Important Notes
- Keep your `.env` file secure and never commit it to version control
- The `.env` file is already included in `.gitignore`
- Store your app password securely; you'll need to generate a new one if lost
- One app password can be used for multiple development machines