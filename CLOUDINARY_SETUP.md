# Setting Up Cloudinary for Client-Side Uploads

To make client-side uploads work with Cloudinary, you need to set up an unsigned upload preset. This approach avoids exposing your API secret in the frontend code.

## Steps to Create an Upload Preset:

1. **Log in to your Cloudinary Console**: https://console.cloudinary.com/

2. **Navigate to Settings**:
   - Click on the "Settings" icon in the dashboard
   - Select "Upload" from the menu

3. **Scroll Down to Upload Presets**:
   - Click on "Add upload preset"

4. **Configure the Upload Preset**:
   - **Preset name**: Enter `nymph_academy_preset` (this is what we've configured in the code)
   - **Signing Mode**: Select "Unsigned"
   - **Folder**: The code will handle folders automatically:
     - Student images will go to "nymph_academy/student_image"
     - Payment screenshots will go to "nymph_academy/payment_screenshot"
   - **Access Mode**: Choose "public" for public images

5. **Set Resource Type**:
   - Set to "Auto" to allow all types of uploads, or "Image" to restrict to images only

6. **Save the Preset**:
   - Click "Save" at the bottom of the page

## Security Considerations:

Since we're using unsigned uploads, anyone who knows your cloud name and preset name can upload to your Cloudinary account. To mitigate risks:

1. **Set Upload Restrictions**:
   - Set file size limits
   - Restrict allowed file formats
   - Enable moderation if needed

2. **Set CORS Origins**:
   - In the Upload settings, specify the allowed domains that can upload to your account

3. **Consider Rate Limiting**:
   - Set upload quotas to prevent abuse

## Environment Variables:

Make sure your `.env` file has the following variables set:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
```

You no longer need to include the `VITE_CLOUDINARY_API_SECRET` since we're using unsigned uploads.

## Note on Image Deletion:

Client-side image deletion is not implemented as it would require exposing your API secret. In a production environment, image deletion should be handled through a server-side component with proper authentication.