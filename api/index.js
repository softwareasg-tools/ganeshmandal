/**
 * Vercel Serverless Function Handler
 * Boots the Ganpati Festival Intelligence API & In-Memory Database
 */

import { createApp } from '../server/index.js';
import { initializeSeedData } from '../server/seedData.js';
import { db } from '../server/db.js';

let initialized = false;

function getApp() {
  if (!initialized) {
    initializeSeedData(db);
    initialized = true;
  }
  return createApp();
}

const app = getApp();

export default app;
