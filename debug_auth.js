const API_URL = 'http://localhost:3001/api';

async function test() {
    console.log('1. Logging in as Sale...');
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'sale@test.com', password: 'sale123' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const { token, user } = await loginRes.json();
        console.log('User:', user);

        console.log('\n2. Testing Reject Endpoint (using random ID 9999)...');
        // We expect 404 if authorized, 403 if unauthorized
        const res = await fetch(`${API_URL}/requests/9999/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rejection_reason: 'Test reject' })
        });

        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Response:', data);

        if (res.status === 403) {
            console.error('FAIL: Authorized failed (403)');
        } else if (res.status === 404) {
            console.log('SUCCESS: Authorization passed (got 404 as expected)');
        } else {
            console.log('Unexpected status:', res.status);
        }
    } catch (err) {
        console.error('Test error:', err);
    }
}

test();
