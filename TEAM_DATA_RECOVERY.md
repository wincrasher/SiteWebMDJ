# 🔄 Team Data Recovery Guide

## Issue Summary
Database corruption occurred during team member save operations. The `site_data` table stored objects instead of JSON strings, causing data loss when parsing failed.

### What was lost?
- 5 team members (Ellie, Naomy, Marie, Jean, Benoît) were deleted
- Only Jérémy (id: 1) remains in the database
- This happened because when corrupted data was detected, the recovery fallback reset to an empty array

## ✅ Solution Implemented

**Code changes (Commit 137ecd3):**
1. Added `/api/recovery-check` endpoint to diagnose database corruption
2. Improved error logging when data corruption is detected
3. Added safeguards to prevent future data loss

**How future saves are protected:**
- All team member saves now use proper JSON string serialization
- Database stores data as stringified JSON only (never as objects)
- Validation ensures data integrity before saving

## 🔧 Manual Recovery Steps

### Option A: Re-enter Team Members (Quickest)
1. Go to admin panel (`admin.html`)
2. Login with credentials
3. Navigate to "Équipe" section
4. Manually add each team member with their details

**Original team members to restore:**
- Jérémy (✅ Still exists)
- Ellie 
- Naomy 
- Marie 
- Jean 
- Benoît 

### Option B: Bulk Import (If data is available)
Contact admin if you have team member data to restore:
- Email CSV/JSON with team data
- Use bulk import feature if available

## 📊 Database Health Check

To check if database corruption still exists:

```bash
# Call the recovery check endpoint
curl https://yourdomain.com/api/recovery-check
```

**Expected response when healthy:**
```json
{
  "status": "healthy",
  "rows_checked": 8,
  "issues_found": 0,
  "issues": []
}
```

**Response if issues exist:**
```json
{
  "status": "corrupted",
  "rows_checked": 8,
  "issues_found": 1,
  "issues": [
    {
      "key": "squat_team",
      "type": "corrupted_format",
      "message": "⚠️ stored as OBJECT not JSON STRING",
      "stored_type": "object"
    }
  ]
}
```

## 🛡️ Prevention Going Forward

**New safeguards:**
1. ✅ All saves use `JSON.stringify()` for serialization
2. ✅ Recovery endpoint monitors database format
3. ✅ Error logging is comprehensive and clear
4. ✅ Validation checks happen before save

**Best practices:**
- Run `/api/recovery-check` periodically
- Keep backups of data exports
- Monitor logs for corruption warnings
- Report any `⚠️ Data corruption detected` messages immediately

## 📝 Troubleshooting

### Team members keep disappearing after edit
- Issue: Backend error recovery not kicking in
- Solution: Check Vercel logs for error messages
- Fallback: Reload page and verify data was saved

### Recovery check shows corruption
- Issue: Database has old corrupted data
- Solution: Delete corrupted entries and re-enter data
- Prevention: This won't happen with latest code

### Photos not saving with team member
- Issue: Photo too large or malformed
- Solution: Ensure photo is properly compressed (< 250KB)
- Check admin console for compression errors

## 📞 Support

If you're unable to restore team data:
1. Check `/api/recovery-check` result
2. Review Vercel logs in deployment
3. Contact admin with error messages found

---

**Last Updated:** 2026-01-XX  
**Affected Version:** All versions before commit 137ecd3  
**Fixed Version:** 137ecd3 and later
