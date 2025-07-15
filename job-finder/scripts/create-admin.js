#!/usr/bin/env node
/* eslint-disable */

require('dotenv').config();
const { clerkClient } = require('@clerk/clerk-sdk-node');
const mongoose = require('mongoose');

async function main() {
  const {
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password,
    ADMIN_USERNAME: username,
    ADMIN_PHONE: phoneNumber,
    MONGODB_URI: mongoUri
  } = process.env;

  if (!email || !password || !username || !phoneNumber || !mongoUri) {
    console.error(
      '⚠️  Définis ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_PHONE, et MONGODB_URI dans ton .env'
    );
    process.exit(1);
  }

  // 1) Création de l’utilisateur dans Clerk
  const clerkUser = await clerkClient.users.createUser({
    emailAddress: [email],
    password,
    username,
    phoneNumber: [phoneNumber],
    publicMetadata: { role: 'ADMIN' }
  });
  console.log('✅  Clerk user créé:', clerkUser.id);

  // 2) Connexion à MongoDB
  await mongoose.connect(mongoUri);

  // 3) Définition inline du schéma User
  const userSchema = new mongoose.Schema({
    email:              { type: String, required: true, unique: true },
    plan:               { type: String, default: 'FREE' },
    role:               { type: String, default: 'ADMIN' },
    subscriptionStatus: { type: String, default: 'active' },
    stripeCustomerId:   String,
    stripeSubscriptionId:String,
    phoneNumber:        String,
    createdAt:          { type: Date, default: Date.now }
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  // 4) Création de l’utilisateur en base locale
  const newUser = await User.create({
    email,
    plan: 'FREE',
    role: 'ADMIN',
    subscriptionStatus: 'active',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    phoneNumber
  });
  console.log('✅  Local DB user créé:', newUser._id);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
