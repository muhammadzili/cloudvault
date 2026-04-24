# API Documentation

CloudVault provides a robust API for file management and integration.

## Authentication
All protected routes require a Bearer Token in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_or_api_token>
```

## Endpoints

### Files
- `GET /api/files`: List all files (supports `folder_id` query).
- `POST /api/files/upload`: Upload a single file (Multipart Form).
- `POST /api/files/:id/share`: Toggle public sharing status.
- `DELETE /api/files/:id`: Delete a file permanently.

### Folders
- `GET /api/folders`: List all folders.
- `POST /api/folders`: Create a new folder.

### API Tokens
Managed via the settings dashboard. These tokens can be used for automated uploads from scripts or CLI tools.

## Sharing Mechanics
When a file is "shared", it becomes accessible at:
`GET /api/shared` (Catalog list)
`GET /api/shared/download/:id` (Public download)

No authentication is required for these specific endpoints.
