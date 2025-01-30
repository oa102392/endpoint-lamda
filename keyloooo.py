import logging
import os
import requests
from flask import request
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder.security.manager import AUTH_OAUTH
from flask_appbuilder.api import BaseApi, expose
from airflow.configuration import conf
from airflow.exceptions import AirflowException

logger = logging.getLogger(__name__)

os.environ["REQUESTS_CA_BUNDLE"] = "/etc/ssl/certs/AeroChain.crt"

AUTH_TYPE = AUTH_OAUTH
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Public"

OAUTH_PROVIDERS = [
    {
        "name": "keycloak",
        "icon": "fa-key",
        "token_key": "access_token",
        "remote_app": {
            "client_id": "campairflow",
            "client_secret": "bbp2EzJMaCUpbICtgIUVFqTAiQHNE0f",
            "api_base_url": "https://sso.aero.org/realms/e3/protocol/openid-connect/",
            "client_kwargs": {"scope": "openid email profile"},
            "access_token_url": "https://sso.aero.org/realms/e3/protocol/openid-connect/token",
            "authorize_url": "https://sso.aero.org/realms/e3/protocol/openid-connect/auth",
            "jwks_uri": "https://sso.aero.org/realms/e3/protocol/openid-connect/certs",
            "request_token_url": None,
        },
    }
]

AUTH_ROLES_MAPPING = {
    "User": ["User"],
    "Admin": ["Admin"],
    "Viewer": ["Viewer"],
    "Op": ["Op"],
    "Public": ["Public"],
}

PERMANENT_SESSION_LIFETIME = 1800


class CustomSecurityManager(AirflowSecurityManager):
    """
    Custom Security Manager to enforce Keycloak OAuth2 authentication for API calls.
    """

    def is_authorized(self, user, action, resource):
        """
        Allow API access only with a valid Keycloak token.
        UI authentication remains unchanged.
        """
        path = request.path
        if path.startswith("/api/v1/"):  # API Requests
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise AirflowException("Missing Bearer Token", 401)

            token = auth_header.split(" ")[1]
            keycloak_introspect_url = "https://sso.aero.org/realms/e3/protocol/openid-connect/token/introspect"
            data = {
                "token": token,
                "client_id": "campairflow",
                "client_secret": "bbp2EzJMaCUpbICtgIUVFqTAiQHNE0f",
            }

            response = requests.post(
                keycloak_introspect_url, 
                data=data, 
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

            if response.status_code != 200 or not response.json().get("active"):
                raise AirflowException("Invalid or expired token", 401)

            return True  # Token is valid, allow API access

        return super().is_authorized(user, action, resource)  # Default UI behavior

    def auth_user_oauth(self, userinfo):
        """
        Override OAuth2 authentication to handle user login.
        """
        return super().auth_user_oauth(userinfo)


class CustomAPIAuth(BaseApi):
    """
    Custom API Authentication using Keycloak Bearer tokens.
    """

    allow_browser_login = False  # Disable session authentication for API
    csrf_exempt = True  # Disable CSRF protection for API calls

    @expose("/auth", methods=["GET"])
    def api_auth_check(self):
        """
        API Authentication Endpoint - Validates OAuth2 Bearer Token
        """
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return self.response_401(message="Missing Bearer Token")

        token = auth_header.split(" ")[1]
        keycloak_introspect_url = "https://sso.aero.org/realms/e3/protocol/openid-connect/token/introspect"
        data = {
            "token": token,
            "client_id": "campairflow",
            "client_secret": "bbp2EzJMaCUpbICtgIUVFqTAiQHNE0f",
        }

        response = requests.post(
            keycloak_introspect_url, 
            data=data, 
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        if response.status_code != 200 or not response.json().get("active"):
            return self.response_401(message="Invalid or expired token")

        return self.response(200, message="Token is valid")


SECURITY_MANAGER_CLASS = CustomSecurityManager
appbuilder.add_api(CustomAPIAuth)
