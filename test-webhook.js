// Test Webhook Script for Production/Local Verification (ESM Version)
import axios from 'axios';
import { Buffer } from 'buffer';

// Default to localhost, or allow user to pass args
// In ESM, process.argv is available
const DOMAIN = process.argv[2] || 'http://localhost:3000';
const ENDPOINT = '/api/google-ads/batch-refresh-statuses';
const VERIFICATION_TOKEN = 'my-secret-token-123'; // As found in .env.development

console.log(`\n🚀 Preparing to test Webhook on: ${DOMAIN}`);
console.log(`🔑 Using Verification Token: ${VERIFICATION_TOKEN}`);

// Mock Payload matching Google Pub/Sub format + Audit Log structure we support
const mockPubSubPayload = {
    message: {
        data: Buffer.from(JSON.stringify({
            protoPayload: {
                methodName: "google.ads.googleads.v21.services.CustomerManagerLinkService.MutateCustomerManagerLink",
                resourceName: "customers/1234567890/customerManagerLinks/9876543210"
            }
        })).toString('base64'),
        messageId: "123456789",
        publishTime: new Date().toISOString()
    }
};

async function testWebhook() {
    try {
        console.log(`📡 Sending POST request to: ${DOMAIN}${ENDPOINT}...`);

        // Attempt request
        const response = await axios.post(`${DOMAIN}${ENDPOINT}`, mockPubSubPayload, {
            headers: {
                'Authorization': `Bearer ${VERIFICATION_TOKEN}`, // Fixed format
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ Success! Webhook accepted the request.');
        console.log(`📊 Status Code: ${response.status} ${response.statusText}`);
        console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ Error: Request Failed!');
        if (error.response) {
            // Server responded with a status code outside 2xx
            console.error(`🔴 Status: ${error.response.status}`);
            console.error(`📜 Headers:`, error.response.headers);
            console.error(`📉 Data:`, error.response.data);
        } else if (error.request) {
            // Request was made but no response
            console.error('⚠️ No response received from server. Is it running?');
        } else {
            // Something happened in setting up the request
            console.error('💥 Setup Error:', error.message);
        }
    }
}

// Run test
testWebhook();
