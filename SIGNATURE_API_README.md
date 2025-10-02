# Signature Upload API

## راهنمای استفاده از API امضا

### Endpoints موجود:

1. **آپلود امضا**
   - `POST /signatures/upload`
   - نیاز به احراز هویت دارد
   - فایل باید در فیلد `signature` ارسال شود
   - فقط فایل‌های تصویری مجاز هستند
   - حداکثر حجم: 5MB

2. **دانلود امضا**
   - `GET /signatures/download/:filename`
   - نیازی به احراز هویت ندارد
   - فایل را مستقیماً برمی‌گرداند

3. **حذف امضا**
   - `DELETE /signatures/delete/:filename`
   - نیاز به احراز هویت دارد

### ساختار پوشه‌ها:
```
api/
├── uploads/
│   └── signatures/
│       └── [فایل‌های امضا]
└── src/
    └── modules/
        └── signatures/
            ├── controller.js
            └── route.js
```

### نحوه استفاده در Frontend:

```javascript
// آپلود امضا
const formData = new FormData();
formData.append('signature', file);

const response = await fetch(API_ENDPOINTS.signatures.upload, {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

// نمایش امضا
<img src={API_ENDPOINTS.signatures.download(filename)} alt="امضا" />
```

### تنظیمات:
- فایل‌ها در پوشه `api/uploads/signatures/` ذخیره می‌شوند
- نام فایل‌ها به صورت `signature_timestamp_randomhash.ext` تولید می‌شود
- فقط فایل‌های تصویری (image/*) مجاز هستند
- حداکثر حجم فایل: 5MB

### نکات امنیتی:
- تمام endpoint ها نیاز به احراز هویت دارند (به جز دانلود)
- فایل‌ها با نام‌های تصادفی ذخیره می‌شوند
- اعتبارسنجی نوع فایل انجام می‌شود
