import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase Admin (Hardcoded for demo)
  const serviceAccount = {
    "type": "service_account",
    "project_id": "gen-lang-client-0332467424",
    "private_key_id": "4d88d5ebe4493df75a6a4de8aa848180dd7d288b",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDASbHCoJTTXN6O\ni6s6HbgVIYkAEafvk4cfnRsHsjd+JXCEkSV6trP/mQERCpUho+jjuxZTlw9FV457\n9fCRLUDxoMM+6DnRqBZQsKpq+PHoaun4j7wvnsU428kLPAL5JT+JaA56XWKvxeqc\nh5Zd8bczBkSAJolmMe23CGX57MEet7JJE3CdrCcJFVF2jpwYbqgyf8VlX0g+xcvS\np6/2lS9gxWNRpcSM0eVd3vQai43HTDiR42L4WejtO3STP8LrfXIrI7a1u6ZA9Amr\nlt0J7ST8W+V1TfRdzynVyeLbCNxp+JUzDNIJYiVuDzsl3nARNgnI09uLP/PtVm8N\nTPV5eehnAgMBAAECggEACDQHT+zahWz513Fn8TH90wK8BPNKGc/coG/c062PQvIa\nnU78WAJsCd1YYjEtRf9ZWusgdGCxE/ogJ+VzkHGH5zGwdHQGrTfabL/wP+/SO/Bv\nRU9EfBsm5T34drfmI68cV5RyFwIWc5npJ2JgF4PqCMZy5eYGFsux1GJf5K/Byke6\nFyrB9aVBb6pKYXKH5tTxlDh5BereZmi145lKsmT8fSSTqfeR3jZFcWBILpjkqqKP\nev7cdLDKHrEuqK/zCSSNAQt7wIrDER6EmKQfJi+e8wNvzHDYUiffeoI92mGG7aEu\nqjNUKN/4fmzbGCjybBAOe2NJi7mpjfcSWD5tlQexqQKBgQDsqcPBXDbBXCRRxOWW\nphmjA4wLAzoMvWOfNPwZAfmuTdC+gsMsrIQt5jfswo3Erone9l57ZdkaYFPdg5m4\n1ihDdRmgvoZVhmEKERT+W7yNOTlyhuRQUYutdOONH9wPuyssl19illgL8syX7wlA\nc6iO+RubQIwoLhbFMgZwWabS8wKBgQDP/72zgxbtW9yoTkq9jomZ0Nnf8xRI2SGl\nW/PBRBfBdicvFFwsa+oL3Bd8+Pj60WP1VfYGY3+qFabaeT8WPhsg1J4UlGfIMup0\n/jwt2BXvg1ncncxy7esMk13NOZQa7KC4IZLek/ri/E/Q1NtHEJqAxe72BdvAtlSA\ VuVrCavpvQKBgQCeG0BLQpbWEP+2nQsg3PDNpgX+KXazoicW6qfs8RPkLdpiHCvW\ AZ8Apwf/pW5e0pgLG569Y6pp46bDmzKseG5HusiXShGmu3LC7eyPjavm0S8e4x1O\nx1vAUxHea0VyQQGz9aDk1ToXKWsjqa8NnvciJSwbSUEZaskNjsEcd9hqnwKBgAxB\nz9YCRZmbLjek1XayLZ2o1w4BbxKT6Q2ri4O6FYRLCCgYFQ5xFYu5XpD4wwNUz4Un\maXqux00xW5ecr9GzaZzoRUpYaxEg9h9GuLAtxo0LVl42xFyv8Uv8fkkCXxEsXvo\nTpVbNw+lOrbdtEZNzi0EfP52feqvU+90L3TNTxopAoGBAL3+V7udM6xcvK9DstM9\nMIeDFco8M4fGfYbtwk151XQjer8F+IXvCQhhuyElchJ2YKK6STfMkfJjAYshWAcB\n6c/kxrS/o8R5NpLeda3eBaj4bG3yES0LMGsVen9id2zqDo1/m9IiFhc8ssX8tEh2\nRdk55/94Qqjx6UwyWrgfKMMp\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@gen-lang-client-0332467424.iam.gserviceaccount.com",
    "client_id": "114113854550254261785",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gen-lang-client-0332467424.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log("Firebase Admin initialized");
  } catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
  }

  // API Route to send notifications
  app.post("/api/notify", async (req, res) => {
    const { tokens, title, body } = req.body;

    if (!tokens || !tokens.length || !title || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!admin.apps.length) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title,
          body,
        },
      });
      res.json({ success: true, response });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
