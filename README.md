# Divine Branding AI Studio

A mobile-first, installable web app for iPhone. It supports:
- AI background removal to transparent artwork
- 4x AI upscaling
- PNG downloads

## Important: connect the AI service
This project uses Replicate for image processing. Processing is not active until you add a Replicate API token.

1. Create an account at https://replicate.com/
2. Create/copy an API token in your account settings.
3. Deploy this project to Vercel (https://vercel.com/) by importing the GitHub repository.
4. In Vercel: Project → Settings → Environment Variables.
5. Add `REPLICATE_API_TOKEN` with your token as the value, then redeploy.

Replicate charges based on model usage. Review its current pricing before processing client artwork. Keep the token private; never put it in the website's HTML or share it publicly.

## Deploy
- Upload this folder to a new GitHub repository.
- Import the repository into Vercel.
- No build command is required; Vercel serves `public/` and the `api/` functions.
- Add the environment variable above.

## Add to iPhone Home Screen
After deployment, open the website in Safari → Share → Add to Home Screen.

## Notes
- Results are converted to PNG in the browser before download.
- Use PNG with transparency for artwork that needs a transparent background.
- AI upscaling improves raster resolution but does not create true vector paths or guarantee vinyl-cut-ready geometry.
- This starter is not a private client-file vault. Avoid uploading sensitive client material unless you are comfortable with the AI provider's terms and retention policies.
