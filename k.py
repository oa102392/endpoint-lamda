class DeployRequest(BaseModel):
    apps: List[constr(min_length=1)]  # Ensure each app name is at least 1 character long
    framework: constr(regex="^(test|prod)$")  # Example: Allow 'test' or 'prod'
    scenario: str
    user_id: Optional[str] = None
    scale: Optional[conint(gt=0, lt=11)] = None  # Example: Ensure scale is between 1 and 10

    model_config = {
    "json_schema_extra": {
        "examples": [{
            "apps": ["cast", "scheduler", "driver", "trackpack", "mafes", "data_recorder"],
            "framework": "test",
            "scenario": "mwtd",
            "user_id": "user_123",
            "scale": 5
        }]
        
}
    }

    @validator('apps', each_item=True)
    def check_apps(cls, v):
        allowed_apps = ["cast", "scheduler", "driver", "trackpack", "mafes", "data_recorder"]
        if v not in allowed_apps:
            raise ValueError(f"{v} is not an allowed app")
        return v
    

    @validator('apps', each_item=True)
    def validate_apps(cls, v):
        settings = get_settings()
        valid_apps = settings.valid_apps.split(",")
        if v not in valid_apps:
            raise ValueError(f"{v} is not a valid app")
        return v
    


