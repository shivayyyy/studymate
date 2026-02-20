
const API_URL = 'http://localhost:3001/api/v1';

async function main() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test_${Date.now()}@example.com`,
                password: 'Password123!'
            })
        });

        // If login fails, try register
        let token;
        if (!loginRes.ok) {
            console.log('Login failed, trying register...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `test_${Date.now()}@example.com`,
                    username: `user_${Date.now()}`,
                    password: 'Password123!',
                    fullName: 'Search Tester',
                    examCategory: 'JEE',
                    subjects: ['Physics'],
                    targetYear: 2026
                })
            });
            const regData = await regRes.json();
            if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
            token = regData.data.token;
        } else {
            const loginData = await loginRes.json();
            token = loginData.data.token;
        }

        console.log('2. Creating Room...');
        const uniqueName = `Quantum Physics ${Date.now()}`;
        const createRes = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: uniqueName,
                description: 'Test room for search',
                type: 'PUBLIC',
                examCategory: 'JEE',
                subject: 'Physics',
                timerMode: 'POMODORO',
                customTimerConfig: { work: 25, break: 5 }
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`Create room failed: ${JSON.stringify(err)}`);
        }
        console.log(`Room created: ${uniqueName}`);

        // Wait a bit for index text to update (MongoDB text indexes are eventually consistent)
        await new Promise(r => setTimeout(r, 1000));

        console.log('3. Searching for "quantum"...');
        const searchRes = await fetch(`${API_URL}/rooms?search=quantum`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const searchData = await searchRes.json();
        const rooms = searchData.data;

        console.log(`Found ${rooms.length} rooms.`);

        const found = rooms.find((r: any) => r.name === uniqueName);
        if (found) {
            console.log('SUCCESS: Generated room found in search results!');
        } else {
            console.error('FAILURE: Generated room NOT found in search results.');
            console.log('results:', rooms.map((r: any) => r.name));
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

main();
