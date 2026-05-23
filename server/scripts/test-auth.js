async function testAuth() {
  try {
    console.log('1. Registering...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User 2',
        email: 'testlogin2@example.com',
        password: 'password123',
        role: 'student'
      })
    });
    const regData = await regRes.json();
    console.log('Register Success:', regData.success || regData.message);

    console.log('2. Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testlogin2@example.com',
        password: 'password123',
        role: 'student'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Success:', loginData.success || loginData.message);
    console.log('Token received:', !!loginData.token);

  } catch (err) {
    console.error('Auth Error:', err.message);
  }
}

testAuth();
