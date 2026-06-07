# Testing Storage Cleanup

## Steps to verify storage cleanup is working:

### 1. Deploy the changes
```bash
git add .
git commit -m "Add storage cleanup for contact hero images"
git push
```

### 2. Wait for deployment to complete
Check your deployment platform (Vercel, etc.) to ensure the new code is live.

### 3. Test the cleanup

1. **Before uploading:**
   - Go to Supabase dashboard > Storage > `contact-page-images` bucket
   - Note the current image files (screenshot recommended)

2. **Upload new image:**
   - Go to your admin panel: `/admin/contact`
   - Upload a new hero image
   - Save changes

3. **Check server logs:**
   - Open browser DevTools > Network tab
   - Find the PUT request to `/api/admin/contact/[id]`
   - Check the response
   - In your deployment platform, check the function logs for:
     ```
     deleteStorageFile called with: { url: '...', bucketName: 'contact-page-images' }
     Extracted file path: hero-...
     Successfully deleted file from storage: hero-...
     ```

4. **Verify in storage:**
   - Go back to Supabase Storage > `contact-page-images`
   - The old image should be gone
   - Only the new image should exist

### 4. Debugging if it's not working

If the old image is still there, check:

#### A. Is the code deployed?
- Check your deployment platform's deployment history
- Verify the latest commit includes the storage cleanup changes

#### B. Check the logs
Look for these log messages:
- ✅ `"Contact PUT - Received data:"` - Shows the update is happening
- ✅ `"Deleting old image: [URL]"` - Shows cleanup is triggered
- ✅ `"deleteStorageFile called with:"` - Shows the delete function is called
- ✅ `"Extracted file path:"` - Shows the URL parsing worked
- ✅ `"Successfully deleted file from storage:"` - Shows deletion succeeded

If you see:
- ❌ `"Could not extract file path from URL"` - The URL format doesn't match expectations
- ❌ `"Error deleting file from storage"` - Permission or bucket issue

#### C. Check URL format
Print the URL in the logs and verify it matches:
```
https://[project-id].supabase.co/storage/v1/object/public/contact-page-images/hero-[timestamp].jpg
```

#### D. Check permissions
- Ensure the admin client has delete permissions on the bucket
- Check RLS policies in Supabase

### 5. Manual cleanup (if needed)

If old images are still there from before the fix, you can manually delete them:
1. Go to Supabase Storage > `contact-page-images`
2. Select old images
3. Click delete

## Expected behavior after fix:

✅ When you upload a new contact hero image → Old image is automatically deleted
✅ Storage bucket only contains the current image
✅ No accumulation of unused images

## Quick verification command:

Check if the latest code includes the cleanup:
```bash
grep -A 5 "Delete old image" app/api/admin/contact/[id]/route.ts
```

Should show:
```typescript
// Delete old image if it exists and is different from the existing URL
if (existingContact?.hero_image_url && existingContact.hero_image_url !== existingImageUrl) {
  console.log("Deleting old image:", existingContact.hero_image_url);
  await deleteStorageFile(existingContact.hero_image_url, STORAGE_BUCKETS.CONTACT);
}
```
