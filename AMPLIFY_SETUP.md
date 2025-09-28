Amplify backend setup (S3 with correct permissions)

Prereqs
- Amplify CLI installed and signed in: `npm i -g @aws-amplify/cli` then `amplify configure`
- Project already initialized (`amplify/` exists). If not: `amplify init`.

1) Add Auth (Cognito) with guest access enabled
- Run: `amplify add auth`
- Default configuration, Social providers: No
- Allow unauthenticated logins: Yes (this creates an Identity Pool and an unauthenticated role)

2) Add Storage (S3)
- Run: `amplify add storage`
- Choose: Content (Images, audio, video, etc.)
- Friendly name: hotelContent
- Bucket name: auto or custom
- Auth users: create/update/read/delete
- Unauth users: create/update/read/delete (needed for guest push/pull as implemented)
- Lambda triggers: No

3) Set recommended CORS on bucket
If prompted in CLI, accept defaults; otherwise in S3 console add CORS:
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://<your-domain>"]
  }
]

4) Push
- `amplify push`
- After push, verify `src/aws-exports.js` is updated with Storage config.

5) Test in app
- Admin → Rooms: Pull/Push to Cloud should read/write `public/content/rooms.json`
- Admin → Photos: Pull/Push to Cloud should read/write `public/content/photos.json`

Notes
- Current code uses Amplify Storage v6 (uploadData/downloadData) with `accessLevel: 'guest'`.
- If you want to require login for editing, set unauth to read-only or disabled and switch app to `accessLevel: 'protected'` or `private`.