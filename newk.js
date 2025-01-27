// Step 1: Simulate the login by fetching the Authorization Code
pm.sendRequest({
    url: 'https://sso.aero.org/realms/e3/protocol/openid-connect/auth',
    method: 'GET',
    header: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        mode: 'urlencoded',
        urlencoded: [
            { key: 'response_type', value: 'code' }, // Authorization Code flow
            { key: 'client_id', value: 'campairflow' },
            { key: 'redirect_uri', value: 'https://camp-airflow.dev.e3.aero.org/oauth/callback' },
            { key: 'scope', value: 'openid email profile' },
            { key: 'state', value: 'some-random-state-value' } // Optional, for CSRF protection
        ]
    }
}, function (err, res) {
    if (err) {
        console.error('Error during Authorization Code request:', err);
        return;
    }

    // Step 2: Extract the Authorization Code from the Redirect
    const redirectLocation = res.headers.find(header => header.key.toLowerCase() === 'location');
    if (!redirectLocation || !redirectLocation.value.includes('?code=')) {
        console.error('Authorization Code not found in the redirect.');
        return;
    }

    const authCode = redirectLocation.value.split('?code=')[1].split('&')[0]; // Extract `code`
    pm.environment.set('authorization_code', authCode);

    // Step 3: Exchange Authorization Code for Access Token
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
            console.error('Error fetching Access Token:', err);
            return;
        }

        const accessToken = res.json().access_token;
        pm.environment.set('access_token', accessToken);

        // Step 4: Simulate logging in to Airflow to get a session cookie
        pm.sendRequest({
            url: 'https://camp-airflow.dev.e3.aero.org/api/v1/dags',
            method: 'GET',
            header: {
                'Authorization': `Bearer ${accessToken}`
            }
        }, function (err, res) {
            if (err) {
                console.error('Error fetching Airflow session cookie:', err);
                return;
            }

            const cookieHeader = res.headers.find(header => header.key.toLowerCase() === 'set-cookie');
            if (cookieHeader) {
                const sessionCookie = cookieHeader.value.split(';')[0]; // Extract session cookie
                pm.environment.set('session_cookie', sessionCookie);
            }
        });
    });
});
