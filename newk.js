// Step 1: Authenticate with Keycloak and fetch the access token
pm.sendRequest({
    url: 'https://sso.aero.org/realms/e3/protocol/openid-connect/token',
    method: 'POST',
    header: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        mode: 'urlencoded',
        urlencoded: [
            { key: 'grant_type', value: 'password' }, // Password grant
            { key: 'client_id', value: 'campairflow' },
            { key: 'client_secret', value: 'bbp2EzJMaCUpbICtgcIUVFqTAiQHNE0f' },
            { key: 'username', value: '<your-username>' }, // Replace with your Keycloak username
            { key: 'password', value: '<your-password>' }, // Replace with your Keycloak password
            { key: 'scope', value: 'openid email profile' }
        ]
    }
}, function (err, res) {
    if (err) {
        console.error('Error during Keycloak authentication:', err);
        return;
    }

    const accessToken = res.json().access_token;
    console.log('Access Token:', accessToken); // Log the access token for debugging
    pm.environment.set('access_token', accessToken);

    // Step 2: Use the access token to fetch the session cookie from Airflow
    pm.sendRequest({
        url: 'https://camp-airflow.dev.e3.aero.org/api/v1/dags', // Example endpoint to trigger session creation
        method: 'GET',
        header: {
            'Authorization': `Bearer ${accessToken}`
        }
    }, function (err, res) {
        if (err) {
            console.error('Error fetching session cookie:', err);
            return;
        }

        console.log('Response Headers:', res.headers); // Log all headers to debug cookie extraction

        // Extract the session cookie
        const cookieHeader = res.headers.find(header => header.key.toLowerCase() === 'set-cookie');
        if (cookieHeader) {
            const sessionCookie = cookieHeader.value.split(';')[0]; // Extract session cookie
            console.log('Session Cookie:', sessionCookie); // Log the session cookie for debugging
            pm.environment.set('session_cookie', sessionCookie);
        } else {
            console.warn('No Set-Cookie header found in response.');
        }
    });
});
