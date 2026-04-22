```JSON
{
  "code": "SUCCESS",
  "message": "successfully retrieve the data",
  "data": {
    "sync_approval": {
      "application_name": "Salesforce",
      "changes": [
        {
          "id": "change_001",
          "field_name": "user.id",
          "change_type": "ADD",
          "new_value": "3f2a1b4c-8e5d-4c6a-9f7b-1a2b3c4d5e6f"
        },
        {
          "id": "change_002",
          "field_name": "key.id",
          "change_type": "ADD",
          "new_value": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        },
        {
          "id": "change_003",
          "field_name": "key.access_end",
          "change_type": "UPDATE",
          "current_value": "2026-03-31T18:00:00Z",
          "new_value": "2026-06-30T18:00:00Z"
        },
        {
          "id": "change_004",
          "field_name": "key.status",
          "change_type": "UPDATE",
          "current_value": "active",
          "new_value": "revoked"
        },
        {
          "id": "change_005",
          "field_name": "key.id",
          "change_type": "DELETE",
          "current_value": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90"
        },
        {
          "id": "change_006",
          "field_name": "user.status",
          "change_type": "UPDATE",
          "current_value": "suspended",
          "new_value": "active"
        },
        {
          "id": "change_007",
          "field_name": "user.email",
          "change_type": "UPDATE",
          "current_value": "alice@techcorp.com",
          "new_value": "alice.wong@techcorp.com"
        },
        {
          "id": "change_008",
          "field_name": "user.role",
          "change_type": "UPDATE",
          "current_value": "guest",
          "new_value": "user"
        },
        {
          "id": "change_009",
          "field_name": "user.phone",
          "change_type": "UPDATE",
          "current_value": "+1-800-555-0101",
          "new_value": "+1-800-555-0199"
        },
        {
          "id": "change_010",
          "field_name": "user.id",
          "change_type": "DELETE",
          "current_value": "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
        },
        {
          "id": "change_011",
          "field_name": "user.status",
          "change_type": "UPDATE",
          "current_value": "active",
          "new_value": "suspended"
        }
      ]
    },
    "metadata": {

    }
  }
}
```

```JSON
{"error":"Bad Request","code":"missing_parameter","message":"query parameter 'application_id' is required"}
```

```JSON
{"error":"Bad Request","code":"invalid_application_id","message":"unsupported application_id; valid values are: salesforce, hubspot, stripe, slack, zendesk, intercom"}
```

```JSON
{"error":"Internal Server Error","code":"internal_error","message":"an unexpected server error occurred"}
```
