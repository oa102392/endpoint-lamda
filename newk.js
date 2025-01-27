// Step 1: Simulate the browser interaction to fetch the Authorization Code
pm.sendRequest({
    url: 'https://sso.aero.org/realms/e3/protocol/openid-connect/auth',
    method: 'GET',
    header: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        mode: 'urlencoded',
        urlencoded: [
            { key: 'response_type', value: 'code' }, // Specify Authorization Code flow
            { key: 'client_id', value: 'campairflow' },
            { key: 'redirect_uri', value: 'https://camp-airflow.dev.e3.aero.org/oauth/callback' },
            { key: 'scope', value: 'openid email profile' },
            { key: 'state', value: 'random-state-value' } // Optional state for CSRF protection
        ]
    }
}, function (err, res) {
    if (err) {
        console.error('Error fetching authorization code:', err);
        return;
    }

    // Parse the Authorization Code from the redirect response
    const redirectLocation = res.headers.find(header => header.key.toLowerCase() === 'location');
    if (!redirectLocation || !redirectLocation.value.includes('?code=')) {
        console.error('Authorization Code not found in redirect response.');
        return;
    }

    const authCode = redirectLocation.value.split('?code=')[1].split('&')[0]; // Extract the code
    console.log('Authorization Code:', authCode);
    pm.environment.set('authorization_code', authCode);

    // Step 2: Exchange the Authorization Code for an Access Token
    pm.sendRequest({
        url: 'https://sso.aero.org/realms/e3/protocol/openid-connect/token',
        method: 'POST',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
            mode: 'urlencoded',
            urlencoded: [
                { key: 'grant_type', value: 'authorization_code' },
                { key: 'client_id', value: 'campairflow' },
                { key: 'client_secret', value: 'bbp2EzJMaCUpbICtgcIUVFqTAiQHNE0f' },
                { key: 'redirect_uri', value: 'https://camp-airflow.dev.e3.aero.org/oauth/callback' },
                { key: 'code', value: authCode }
            ]
        }
    }, function (err, res) {
        if (err) {
            console.error('Error fetching access token:', err);
            return;
        }

        const accessToken = res.json().access_token;
        console.log('Access Token:', accessToken);
        pm.environment.set('access_token', accessToken);

        // Step 3: Fetch the Session Cookie from Airflow
        pm.sendRequest({
            url: 'https://camp-airflow.dev.e3.aero.org/api/v1/dags',
            method: 'GET',
            header: {
                'Authorization': `Bearer ${accessToken}`
            }
        }, function (err, res) {
            if (err) {
                console.error('Error fetching session cookie:', err);
                return;
            }

            console.log('Response Headers:', res.headers);

            // Extract the session cookie
            const cookieHeader = res.headers.find(header => header.key.toLowerCase() === 'set-cookie');
            if (cookieHeader) {
                const sessionCookie = cookieHeader.value.split(';')[0]; // Extract session cookie
                console.log('Session Cookie:', sessionCookie);
                pm.environment.set('session_cookie', sessionCookie);
            } else {
                console.warn('No Set-Cookie header found in response.');
            }
        });
    });
});
