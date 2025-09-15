import { useState } from 'react';
import type { Product, Sale, Invoice, SalesReturn, InvoiceReturn, FawrySale, SaleItem, Customer, User, Role, LogEntry, AnyRecord, DeletedRecordType, RecordType, Payment, CompanyInfo, PrintSettings } from '../types';
import { PaymentStatus } from '../types';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prevState: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

const defaultUsers: User[] = [
    { id: '1', name: 'المدير', username: 'kero102', password: 'koko102', role: 'manager' },
    { id: '2', name: 'موظف مبيعات', username: 'joker101', password: 'joker', role: 'employee' },
    { id: '3', name: 'محاسب', username: 'acc123', password: 'acc123', role: 'accountant' },
]

export const useAppData = () => {
  // Data states
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [archivedInvoices, setArchivedInvoices] = useLocalStorage<Invoice[]>('archivedInvoices', []);
  const [salesReturns, setSalesReturns] = useLocalStorage<SalesReturn[]>('salesReturns', []);
  const [invoiceReturns, setInvoiceReturns] = useLocalStorage<InvoiceReturn[]>('invoiceReturns', []);
  const [fawrySales, setFawrySales] = useLocalStorage<FawrySale[]>('fawrySales', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [lastRecordNumber, setLastRecordNumber] = useLocalStorage<number>('lastRecordNumber', 0);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', {
    name: 'مؤسسة كيرو للأدوات الصحية',
    address: '123 شارع المثال، القاهرة، مصر',
    phone: '0123-456-7890',
    logo: '',
    logoOpacity: 1.0
  });
   const [printSettings, setPrintSettings] = useLocalStorage<PrintSettings>('printSettings', {
    showCostOnPrint: false,
    footerText: 'شكراً لتعاملكم معنا!',
    fontSize: 10,
  });
  
  // Stage 3 states
  const [users, setUsers] = useLocalStorage<User[]>('users', defaultUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User>('currentUser', users[0]);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [deletedSales, setDeletedSales] = useLocalStorage<Sale[]>('deletedSales', []);
  const [deletedInvoices, setDeletedInvoices] = useLocalStorage<Invoice[]>('deletedInvoices', []);
  const [deletedArchivedInvoices, setDeletedArchivedInvoices] = useLocalStorage<Invoice[]>('deletedArchivedInvoices', []);
  const [deletedSalesReturns, setDeletedSalesReturns] = useLocalStorage<SalesReturn[]>('deletedSalesReturns', []);
  const [deletedInvoiceReturns, setDeletedInvoiceReturns] = useLocalStorage<InvoiceReturn[]>('deletedInvoiceReturns', []);
  const [deletedFawrySales, setDeletedFawrySales] = useLocalStorage<FawrySale[]>('deletedFawrySales', []);

  // --- Stage 3: Logging ---
  const addLog = (action: string) => {
    const newLog: LogEntry = {
      id: new Date().toISOString(),
      user: currentUser.name,
      action,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- User Management ---
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === id) {
            const updatedUser = { ...user, ...updates };
            // Don't save an empty password
            if (updates.password === '') {
                delete updatedUser.password;
            }
            addLog(` تحديث بيانات المستخدم: ${user.name}`);
            return updatedUser;
        }
        return user;
    }));
  };
  
  // --- Company & Print Info ---
  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
      setCompanyInfo(prev => ({...prev, ...info}));
      addLog('تحديث معلومات المؤسسة');
  }

  const updatePrintSettings = (settings: Partial<PrintSettings>) => {
      setPrintSettings(prev => ({ ...prev, ...settings }));
      addLog('تحديث إعدادات الطباعة');
  }


  // --- Product Management ---
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: new Date().toISOString() };
    setProducts(prev => [...prev, newProduct]);
    addLog(`إضافة منتج: ${product.name}`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addLog(`تحديث منتج: ${updates.name || 'ID ' + id}`);
  };

  const deleteProduct = (id: string) => {
    const productName = products.find(p => p.id === id)?.name || 'ID ' + id;
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog(`حذف منتج: ${productName}`);
  };
  
  // --- Customer Management ---
  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = { ...customerData, id: new Date().toISOString() };
    setCustomers(prev => [...prev, newCustomer]);
    addLog(`إضافة عميل: ${customerData.name}`);
    return newCustomer;
  };
  
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addLog(`تحديث عميل: ${updates.name || 'ID ' + id}`);
  };
  
  const deleteCustomer = (id: string) => {
    const customerName = customers.find(c => c.id === id)?.name || 'ID ' + id;
    setCustomers(prev => prev.filter(c => c.id !== id));
    addLog(`حذف عميل: ${customerName}`);
  };

  // --- Stock & Record Utils ---
  const updateStock = (items: SaleItem[], operation: 'subtract' | 'add') => {
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                if (operation === 'subtract') {
                    newProducts[productIndex].quantity -= item.quantity;
                } else {
                    newProducts[productIndex].quantity += item.quantity;
                }
            }
        });
        return newProducts;
    });
  };
  
  const getNextRecordNumber = () => {
      const nextNumber = lastRecordNumber + 1;
      setLastRecordNumber(nextNumber);
      return nextNumber;
  }

  const createRecordBase = (data: any) => {
      const total = data.items.reduce((sum: number, item: SaleItem) => sum + item.price * item.quantity, 0);
      const totalCost = data.items.reduce((sum: number, item: SaleItem) => sum + item.cost * item.quantity, 0);
      const discount = data.discount || 0;
      const finalTotal = total - discount;
      const profit = finalTotal - totalCost;

      const paymentStatus = data.paymentStatus || PaymentStatus.Paid;
      
      let amountPaid = data.amountPaid;
      if (amountPaid === undefined) {
          amountPaid = (paymentStatus === PaymentStatus.Paid) ? finalTotal : 0;
      }
      const amountRemaining = finalTotal - amountPaid;
      
      const payments: Payment[] = [];
      if (amountPaid > 0) {
        payments.push({
            amount: amountPaid,
            date: new Date().toISOString(),
            createdBy: currentUser.name,
        });
      }
      
      const customer = customers.find(c => c.id === data.customerId);

      return {
          ...data,
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          recordNumber: getNextRecordNumber(),
          total,
          totalCost,
          profit,
          discount,
          finalTotal,
          createdBy: currentUser.name,
          paymentStatus,
          amountPaid,
          amountRemaining,
          payments,
          customerPhone: customer?.phone,
          customerAddress: customer?.address,
      }
  }

  // --- Sales & Invoices ---
  const addSale = (saleData: any) => {
    const newSale: Sale = createRecordBase(saleData);
    updateStock(saleData.items, 'subtract');
    setSales(prev => [...prev, newSale]);
    addLog(`إنشاء عملية بيع #${newSale.recordNumber} للعميل: ${newSale.customerName}`);
  };

  const addInvoice = (invoiceData: any, archive: boolean) => {
    const newInvoice: Invoice = createRecordBase(invoiceData);
    if (archive) {
        setArchivedInvoices(prev => [...prev, newInvoice]);
        addLog(`أرشفة فاتورة #${newInvoice.recordNumber} للعميل: ${newInvoice.customerName}`);
    } else {
        updateStock(invoiceData.items, 'subtract');
        setInvoices(prev => [...prev, newInvoice]);
        addLog(`إنشاء فاتورة #${newInvoice.recordNumber} للعميل: ${newInvoice.customerName}`);
    }
  };

  const addFawrySale = (saleData: any) => {
    const newSale: FawrySale = createRecordBase(saleData);
    // Fawry sales do not affect stock
    setFawrySales(prev => [...prev, newSale]);
    addLog(`إنشاء عملية فوري #${newSale.recordNumber} للعميل: ${newSale.customerName}`);
  };

  // --- Returns ---
  const addSalesReturn = (returnData: any) => {
    const newReturn: SalesReturn = createRecordBase(returnData);
    updateStock(returnData.items, 'add');
    setSalesReturns(prev => [...prev, newReturn]);
    addLog(`إنشاء مرتجع مبيعات #${newReturn.recordNumber}`);
  };

  const addInvoiceReturn = (returnData: any) => {
    const newReturn: InvoiceReturn = createRecordBase(returnData);
    updateStock(returnData.items, 'add');
    setInvoiceReturns(prev => [...prev, newReturn]);
    addLog(`إنشاء مرتجع فاتورة #${newReturn.recordNumber}`);
  };

  const unarchiveInvoice = (id: string) => {
    const invoiceToUnarchive = archivedInvoices.find(inv => inv.id === id);
    if (invoiceToUnarchive) {
      updateStock(invoiceToUnarchive.items, 'subtract');
      setInvoices(prev => [invoiceToUnarchive, ...prev].sort((a,b) => b.recordNumber - a.recordNumber));
      setArchivedInvoices(prev => prev.filter(inv => inv.id !== id));
      addLog(`نقل الفاتورة #${invoiceToUnarchive.recordNumber} من الأرشيف إلى الفواتير`);
    }
  };

  const addCustomerPayment = (customerId: string, paymentAmount: number) => {
    let remainingPayment = paymentAmount;
    
    const updaters = {
        sales: [...sales],
        invoices: [...invoices],
        fawrySales: [...fawrySales],
    };

    const debts = [
        ...updaters.sales,
        ...updaters.invoices,
        ...updaters.fawrySales,
    ]
    .filter(rec => rec.customerId === customerId && rec.amountRemaining > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const debt of debts) {
        if (remainingPayment <= 0) break;
        
        const paymentForThisRecord = Math.min(remainingPayment, debt.amountRemaining);
        
        const newPayment: Payment = {
            amount: paymentForThisRecord,
            date: new Date().toISOString(),
            createdBy: currentUser.name,
        };
        
        debt.payments = [...(debt.payments || []), newPayment];
        debt.amountPaid += paymentForThisRecord;
        debt.amountRemaining -= paymentForThisRecord;
        
        if (debt.amountRemaining <= 0.001) {
            debt.paymentStatus = PaymentStatus.Paid;
            debt.amountRemaining = 0;
        } else {
            debt.paymentStatus = PaymentStatus.Partial;
        }
        
        remainingPayment -= paymentForThisRecord;
    }
    
    setSales(updaters.sales);
    setInvoices(updaters.invoices);
    setFawrySales(updaters.fawrySales);

    const customerName = customers.find(c => c.id === customerId)?.name || 'N/A';
    addLog(`إضافة دفعة بقيمة ${paymentAmount.toFixed(2)} للعميل ${customerName}`);
  };

  // --- Stage 3: Trash Can ---
  const softDeleteRecord = (id: string, type: RecordType) => {
    let sourceArray, setSourceArray, setDeletedArray;
    let stockOperation: 'add' | 'subtract' | 'none' = 'none';
    let recordToDelete: AnyRecord | undefined;

    switch(type){
        case 'sales': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [sales, setSales, setDeletedSales, 'add']; break;
        case 'invoices': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [invoices, setInvoices, setDeletedInvoices, 'add']; break;
        case 'archivedInvoices': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [archivedInvoices, setArchivedInvoices, setDeletedArchivedInvoices, 'none']; break;
        case 'salesReturns': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [salesReturns, setSalesReturns, setDeletedSalesReturns, 'subtract']; break;
        case 'invoiceReturns': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [invoiceReturns, setInvoiceReturns, setDeletedInvoiceReturns, 'subtract']; break;
        case 'fawrySales': [sourceArray, setSourceArray, setDeletedArray, stockOperation] = [fawrySales, setFawrySales, setDeletedFawrySales, 'none']; break; // No stock op
        default: return;
    }

    recordToDelete = sourceArray.find(r => r.id === id);
    if(recordToDelete) {
        if (stockOperation !== 'none') updateStock(recordToDelete.items, stockOperation);
        setDeletedArray(prev => [recordToDelete, ...prev]);
        setSourceArray(prev => prev.filter(r => r.id !== id));
        addLog(`نقل السجل #${recordToDelete.recordNumber} إلى سلة المهملات`);
    }
  }
  
  const restoreRecord = (id: string, type: DeletedRecordType) => {
    let sourceArray, setSourceArray, setRestoredArray;
    let stockOperation: 'add' | 'subtract' | 'none' = 'none';
    let recordToRestore: AnyRecord | undefined;

    switch(type){
        case 'deletedSales': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedSales, setDeletedSales, setSales, 'subtract']; break;
        case 'deletedInvoices': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedInvoices, setDeletedInvoices, setInvoices, 'subtract']; break;
        case 'deletedArchivedInvoices': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedArchivedInvoices, setDeletedArchivedInvoices, setArchivedInvoices, 'none']; break;
        case 'deletedSalesReturns': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedSalesReturns, setDeletedSalesReturns, setSalesReturns, 'add']; break;
        case 'deletedInvoiceReturns': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedInvoiceReturns, setDeletedInvoiceReturns, setInvoiceReturns, 'add']; break;
        case 'deletedFawrySales': [sourceArray, setSourceArray, setRestoredArray, stockOperation] = [deletedFawrySales, setDeletedFawrySales, setFawrySales, 'none']; break; // No stock op
        default: return;
    }
    
    recordToRestore = sourceArray.find(r => r.id === id);
    if(recordToRestore){
        if (stockOperation !== 'none') updateStock(recordToRestore.items, stockOperation);
        setRestoredArray(prev => [recordToRestore, ...prev].sort((a,b) => b.recordNumber - a.recordNumber));
        setSourceArray(prev => prev.filter(r => r.id !== id));
        addLog(`استعادة السجل #${recordToRestore.recordNumber} من سلة المهملات`);
    }
  };

  const permanentDeleteRecord = (id: string, type: DeletedRecordType) => {
      let setDeletedArray;
      let recordToDelete;
      switch(type){
          case 'deletedSales': recordToDelete = deletedSales.find(r=>r.id===id); setDeletedArray = setDeletedSales; break;
          case 'deletedInvoices': recordToDelete = deletedInvoices.find(r=>r.id===id); setDeletedArray = setDeletedInvoices; break;
          case 'deletedArchivedInvoices': recordToDelete = deletedArchivedInvoices.find(r=>r.id===id); setDeletedArray = setDeletedArchivedInvoices; break;
          case 'deletedSalesReturns': recordToDelete = deletedSalesReturns.find(r=>r.id===id); setDeletedArray = setDeletedSalesReturns; break;
          case 'deletedInvoiceReturns': recordToDelete = deletedInvoiceReturns.find(r=>r.id===id); setDeletedArray = setDeletedInvoiceReturns; break;
          case 'deletedFawrySales': recordToDelete = deletedFawrySales.find(r=>r.id===id); setDeletedArray = setDeletedFawrySales; break;
          default: return;
      }
      if(recordToDelete){
        setDeletedArray(prev => prev.filter(r => r.id !== id));
        addLog(`حذف السجل #${recordToDelete.recordNumber} نهائياً`);
      }
  };

  // --- Stage 3: Backup & Restore ---
  const backupData = () => {
    const data = {
        products, sales, invoices, archivedInvoices, salesReturns, invoiceReturns, fawrySales, customers, lastRecordNumber, logs,
        deletedSales, deletedInvoices, deletedArchivedInvoices, deletedSalesReturns, deletedInvoiceReturns, deletedFawrySales,
        users, companyInfo, printSettings,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('إنشاء نسخة احتياطية للبيانات');
  };

  const restoreData = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        // Basic validation
        if (!data.products || !data.sales || !data.users) {
            throw new Error("Invalid backup file format.");
        }
        setProducts(data.products || []);
        setSales(data.sales || []);
        setInvoices(data.invoices || []);
        setArchivedInvoices(data.archivedInvoices || []);
        setSalesReturns(data.salesReturns || []);
        setInvoiceReturns(data.invoiceReturns || []);
        setFawrySales(data.fawrySales || []);
        setCustomers(data.customers || []);
        setLastRecordNumber(data.lastRecordNumber || 0);
        setLogs(data.logs || []);
        setDeletedSales(data.deletedSales || []);
        setDeletedInvoices(data.deletedInvoices || []);
        setDeletedArchivedInvoices(data.deletedArchivedInvoices || []);
        setDeletedSalesReturns(data.deletedSalesReturns || []);
        setDeletedInvoiceReturns(data.deletedInvoiceReturns || []);
        setDeletedFawrySales(data.deletedFawrySales || []);
        setUsers(data.users || defaultUsers);
        setCompanyInfo(data.companyInfo || { name: 'مؤسسة كيرو للأدوات الصحية', address: '', phone: '', logo: '', logoOpacity: 1.0 });
        setPrintSettings(data.printSettings || { showCostOnPrint: false, footerText: 'شكراً لتعاملكم معنا!', fontSize: 10 });
        addLog('استعادة البيانات من نسخة احتياطية');
        return true;
    } catch (error) {
        console.error("Failed to parse or restore backup file", error);
        return false;
    }
  };
  

  return {
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer, updateCustomer, deleteCustomer,
    // Sales
    sales, addSale,
    invoices, addInvoice,
    archivedInvoices,
    salesReturns, addSalesReturn,
    invoiceReturns, addInvoiceReturn,
    fawrySales, addFawrySale,
    unarchiveInvoice,
    addCustomerPayment,
    // Professional features
    users, currentUser, setCurrentUser, updateUser,
    logs, addLog,
    allRecords: { sales, invoices, archivedInvoices, salesReturns, invoiceReturns, fawrySales },
    deletedRecords: { deletedSales, deletedInvoices, deletedArchivedInvoices, deletedSalesReturns, deletedInvoiceReturns, deletedFawrySales },
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    backupData,
    restoreData,
    companyInfo, updateCompanyInfo,
    printSettings, updatePrintSettings,
  };
};