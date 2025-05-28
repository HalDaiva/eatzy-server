# Firebase Setup Guide

## Generating Firebase Private Key
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select "eatzy" project
3. Navigate to Project Settings
4. Go to "Service Accounts" tab
5. Click "Node.js" and select "Generate New Private Key"

## Project Setup
1. In the root of your Node.js project, locate the `/firebase` directory
2. Place the newly generated private key file (format: `eatzy-45153-*.json`) in this directory
3. The final path should look like: `eatzy-server/firebase/eatzy-45153-*.json`

## Important Notes
- The `/firebase` directory is already added to `.gitignore` to ensure sensitive credentials are not committed
- Keep your private key file secure and never share it publicly
- Make sure to backup your private key file in a secure location