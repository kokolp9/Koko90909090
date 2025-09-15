import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const translations = {
  ar: {
    // General
    "save": "حفظ",
    "edit": "تعديل",
    "delete": "حذف",
    "add": "إضافة",
    "close": "إغلاق",
    "product": "منتج",
    "quantity": "الكمية",
    "price": "السعر",
    "total": "الإجمالي",
    "actions": "الإجراءات",
    "search": "ابحث...",
    "customer": "العميل",
    "date": "التاريخ",
    "status": "الحالة",
    "notes": "ملاحظات",
    "details": "التفاصيل",
    "print": "طباعة",

    // Sidebar
    "dashboard": "لوحة المعلومات",
    "inventoryManagement": "إدارة المخزون",
    "customerManagement": "إدارة العملاء",
    "salesAndInvoices": "المبيعات",
    "returns": "المرتجعات",
    "records": "السجلات",
    "reports": "التقارير",
    "settings": "الإعدادات",
    "welcome": "مرحباً",
    "logout": "خروج",
    "developedBy": "تطوير: kero joker",
    "contactSupport": "للتواصل والدعم",

    // Login
    "companyName": "مؤسسة كيرو للأدوات الصحية",
    "systemName": "نظام الإدارة المتكامل",
    "username": "اسم المستخدم",
    "password": "كلمة المرور",
    "login": "تسجيل الدخول",
    "loginError": "اسم المستخدم أو كلمة المرور غير صحيحة",

    // Dashboard
    "totalProducts": "إجمالي المنتجات",
    "stockValue": "قيمة المخزون",
    "totalSales": "إجمالي المبيعات",
    "totalProfits": "إجمالي الأرباح",
    "dailyProfit": "أرباح اليوم",
    "backupAndRestore": "النسخ الاحتياطي والاستعادة",
    "createBackup": "إنشاء نسخة احتياطية",
    "restoreData": "استعادة البيانات",
    "lowStockWarning": "تنبيه: مخزون منخفض",
    "remainingQuantity": "الكمية المتبقية",

    // Inventory
    "addProduct": "إضافة منتج",
    "exportPDF": "تصدير PDF",
    "exportExcel": "تصدير Excel",
    "productImage": "صورة",
    "productName": "اسم المنتج",
    "cost": "التكلفة",
    "alertThreshold": "حد التنبيه",
    "editProduct": "تعديل المنتج",
    "addProductNew": "إضافة منتج جديد",
    "lowestQuantity": "أقل كمية",
    "inventoryReport": "تقرير المخزون",
    
    // Customers
    "addCustomer": "إضافة عميل",
    "phone": "الهاتف",
    "address": "العنوان",
    "operationsCount": "عدد العمليات",
    "editCustomer": "تعديل عميل",
    "addCustomerNew": "إضافة عميل جديد",
    "customerProfile": "ملف العميل",
    "totalPurchases": "إجمالي المشتريات",
    "totalDebt": "إجمالي المديونية",
    "transactionsLog": "سجل العمليات",
    "noTransactions": "لا توجد عمليات مسجلة لهذا العميل.",
    "addPayment": "تسجيل دفعة",
    "paymentAmount": "مبلغ الدفعة",
    "makePayment": "تسجيل الدفعة",
    "customerPayments": "دفعات العميل",
    "allCustomerRecords": "كافة سجلات العميل",

    // Sales Page
    "recordType": "نوع العملية",
    "sale": "عملية بيع",
    "invoice": "فاتورة",
    "fawrySale": "بيع فوري",
    "selectCustomer": "اختر عميل...",
    "addNewCustomer": "إضافة عميل جديد",
    "selectProduct": "اختر منتج...",
    "addItem": "إضافة للصنف",
    "cart": "الأصناف المضافة",
    "subtotal": "المجموع الفرعي",
    "discount": "الخصم",
    "finalTotal": "المجموع النهائي",
    "paymentStatus": "حالة الدفع",
    "paid": "مدفوع",
    "partial": "جزئي",
    "deferred": "مؤجل",
    "amountPaid": "المبلغ المدفوع",
    "amountRemaining": "المبلغ المتبقي",
    "createSale": "إنشاء عملية بيع",
    "createInvoice": "إنشاء فاتورة",
    "archiveInvoice": "حفظ كمسودة",
    "createFawrySale": "إنشاء بيع فوري",
    "customerSearchPlaceholder": "اكتب اسم العميل للبحث أو لإضافة جديد...",
    "searchProductPlaceholder": "اكتب اسم المنتج...",
    "customerInfo": "بيانات العميل",

    // Returns Page
    "salesReturn": "مرتجع مبيعات",
    "invoiceReturn": "مرتجع فاتورة",
    "createReturn": "إنشاء مرتجع",

    // Records Page
    "recordNumber": "رقم العملية",
    "createdBy": "تم بواسطة",
    "archivedInvoices": "الفواتير المؤرشفة",
    "trash": "سلة المهملات",
    "viewDetails": "عرض التفاصيل",
    "restore": "استعادة",
    "deletePermanently": "حذف نهائي",
    "recordDetails": "تفاصيل العملية",
    "items": "الأصناف",
    "paymentHistory": "سجل الدفعات",
    "noPayments": "لا توجد دفعات مسجلة.",
    "unarchive": "إلغاء الأرشفة",
    "sales": "المبيعات",
    "invoices": "الفواتير",
    "fawrySales": "مبيعات فوري",
    "salesReturns": "مرتجعات مبيعات",
    "invoiceReturns": "مرتجعات فواتير",

    // Reports Page
    "overview": "نظرة عامة",
    "products": "المنتجات",
    "customers": "العملاء",
    "salesOverTime": "المبيعات مع الوقت",
    "topSellingProducts": "المنتجات الأكثر مبيعاً",
    "salesByPaymentType": "المبيعات حسب نوع الدفع",
    "totalProfit": "إجمالي الربح",
    "totalCost": "إجمالي التكلفة",
    "revenue": "الإيرادات",
    "profit": "الربح",
    "transactions": "عدد العمليات",
    "totalReturns": "إجمالي المرتجعات",
    "startDate": "من تاريخ",
    "endDate": "إلى تاريخ",
    "salesAndProfitOverTime": "المبيعات والأرباح مع الوقت",
    "topCustomers": "أفضل العملاء",
    "paymentStatusDistribution": "توزيع حالات الدفع",
    "allTransactions": "كل العمليات",
    "type": "النوع",
    
    // Settings
    "language": "اللغة",
    "arabic": "العربية",
    "english": "English",
    "theme": "الوضع",
    "light": "فاتح",
    "dark": "داكن",
    "userManagement": "إدارة المستخدمين",
    "system": "النظام",
    "viewActivityLog": "عرض سجل النشاطات",
    "editUser": "تعديل المستخدم",
    "newUsername": "اسم مستخدم جديد",
    "newPassword": "كلمة مرور جديدة (اتركه فارغاً للتجاهل)",
    "companyInfo": "معلومات المؤسسة",
    "companyNameLabel": "اسم المؤسسة",
    "companyAddress": "عنوان المؤسسة",
    "companyPhone": "هاتف المؤسسة",
    "companyLogo": "شعار المؤسسة",
    "uploadLogo": "رفع شعار",
    "removeLogo": "إزالة الشعار",
    "logoOpacity": "شفافية الشعار على الفواتير",
    "logoOpacityHelp": "0 = شفاف, 1 = ظاهر بالكامل",
    "printSettings": "إعدادات الطباعة",
    "showCostOnPrint": "إظهار التكلفة في الطباعة",
    "printFooterText": "نص تذييل الطباعة",
    "printFontSize": "حجم الخط في الطباعة",


    // Notifications
    "operationSuccess": "تمت العملية بنجاح.",
    "productSavedSuccess": "تم حفظ المنتج بنجاح.",
    "customerSavedSuccess": "تم حفظ العميل بنجاح.",
    "backupSuccess": "تم إنشاء نسخة احتياطية للبيانات بنجاح.",
    "restoreSuccess": "تم استعادة البيانات بنجاح. سيتم تحديث الصفحة.",
    "restoreFailed": "فشل استعادة البيانات. الملف غير صالح.",
    "customerRequiredError": "الرجاء تحديد عميل أو كتابة اسم جديد.",
    "itemsRequiredError": "الرجاء إضافة أصناف إلى السلة.",
    "lowStockAlert": "الكمية المتاحة لـ {productName} هي {quantity} فقط.",
    "exportError": "فشل في تصدير الملف.",
    "invalidNumberError": "الرجاء إدخال أرقام صحيحة.",
    "paymentDetailsError": "تفاصيل الدفعة غير صالحة. الرجاء إدخال مبلغ صحيح.",

    // AI Features
    "aiCorrectTooltip": "تصحيح تلقائي بالذكاء الاصطناعي",
    "aiCorrectSuccess": "تم التصحيح بالذكاء الاصطناعي!",
    "aiCorrectFail": "لم يتمكن الذكاء الاصطناعي من العثور على منتج مطابق.",
    "aiAssistant": "المساعد الذكي",
    "askAiPlaceholder": "اسأل عن أي شيء في النظام...",

  },
  en: {
    // General
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "close": "Close",
    "product": "Product",
    "quantity": "Quantity",
    "price": "Price",
    "total": "Total",
    "actions": "Actions",
    "search": "Search...",
    "customer": "Customer",
    "date": "Date",
    "status": "Status",
    "notes": "Notes",
    "details": "Details",
    "print": "Print",

    // Sidebar
    "dashboard": "Dashboard",
    "inventoryManagement": "Inventory",
    "customerManagement": "Customers",
    "salesAndInvoices": "Sales",
    "returns": "Returns",
    "records": "Records",
    "reports": "Reports",
    "settings": "Settings",
    "welcome": "Welcome",
    "logout": "Logout",
    "developedBy": "Developed by: kero joker",
    "contactSupport": "Contact & Support",
    
    // Login
    "companyName": "Kiro Corp for Sanitary Ware",
    "systemName": "Integrated Management System",
    "username": "Username",
    "password": "Password",
    "login": "Login",
    "loginError": "Incorrect username or password",
    
    // Dashboard
    "totalProducts": "Total Products",
    "stockValue": "Stock Value",
    "totalSales": "Total Sales",
    "totalProfits": "Total Profits",
    "dailyProfit": "Today's Profit",
    "backupAndRestore": "Backup & Restore",
    "createBackup": "Create Backup",
    "restoreData": "Restore Data",
    "lowStockWarning": "Warning: Low Stock",
    "remainingQuantity": "Remaining quantity",
    
    // Inventory
    "addProduct": "Add Product",
    "exportPDF": "Export PDF",
    "exportExcel": "Export Excel",
    "productImage": "Image",
    "productName": "Product Name",
    "cost": "Cost",
    "alertThreshold": "Alert Threshold",
    "editProduct": "Edit Product",
    "addProductNew": "Add New Product",
    "lowestQuantity": "Lowest quantity",
    "inventoryReport": "Inventory Report",

    // Customers
    "addCustomer": "Add Customer",
    "phone": "Phone",
    "address": "Address",
    "operationsCount": "Operations Count",
    "editCustomer": "Edit Customer",
    "addCustomerNew": "Add New Customer",
    "customerProfile": "Customer Profile",
    "totalPurchases": "Total Purchases",
    "totalDebt": "Total Debt",
    "transactionsLog": "Transactions Log",
    "noTransactions": "No transactions recorded for this customer.",
    "addPayment": "Log Payment",
    "paymentAmount": "Payment Amount",
    "makePayment": "Make Payment",
    "customerPayments": "Customer Payments",
    "allCustomerRecords": "All Customer Records",

    // Sales Page
    "recordType": "Record Type",
    "sale": "Sale",
    "invoice": "Invoice",
    "fawrySale": "Fawry Sale",
    "selectCustomer": "Select a customer...",
    "addNewCustomer": "Add new customer",
    "selectProduct": "Select a product...",
    "addItem": "Add Item",
    "cart": "Added Items",
    "subtotal": "Subtotal",
    "discount": "Discount",
    "finalTotal": "Final Total",
    "paymentStatus": "Payment Status",
    "paid": "Paid",
    "partial": "Partial",
    "deferred": "Deferred",
    "amountPaid": "Amount Paid",
    "amountRemaining": "Amount Remaining",
    "createSale": "Create Sale",
    "createInvoice": "Create Invoice",
    "archiveInvoice": "Save as Draft",
    "createFawrySale": "Create Fawry Sale",
    "customerSearchPlaceholder": "Type customer name to search or add new...",
    "searchProductPlaceholder": "Type product name...",
    "customerInfo": "Customer Information",

    // Returns Page
    "salesReturn": "Sales Return",
    "invoiceReturn": "Invoice Return",
    "createReturn": "Create Return",

    // Records Page
    "recordNumber": "Record #",
    "createdBy": "Created By",
    "archivedInvoices": "Archived Invoices",
    "trash": "Trash",
    "viewDetails": "View Details",
    "restore": "Restore",
    "deletePermanently": "Delete Permanently",
    "recordDetails": "Record Details",
    "items": "Items",
    "paymentHistory": "Payment History",
    "noPayments": "No payments recorded.",
    "unarchive": "Unarchive",
    "sales": "Sales",
    "invoices": "Invoices",
    "fawrySales": "Fawry Sales",
    "salesReturns": "Sales Returns",
    "invoiceReturns": "Invoice Returns",

    // Reports Page
    "overview": "Overview",
    "products": "Products",
    "customers": "Customers",
    "salesOverTime": "Sales Over Time",
    "topSellingProducts": "Top Selling Products",
    "salesByPaymentType": "Sales by Payment Type",
    "totalProfit": "Total Profit",
    "totalCost": "Total Cost",
    "revenue": "Revenue",
    "profit": "Profit",
    "transactions": "Transactions",
    "totalReturns": "Total Returns",
    "startDate": "Start Date",
    "endDate": "End Date",
    "salesAndProfitOverTime": "Sales & Profit Over Time",
    "topCustomers": "Top Customers",
    "paymentStatusDistribution": "Payment Status Distribution",
    "allTransactions": "All Transactions",
    "type": "Type",
    
    // Settings
    "language": "Language",
    "arabic": "العربية",
    "english": "English",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "userManagement": "User Management",
    "system": "System",
    "viewActivityLog": "View Activity Log",
    "editUser": "Edit User",
    "newUsername": "New Username",
    "newPassword": "New Password (leave blank to ignore)",
    "companyInfo": "Company Information",
    "companyNameLabel": "Company Name",
    "companyAddress": "Company Address",
    "companyPhone": "Company Phone",
    "companyLogo": "Company Logo",
    "uploadLogo": "Upload Logo",
    "removeLogo": "Remove Logo",
    "logoOpacity": "Logo Opacity on Invoices",
    "logoOpacityHelp": "0 = transparent, 1 = fully visible",
    "printSettings": "Print Settings",
    "showCostOnPrint": "Show 'Cost' column on prints",
    "printFooterText": "Print Footer Text",
    "printFontSize": "Print Font Size",

    // Notifications
    "operationSuccess": "Operation completed successfully.",
    "productSavedSuccess": "Product saved successfully.",
    "customerSavedSuccess": "Customer saved successfully.",
    "backupSuccess": "Data backup created successfully.",
    "restoreSuccess": "Data restored successfully. The page will now reload.",
    "restoreFailed": "Failed to restore data. The file may be invalid.",
    "customerRequiredError": "Please select a customer or type a new name.",
    "itemsRequiredError": "Please add items to the cart.",
    "lowStockAlert": "The available quantity for {productName} is only {quantity}.",
    "exportError": "Failed to export the file.",
    "invalidNumberError": "Please enter valid numbers.",
    "paymentDetailsError": "Invalid payment details. Please enter a valid amount.",

    // AI Features
    "aiCorrectTooltip": "AI Auto-Correct",
    "aiCorrectSuccess": "Corrected with AI!",
    "aiCorrectFail": "AI could not find a matching product.",
    "aiAssistant": "AI Assistant",
    "askAiPlaceholder": "Ask anything about the system...",
  }
};

type Language = 'ar' | 'en';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, substitutions?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, substitutions?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key as any] || translations.en[key];
    if (substitutions) {
        Object.entries(substitutions).forEach(([subKey, value]) => {
            translation = translation.replace(`{${subKey}}`, String(value));
        });
    }
    return translation;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};