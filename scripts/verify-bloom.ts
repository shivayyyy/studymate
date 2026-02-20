
const API_URL = 'http://localhost:3001/api/v1';

async function main() {
    try {
        const timestamp = Date.now();
        const username = `bloom_user_${timestamp}`;

        console.log(`1. Checking availability for NEW username: ${username}`);
        const check1Res = await fetch(`${API_URL}/users/check-availability?username=${username}`);
        const check1 = await check1Res.json();

        if (!check1.success || !check1.data.available) {
            console.error('FAILURE: New username should be available', check1);
            process.exit(1);
        }
        console.log('SUCCESS: Username is available.');

        console.log(`2. Registering user: ${username}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${username}@example.com`,
                username: username,
                password: 'Password123!',
                fullName: 'Bloom Tester',
                examCategory: 'JEE',
                subjects: ['Physics'],
                targetYear: 2026
            })
        });

        if (!regRes.ok) {
            const err = await regRes.json();
            throw new Error(`Register failed: ${JSON.stringify(err)}`);
        }
        console.log('User registered.');

        console.log(`3. Checking availability for REGISTERED username: ${username}`);
        const check2Res = await fetch(`${API_URL}/users/check-availability?username=${username}`);
        const check2 = await check2Res.json();

        if (!check2.success) {
            throw new Error(`Check failed: ${JSON.stringify(check2)}`);
        }

        if (check2.data.available === false) {
            console.log('SUCCESS: Username correctly reported as taken (available: false).');
        } else {
            console.error('FAILURE: Registered username should be TAKEN (available: false). Got available: true');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

main();
