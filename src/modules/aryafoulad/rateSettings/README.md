# API مدیریت نرخ‌ها

## مسیرهای API

### دریافت لیست نرخ‌ها
```
GET /aryafoulad/rate-settings/getAll
```
**پاسخ:**
```json
{
  "success": true,
  "message": "لیست نرخ‌ها با موفقیت دریافت شد",
  "data": [
    {
      "id": 1,
      "title": "نرخ سال ۱۴۰۲",
      "ratePerKm": 4000,
      "startDate": "2023-03-21",
      "endDate": "2024-03-20",
      "isActive": true,
      "timeStatus": "current",
      "isCurrentlyActive": true
    }
  ]
}
```

### دریافت نرخ‌های غیرفعال
```
GET /aryafoulad/rate-settings/getInactive
```

### دریافت نرخ فعال
```
GET /aryafoulad/rate-settings/getActive
```

### دریافت وضعیت نرخ‌ها
```
GET /aryafoulad/rate-settings/getStatus
```
**پاسخ:**
```json
{
  "success": true,
  "message": "وضعیت نرخ‌ها با موفقیت دریافت شد",
  "data": {
    "currentActive": { /* نرخ فعال فعلی */ },
    "futureRates": 2,
    "expiredRates": 1,
    "statistics": {
      "total": 5,
      "active": 1,
      "inactive": 4
    },
    "nextRate": { /* نرخ بعدی */ },
    "lastExpired": { /* آخرین نرخ منقضی شده */ }
  }
}
```

### دریافت نرخ بر اساس تاریخ
```
GET /aryafoulad/rate-settings/getRateByDate?missionDate=2023-05-15
```

### ایجاد نرخ جدید
```
POST /aryafoulad/rate-settings/create
```
**بدنه درخواست:**
```json
{
  "title": "نرخ سال ۱۴۰۳",
  "ratePerKm": 5000,
  "startDate": "2024-03-21",
  "endDate": "2025-03-20",
  "description": "نرخ جدید برای سال ۱۴۰۳",
  "isActive": false
}
```

### ویرایش نرخ
```
PUT /aryafoulad/rate-settings/update/:id
```

### فعال/غیرفعال کردن نرخ
```
PATCH /aryafoulad/rate-settings/toggle-active/:id
```
**بدنه درخواست:**
```json
{
  "isActive": true
}
```

### حذف نرخ
```
DELETE /aryafoulad/rate-settings/delete/:id
```

## قوانین کسب و کار

### 1. تداخل بازه زمانی
- **هیچ دو نرخی نمی‌توانند بازه زمانی مشترک داشته باشند**
- سیستم به طور خودکار تداخل‌ها را بررسی می‌کند
- پیام خطا شامل نام نرخ تداخل‌کننده است

### 2. نرخ فعال
- **فقط یک نرخ می‌تواند فعال باشد**
- نرخ فعال باید بازه زمانی معتبر داشته باشد
- نرخ‌های غیرفعال قابل حذف هستند

### 3. مدیریت نرخ‌ها
- نرخ‌های جدید به طور پیش‌فرض غیرفعال هستند
- کاربر باید به طور دستی نرخ را فعال کند
- نرخ فعال قابل حذف نیست

### 4. وضعیت زمانی
- **current**: نرخ در بازه زمانی فعلی
- **future**: نرخ برای آینده تعریف شده
- **expired**: نرخ منقضی شده

## مثال‌های استفاده

### ایجاد نرخ‌های مختلف
```javascript
// نرخ سال ۱۴۰۲ (غیرفعال)
{
  "title": "نرخ سال ۱۴۰۲",
  "ratePerKm": 4000,
  "startDate": "2023-03-21",
  "endDate": "2024-03-20",
  "isActive": false
}

// نرخ سال ۱۴۰۳ (غیرفعال)
{
  "title": "نرخ سال ۱۴۰۳", 
  "ratePerKm": 5000,
  "startDate": "2024-03-21",
  "endDate": "2025-03-20",
  "isActive": false
}
```

### فعال کردن نرخ
```javascript
// فعال کردن نرخ ۱۴۰۲
PATCH /aryafoulad/rate-settings/toggle-active/1
{
  "isActive": true
}
``` 