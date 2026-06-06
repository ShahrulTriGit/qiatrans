const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'qiatrans-9a114';

async function main() {
  const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  });

  const client = await auth.getClient();

  // List existing web apps
  console.log('=== Existing Web Apps ===');
  const listRes = await client.request({
    url: `https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps`,
    method: 'GET',
  });
  console.log(JSON.stringify(listRes.data, null, 2));
  const apps = listRes.data.apps || [];

  let appId;
  if (apps.length > 0) {
    appId = apps[apps.length - 1].appId;
    console.log(`\nUsing existing app: ${appId}`);
  } else {
    // Create web app (without appId to let server generate it)
    console.log('\n=== Creating Web App ===');
    const createRes = await client.request({
      url: `https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps`,
      method: 'POST',
      data: { displayName: 'QiaTrans' },
    });
    const opName = createRes.data.name;
    console.log(`Operation: ${opName}`);

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const opRes = await client.request({
        url: `https://firebase.googleapis.com/v1beta1/${opName}`,
        method: 'GET',
      });
      if (opRes.data.done) {
        console.log('Done:', JSON.stringify(opRes.data.response, null, 2));
        appId = opRes.data.response.appId;
        break;
      }
      console.log(`  Waiting... (${i + 1}s)`);
    }
  }

  // Get config
  if (appId) {
    console.log(`\n=== Config for ${appId} ===`);
    const configRes = await client.request({
      url: `https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps/${appId}/config`,
      method: 'GET',
    });
    console.log(JSON.stringify(configRes.data, null, 2));
  }

  // Try to find OAuth client through GCP APIs
  console.log('\n=== GCP OAuth Clients ===');
  
  // Try the new IAM v2 API endpoint
  const endpoints = [
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/oauthClients`,
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/oauthClientCredentials`,
    `https://www.googleapis.com/oauth2/v1/projects/${PROJECT_ID}/oauth2Clients`,
    `https://www.googleapis.com/oauth2/v1/projects/${PROJECT_ID}/clients`,
  ];

  for (const url of endpoints) {
    try {
      const res = await client.request({ url, method: 'GET' });
      console.log(`\n${url}:`, JSON.stringify(res.data, null, 2));
    } catch (e) {
      console.log(`\n${url}: ${e.message}`);
    }
  }

  console.log('\n✅ Script selesai.');
}

main().catch(console.error);
