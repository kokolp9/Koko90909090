
import React, { useState, useMemo, useEffect, useRef, ChangeEvent } from 'react';
import type { Page, Product, SaleItem, AnyRecord, RecordType, Customer, User, Role, LogEntry, DeletedRecordType, Payment, CompanyInfo, PrintSettings } from './types';
import { PaymentStatus, FawryPaymentType } from './types';
import { useAppData } from './useAppData';
import { DashboardIcon, InventoryIcon, SalesIcon, ReturnsIcon, RecordsIcon, ReportsIcon, CustomersIcon, LogoutIcon, PlusIcon, TrashIcon, EditIcon, EyeIcon, PrintIcon, DownloadIcon, SunIcon, MoonIcon, LogIcon, RestoreIcon, UserSwitchIcon, ShareIcon, PdfIcon, ExcelIcon, SettingsIcon, SparklesIcon, SpinnerIcon, WhatsAppIcon, BrainCircuitIcon } from './components/icons';
import Modal from './components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslation } from './i18n';
import { useNotification } from './components/Notification';
// Fix: Import Chat for AI Assistant
import { GoogleGenAI, Chat } from "@google/genai";


// ===================================================================================
// AUTH & PERMISSIONS
// ===================================================================================
const usePermissions = (role: Role) => {
    const permissions = {
        canViewDashboard: true,
        canManageInventory: ['manager', 'employee'].includes(role),
        canManageCustomers: ['manager', 'employee'].includes(role),
        canCreateSales: ['manager', 'employee'].includes(role),
        canManageReturns: ['manager', 'employee'].includes(role),
        canViewAllRecords: ['manager', 'accountant', 'employee'].includes(role),
        canDeleteRecords: ['manager'].includes(role),
        canViewReports: ['manager', 'accountant'].includes(role),
        canManageUsers: ['manager'].includes(role),
        canViewLogs: ['manager'].includes(role),
        canBackupData: ['manager'].includes(role),
    };
    return permissions;
};


// ===================================================================================
// THEME MANAGEMENT
// ===================================================================================
const useTheme = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const body = window.document.body;
        if (theme === 'light') {
            body.classList.remove('dark');
        } else {
            body.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme] as const;
};


// ===================================================================================
// UTILITY COMPONENTS
// ===================================================================================

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg flex items-center space-x-4 rtl:space-x-reverse shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; containerClassName?: string }>(({ label, containerClassName, ...props }, ref) => (
    <div className={containerClassName}>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <input ref={ref} {...props} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50" />
    </div>
));

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; containerClassName?: string }>(({ label, children, containerClassName, ...props }, ref) => (
    <div className={containerClassName}>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <select ref={ref} {...props} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50">
            {children}
        </select>
    </div>
));

const Button: React.FC<{ onClick?: React.MouseEventHandler<HTMLButtonElement>; children: React.ReactNode; className?: string; type?: 'button' | 'submit' | 'reset', disabled?: boolean }> = ({ onClick, children, className = '', type = 'button', disabled = false }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch {
        return "Invalid Date";
    }
}

// ===================================================================================
// LOGIN PAGE
// ===================================================================================

const Login: React.FC<{ onLogin: (user: User) => void; users: User[]; companyName: string }> = ({ onLogin, users, companyName }) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            onLogin(user);
        } else {
            setError(t('loginError'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 border dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{companyName}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{t('systemName')}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input label={t('username')} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('username')} required />
                    <Input label={t('password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} required />
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full !py-3 !text-lg">{t('login')}</Button>
                </form>
            </div>
        </div>
    );
};

// ===================================================================================
// SIDEBAR COMPONENT
// ===================================================================================

const Sidebar: React.FC<{ 
    currentPage: Page; 
    onNavigate: (page: Page) => void; 
    onLogout: () => void; 
    appData: ReturnType<typeof useAppData>;
}> = ({ currentPage, onNavigate, onLogout, appData }) => {
    const { currentUser, companyInfo } = appData;
    const permissions = usePermissions(currentUser.role);
    const { t } = useTranslation();
    
    const navItems: { page: Page; label: string; icon: React.ReactNode, permission: boolean }[] = [
        { page: 'dashboard', label: t('dashboard'), icon: <DashboardIcon />, permission: permissions.canViewDashboard },
        { page: 'inventory', label: t('inventoryManagement'), icon: <InventoryIcon />, permission: permissions.canManageInventory },
        { page: 'customers', label: t('customerManagement'), icon: <CustomersIcon />, permission: permissions.canManageCustomers },
        { page: 'sales', label: t('salesAndInvoices'), icon: <SalesIcon />, permission: permissions.canCreateSales },
        { page: 'returns', label: t('returns'), icon: <ReturnsIcon />, permission: permissions.canManageReturns },
        { page: 'records', label: t('records'), icon: <RecordsIcon />, permission: permissions.canViewAllRecords },
        { page: 'reports', label: t('reports'), icon: <ReportsIcon />, permission: permissions.canViewReports },
        { page: 'settings', label: t('settings'), icon: <SettingsIcon />, permission: true },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-700 p-4 flex flex-col no-print">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{companyInfo.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('welcome')}, {currentUser.name}</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {navItems.filter(item => item.permission).map(item => (
                        <li key={item.page}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate(item.page); }}
                                className={`flex items-center space-x-3 rtl:space-x-reverse p-3 my-1 rounded-md text-lg transition-colors ${currentPage === item.page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                    <p>{t('developedBy')}</p>
                     <a href="http://wa.me/+201211236140" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-green-600 dark:text-green-500 hover:underline">
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>{t('contactSupport')}</span>
                    </a>
                </div>
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-500/10"
                >
                    <LogoutIcon className="w-5 h-5"/>
                    <span className="text-sm font-semibold">{t('logout')}</span>
                </a>
            </div>
        </aside>
    );
};

// ===================================================================================
// PAGE COMPONENTS
// ===================================================================================
interface PageProps {
  appData: ReturnType<typeof useAppData>;
}

const DashboardPage: React.FC<PageProps> = ({ appData }) => {
    const { products, allRecords, backupData, restoreData, currentUser } = appData;
    const permissions = usePermissions(currentUser.role);
    const restoreInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const { addNotification } = useNotification();

    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalSalesValue = [...allRecords.sales, ...allRecords.invoices, ...allRecords.fawrySales]
        .reduce((sum, s) => sum + s.finalTotal, 0);
    const totalProfit = [...allRecords.sales, ...allRecords.invoices, ...allRecords.fawrySales]
        .reduce((sum, s) => sum + s.profit, 0);
    const lowStockItems = products.filter(p => p.quantity <= p.minStock);

    const dailyProfit = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return [...allRecords.sales, ...allRecords.invoices, ...allRecords.fawrySales]
            .filter(s => s.date.startsWith(todayStr))
            .reduce((sum, s) => sum + s.profit, 0);
    }, [allRecords]);


    const handleBackup = () => {
        backupData();
        addNotification(t('backupSuccess'), 'success');
    }

    const handleRestoreClick = () => {
        restoreInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const success = restoreData(event.target?.result as string);
                 if (success) {
                    addNotification(t('restoreSuccess'), 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    addNotification(t('restoreFailed'), 'error');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('dashboard')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('totalProducts')} value={products.length} icon={<InventoryIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />} />
                <StatCard title={t('stockValue')} value={`${totalStockValue.toFixed(2)} ج.م`} icon={<SalesIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />} />
                <StatCard title={t('totalSales')} value={`${totalSalesValue.toFixed(2)} ج.م`} icon={<RecordsIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />} />
                
                {permissions.canViewReports && (
                    <>
                        <StatCard title={t('totalProfits')} value={`${totalProfit.toFixed(2)} ج.م`} icon={<ReportsIcon className="w-8 h-8 text-green-500 dark:text-green-400" />} />
                        <StatCard title={t('dailyProfit')} value={`${dailyProfit.toFixed(2)} ج.م`} icon={<ReportsIcon className="w-8 h-8 text-purple-500 dark:text-purple-400" />} />
                    </>
                )}
            </div>

            {permissions.canBackupData && (
                <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('backupAndRestore')}</h3>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                         <Button onClick={handleBackup} className="bg-green-600 hover:bg-green-700">{t('createBackup')}</Button>
                         <Button onClick={handleRestoreClick} className="bg-yellow-600 hover:bg-yellow-700">{t('restoreData')}</Button>
                         <input type="file" ref={restoreInputRef} onChange={handleFileChange} accept=".json" className="hidden"/>
                    </div>
                </div>
            )}

            {lowStockItems.length > 0 && (
                <div className="mt-8 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">{t('lowStockWarning')}</h3>
                    <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-400 space-y-1">
                        {lowStockItems.map(item => (
                            <li key={item.id}>{item.name} ({t('remainingQuantity')}: {item.quantity})</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const InventoryPage: React.FC<PageProps> = ({ appData }) => {
    const { products, addProduct, updateProduct, deleteProduct, companyInfo } = appData;
    const { t, language } = useTranslation();
    const { addNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [productImage, setProductImage] = useState<string | undefined>(undefined);
    const printableRef = useRef<HTMLDivElement>(null);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setProductImage(product?.imageUrl);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setProductImage(undefined);
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProductImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const productData = {
            name: formData.get('name') as string,
            quantity: parseInt(formData.get('quantity') as string, 10),
            price: parseFloat(formData.get('price') as string),
            cost: parseFloat(formData.get('cost') as string),
            minStock: parseInt(formData.get('minStock') as string, 10),
            imageUrl: productImage,
        };

        if (isNaN(productData.quantity) || isNaN(productData.price) || isNaN(productData.cost) || isNaN(productData.minStock)) {
            addNotification(t('invalidNumberError'), 'error');
            return;
        }

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
        } else {
            addProduct(productData);
        }
        addNotification(t('productSavedSuccess'), 'success');
        handleCloseModal();
    };
    
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        window.print();
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('inventoryManagement')}</h2>
                <div className="flex space-x-2 rtl:space-x-reverse no-print">
                    <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700">
                        <PrintIcon />
                        <span>{t('print')}</span>
                    </Button>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon />
                        <span>{t('addProduct')}</span>
                    </Button>
                </div>
            </div>
            <div className="mb-4 no-print">
                <Input type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} label="" />
            </div>
            <div ref={printableRef} className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto shadow-xl printable-area">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white p-4 hidden print:block">{t('inventoryReport')}</h2>
                <table className="w-full min-w-max text-right rtl:text-right">
                    <thead className="bg-gray-100 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4 hidden print:table-cell">{t('productImage')}</th>
                            <th className="p-4">{t('productName')}</th>
                            <th className="p-4">{t('quantity')}</th>
                            <th className="p-4">{t('price')}</th>
                            <th className="p-4">{t('cost')}</th>
                             <th className="p-4">{t('alertThreshold')}</th>
                            <th className="p-4 no-print">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="p-2 hidden print:table-cell">
                                    <img src={product.imageUrl || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                </td>
                                <td className="p-4 font-semibold">{product.name}</td>
                                <td className={`p-4 ${product.quantity <= product.minStock ? 'text-red-500 font-bold' : ''}`}>{product.quantity}</td>
                                <td className="p-4">{product.price.toFixed(2)} ج.م</td>
                                <td className="p-4">{product.cost.toFixed(2)} ج.م</td>
                                <td className="p-4">{product.minStock}</td>
                                <td className="p-4 flex space-x-2 rtl:space-x-reverse no-print">
                                    <button onClick={() => handleOpenModal(product)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 p-1"><EditIcon /></button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? t('editProduct') : t('addProductNew')}>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <Input label={t('productName')} name="name" type="text" defaultValue={editingProduct?.name} required />
                    <Input label={t('quantity')} name="quantity" type="number" defaultValue={editingProduct?.quantity} required />
                    <Input label={t('price')} name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                    <Input label={t('cost')} name="cost" type="number" step="0.01" defaultValue={editingProduct?.cost || 0} required />
                    <Input label={`${t('alertThreshold')} (${t('lowestQuantity')})`} name="minStock" type="number" defaultValue={editingProduct?.minStock || 0} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('productImage')}</label>
                        <input type="file" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"/>
                        {productImage && <img src={productImage} alt="Preview" className="mt-2 w-20 h-20 rounded-md object-cover" />}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">{t('save')}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const CustomersPage: React.FC<PageProps> = ({ appData }) => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, allRecords } = appData;
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenEditModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsEditModalOpen(true);
    };
    const handleCloseEditModal = () => setIsEditModalOpen(false);

    const handleOpenProfileModal = (customer: Customer) => {
        setViewingCustomer(customer);
        setIsProfileModalOpen(true);
    };
    const handleCloseProfileModal = () => setIsProfileModalOpen(false);

    const handleSaveCustomer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerData = {
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
        };

        if (editingCustomer) {
            updateCustomer(editingCustomer.id, customerData);
        } else {
            addCustomer(customerData);
        }
        addNotification(t('customerSavedSuccess'), 'success');
        handleCloseEditModal();
    };

    const getCustomerStats = (customerId: string) => {
        const customerRecords = Object.values(allRecords).flat().filter(rec => rec.customerId === customerId);
        const operationsCount = customerRecords.length;
        return { operationsCount };
    };
    
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone?.includes(searchTerm)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('customerManagement')}</h2>
                <Button onClick={() => handleOpenEditModal()}>
                    <PlusIcon />
                    <span>{t('addCustomer')}</span>
                </Button>
            </div>
             <div className="mb-4">
                <Input type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} label="" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto shadow-xl">
                <table className="w-full min-w-max text-right">
                    <thead className="bg-gray-100 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4">{t('customer')}</th>
                            <th className="p-4">{t('phone')}</th>
                            <th className="p-4">{t('address')}</th>
                            <th className="p-4">{t('operationsCount')}</th>
                            <th className="p-4">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => {
                            const stats = getCustomerStats(customer.id);
                            return (
                                <tr key={customer.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4 font-semibold">{customer.name}</td>
                                    <td className="p-4">{customer.phone}</td>
                                    <td className="p-4">{customer.address}</td>
                                    <td className="p-4">{stats.operationsCount}</td>
                                    <td className="p-4 flex space-x-2 rtl:space-x-reverse">
                                        <button onClick={() => handleOpenProfileModal(customer)} className="text-green-500 dark:text-green-400 p-1"><EyeIcon /></button>
                                        <button onClick={() => handleOpenEditModal(customer)} className="text-blue-500 dark:text-blue-400 p-1"><EditIcon /></button>
                                        <button onClick={() => deleteCustomer(customer.id)} className="text-red-500 dark:text-red-400 p-1"><TrashIcon /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title={editingCustomer ? t('editCustomer') : t('addCustomerNew')}>
                <form onSubmit={handleSaveCustomer} className="space-y-4">
                    <Input label={t('customer')} name="name" type="text" defaultValue={editingCustomer?.name} required />
                    <Input label={t('phone')} name="phone" type="text" defaultValue={editingCustomer?.phone} />
                    <Input label={t('address')} name="address" type="text" defaultValue={editingCustomer?.address} />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">{t('save')}</Button>
                    </div>
                </form>
            </Modal>
            
            {viewingCustomer && <CustomerProfileModal isOpen={isProfileModalOpen} onClose={handleCloseProfileModal} customer={viewingCustomer} appData={appData} />}
        </div>
    );
};

const CustomerProfileModal: React.FC<{isOpen: boolean, onClose: () => void, customer: Customer, appData: PageProps['appData']}> = ({isOpen, onClose, customer, appData}) => {
    const { allRecords, addCustomerPayment } = appData;
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    const customerRecords = useMemo(() => Object.entries(allRecords)
      .flatMap(([type, records]) => records.map(r => ({...r, type: type as RecordType})))
      .filter(rec => rec.customerId === customer.id)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [allRecords, customer.id]);
      
    const customerPayments = useMemo(() => customerRecords
        .flatMap(r => r.payments.map(p => ({...p, recordNumber: r.recordNumber})))
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [customerRecords]);

    const stats = useMemo(() => {
        const totalPurchases = customerRecords.reduce((sum, rec) => sum + (['salesReturns', 'invoiceReturns'].includes(rec.type) ? 0 : rec.finalTotal), 0);
        const totalDebt = customerRecords.reduce((sum, rec) => sum + rec.amountRemaining, 0);
        return { totalPurchases, totalDebt };
    }, [customerRecords]);
    
    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount || paymentAmount <= 0) {
            addNotification(t('paymentDetailsError'), 'error');
            return;
        }
        addCustomerPayment(customer.id, paymentAmount);
        addNotification(t('operationSuccess'), 'success');
        setPaymentAmount(0);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t('customerProfile')}: ${customer.name}`}>
            <div className="space-y-4 text-gray-800 dark:text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard title={t('totalPurchases')} value={`${stats.totalPurchases.toFixed(2)} ج.م`} icon={<SalesIcon className="w-6 h-6 text-blue-500" />} />
                    <StatCard title={t('totalDebt')} value={`${stats.totalDebt.toFixed(2)} ج.م`} icon={<RecordsIcon className="w-6 h-6 text-red-500" />} />
                </div>
                
                {stats.totalDebt > 0 && (
                     <form onSubmit={handleAddPayment} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <h4 className="font-bold">{t('addPayment')}</h4>
                        <div className="flex gap-2 items-end">
                             <Input label="" type="number" placeholder={t('paymentAmount')} value={paymentAmount || ''} onChange={e => setPaymentAmount(parseFloat(e.target.value))} containerClassName="flex-grow"/>
                             <Button type="submit" className="self-end">{t('makePayment')}</Button>
                        </div>
                    </form>
                )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-600">
                    <div>
                        <h4 className="font-bold mb-2">{t('allCustomerRecords')}</h4>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            {customerRecords.length > 0 ? (
                                <ul className="space-y-2">
                                    {customerRecords.map(rec => (
                                        <li key={rec.id} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-sm">
                                            <div className="flex justify-between">
                                                <span>#{rec.recordNumber} - ({t(rec.type as any)})</span>
                                                <span className="font-bold">{rec.finalTotal.toFixed(2)} ج.م</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(rec.date)}</div>
                                            {rec.amountRemaining > 0 && <div className="text-xs text-red-500">{t('amountRemaining')}: {rec.amountRemaining.toFixed(2)}</div>}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>{t('noTransactions')}</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold mb-2">{t('customerPayments')}</h4>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            {customerPayments.length > 0 ? (
                                <ul className="space-y-2">
                                    {customerPayments.map((p, i) => (
                                        <li key={i} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-bold">{p.amount.toFixed(2)} ج.م</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400"> (فاتورة #{p.recordNumber})</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(p.date)}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>{t('noPayments')}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const SalesPage: React.FC<PageProps> = ({ appData }) => {
    const { t } = useTranslation();
    const { products, customers, addSale, addInvoice, addFawrySale, addCustomer } = appData;
    const { addNotification } = useNotification();
    
    const [recordType, setRecordType] = useState<'sale' | 'invoice' | 'fawrySale'>('sale');
    const [items, setItems] = useState<SaleItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    
    const [discount, setDiscount] = useState<number>(0);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.Paid);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [fawryPaymentType, setFawryPaymentType] = useState<FawryPaymentType>(FawryPaymentType.Card);
    
    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
    const finalTotal = subtotal - discount;
    const amountRemaining = finalTotal - (paymentStatus === PaymentStatus.Paid ? finalTotal : amountPaid);

    const handleCustomerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomerName(value);
        setSelectedCustomer(null);
        if (value) {
            setCustomerSuggestions(customers.filter(c => c.name.toLowerCase().includes(value.toLowerCase())));
        } else {
            setCustomerSuggestions([]);
        }
    };

    const selectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setSelectedCustomer(customer);
        setCustomerSuggestions([]);
    };

    const handleAddItem = (item: Omit<SaleItem, 'productName' | 'cost'>) => {
        const product = products.find(p => p.id === item.productId);
        if (!product || item.quantity <= 0) return;
        
        // Allow adding to fawry sales regardless of stock
        if (recordType !== 'fawrySale' && product.quantity < item.quantity) {
            addNotification(t('lowStockAlert', { productName: product.name, quantity: product.quantity }), 'warning');
            return;
        }

        const existingItemIndex = items.findIndex(i => i.productId === item.productId);
        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += item.quantity;
            setItems(newItems);
        } else {
            setItems([...items, { ...item, productName: product.name, cost: product.cost }]);
        }
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const resetForm = () => {
        setItems([]);
        setSelectedCustomer(null);
        setCustomerName('');
        setDiscount(0);
        setPaymentStatus(PaymentStatus.Paid);
        setAmountPaid(0);
    };

    const handleSubmit = (e: React.MouseEvent, archive: boolean = false) => {
        e.preventDefault();
        
        let customerToUse: Customer | null = selectedCustomer;

        if (!customerToUse && customerName.trim() === '') {
             addNotification(t('customerRequiredError'), 'error');
            return;
        }
        
        // If no customer is selected but a name is typed, create a new one
        if (!customerToUse && customerName.trim() !== '') {
            customerToUse = addCustomer({ name: customerName.trim() });
        }
        
        if (!customerToUse) { // Should not happen, but as a safeguard
             addNotification(t('customerRequiredError'), 'error');
             return;
        }

        if (items.length === 0) {
             addNotification(t('itemsRequiredError'), 'error');
            return;
        }
        
        const recordData = {
            customerName: customerToUse.name,
            customerId: customerToUse.id,
            items,
            discount,
            paymentStatus,
            amountPaid: paymentStatus === PaymentStatus.Paid ? finalTotal : amountPaid,
        };

        switch(recordType) {
            case 'sale': addSale(recordData); break;
            case 'invoice': addInvoice(recordData, archive); break;
            case 'fawrySale': addFawrySale({ ...recordData, paymentType: fawryPaymentType }); break;
        }
        addNotification(t('operationSuccess'), 'success');
        resetForm();
    };

    const AddItemForm = () => {
        const [productName, setProductName] = useState('');
        const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
        const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
        const [quantity, setQuantity] = useState(1);
        const [showAiButton, setShowAiButton] = useState(false);
        const [isAiCorrecting, setIsAiCorrecting] = useState(false);

        const handleProductInputChange = (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setProductName(value);
            setSelectedProduct(null);
            setShowAiButton(false);
            if(value){
                setProductSuggestions(products.filter(p => p.name.toLowerCase().includes(value.toLowerCase())));
            } else {
                setProductSuggestions([]);
            }
        };
        
        const selectProduct = (product: Product) => {
            setProductName(product.name);
            setSelectedProduct(product);
            setProductSuggestions([]);
            setShowAiButton(false);
        };
        
        const handleProductInputBlur = () => {
            setTimeout(() => {
                if (productName && !selectedProduct) {
                    setShowAiButton(true);
                }
            }, 200);
        };

        const handleAiCorrect = async () => {
            if (!productName || isAiCorrecting) return;
            setIsAiCorrecting(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const productNames = products.map(p => p.name);
                const prompt = `User typed: "${productName}". From this list of products: [${productNames.join(', ')}], find the best match. Return only the single best matching product name from the list. If no good match is found, return "null".`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });
    
                const correctedName = response.text.trim();
    
                if (correctedName && correctedName.toLowerCase() !== 'null') {
                    const matchedProduct = products.find(p => p.name.toLowerCase() === correctedName.toLowerCase());
                    if (matchedProduct) {
                        selectProduct(matchedProduct);
                        addNotification(t('aiCorrectSuccess'), 'success');
                    } else {
                        addNotification(t('aiCorrectFail'), 'error');
                    }
                } else {
                     addNotification(t('aiCorrectFail'), 'error');
                }
            } catch (error) {
                console.error("AI correction failed:", error);
                addNotification(t('aiCorrectFail'), 'error');
            } finally {
                setIsAiCorrecting(false);
                setShowAiButton(false);
            }
        };

        const onAddItem = () => {
            if (selectedProduct) {
                handleAddItem({ productId: selectedProduct.id, quantity, price: selectedProduct.price });
                setProductName('');
                setSelectedProduct(null);
                setQuantity(1);
            }
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="relative md:col-span-2">
                    <Input 
                        label={t('productName')} 
                        value={productName}
                        onChange={handleProductInputChange}
                        onBlur={handleProductInputBlur}
                        placeholder={t('searchProductPlaceholder')}
                    />
                     {showAiButton && !isAiCorrecting && (
                        <button type="button" onClick={handleAiCorrect} title={t('aiCorrectTooltip')} className="absolute top-8 left-2 rtl:right-2 rtl:left-auto text-yellow-400 hover:text-yellow-300 z-10 p-1">
                            <SparklesIcon />
                        </button>
                    )}
                     {isAiCorrecting && (
                        <div className="absolute top-8 left-2 rtl:right-2 rtl:left-auto text-blue-400 p-1">
                            <SpinnerIcon />
                        </div>
                    )}
                    {productSuggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
                            {productSuggestions.map(p => (
                                <li key={p.id} onClick={() => selectProduct(p)} className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer">
                                    {p.name} ({t('remainingQuantity')}: {p.quantity})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Input label={t('quantity')} type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min="1" disabled={!selectedProduct}/>
                <Button onClick={onAddItem} disabled={!selectedProduct}>
                    <PlusIcon /> {t('addItem')}
                </Button>
            </div>
        )
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('salesAndInvoices')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
                    <div className="flex border-b dark:border-gray-700">
                        { (['sale', 'invoice', 'fawrySale'] as const).map(type => (
                             <button key={type} onClick={() => setRecordType(type)} className={`px-4 py-2 -mb-px border-b-2 ${recordType === type ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                 {t(type)}
                             </button>
                        ))}
                    </div>
                    
                    <div className="relative">
                       <Input 
                            label={t('customer')} 
                            value={customerName} 
                            onChange={handleCustomerInputChange} 
                            placeholder={t('customerSearchPlaceholder')}
                        />
                         {customerSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
                                {customerSuggestions.map(c => (
                                    <li key={c.id} onClick={() => selectCustomer(c)} className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer">
                                        {c.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedCustomer && (
                         <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-sm">
                            <h4 className="font-bold text-gray-600 dark:text-gray-300">{t('customerInfo')}</h4>
                             <p>{t('phone')}: {selectedCustomer.phone || 'N/A'}</p>
                            <p>{t('address')}: {selectedCustomer.address || 'N/A'}</p>
                         </div>
                    )}

                    <hr className="dark:border-gray-700"/>
                    <AddItemForm />

                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">{t('cart')}</h3>
                        <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-md">
                            <table className="w-full text-right">
                                <thead className="bg-gray-100 dark:bg-gray-700/50 sticky top-0">
                                    <tr>
                                        <th className="p-2">{t('product')}</th>
                                        <th className="p-2">{t('quantity')}</th>
                                        <th className="p-2">{t('price')}</th>
                                        <th className="p-2">{t('total')}</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.productId} className="border-b dark:border-gray-700">
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2">{item.quantity}</td>
                                            <td className="p-2">{item.price.toFixed(2)}</td>
                                            <td className="p-2">{(item.price * item.quantity).toFixed(2)}</td>
                                            <td className="p-2"><button onClick={() => handleRemoveItem(item.productId)} className="text-red-500"><TrashIcon/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
                    <h3 className="text-2xl font-bold mb-4 border-b dark:border-gray-700 pb-2">{t('total')}</h3>
                    <div className="space-y-4 flex-grow">
                        <div className="flex justify-between text-lg"><span>{t('subtotal')}:</span><span>{subtotal.toFixed(2)} ج.م</span></div>
                        <Input label={t('discount')} type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}/>
                        <div className="flex justify-between text-2xl font-bold text-green-500 pt-2 border-t dark:border-gray-700"><span>{t('finalTotal')}:</span><span>{finalTotal.toFixed(2)} ج.م</span></div>
                        
                        <Select label={t('paymentStatus')} value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}>
                            <option value={PaymentStatus.Paid}>{t('paid')}</option>
                            <option value={PaymentStatus.Partial}>{t('partial')}</option>
                            <option value={PaymentStatus.Deferred}>{t('deferred')}</option>
                        </Select>

                        {paymentStatus === PaymentStatus.Partial && (
                            <Input label={t('amountPaid')} type="number" value={amountPaid} onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}/>
                        )}

                        <div className="flex justify-between text-lg text-red-500">
                            <span>{t('amountRemaining')}:</span><span>{amountRemaining.toFixed(2)} ج.м</span>
                        </div>
                         {recordType === 'fawrySale' && (
                             <Select label="نوع الدفع" value={fawryPaymentType} onChange={e => setFawryPaymentType(e.target.value as FawryPaymentType)}>
                                 {Object.values(FawryPaymentType).map(type => <option key={type} value={type}>{type}</option>)}
                             </Select>
                         )}
                    </div>
                    <div className="mt-6 space-y-2">
                        {recordType === 'invoice' && <Button onClick={(e) => handleSubmit(e, true)} className="w-full bg-yellow-600 hover:bg-yellow-700">{t('archiveInvoice')}</Button>}
                        <Button onClick={handleSubmit} className="w-full">
                            {recordType === 'sale' && t('createSale')}
                            {recordType === 'invoice' && t('createInvoice')}
                            {recordType === 'fawrySale' && t('createFawrySale')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReturnsPage: React.FC<PageProps> = ({ appData }) => {
    const { t } = useTranslation();
    const { products, customers, addSalesReturn, addInvoiceReturn, addCustomer } = appData;
    const { addNotification } = useNotification();
    const [items, setItems] = useState<SaleItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    const [recordType, setRecordType] = useState<'salesReturn' | 'invoiceReturn'>('salesReturn');

    const resetForm = () => {
        setItems([]);
        setSelectedCustomerId(null);
        setCustomerName('');
    };
    
    const handleCustomerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomerName(value);
        setSelectedCustomerId(null);
        if (value) {
            setCustomerSuggestions(customers.filter(c => c.name.toLowerCase().includes(value.toLowerCase())));
        } else {
            setCustomerSuggestions([]);
        }
    };
    
    const selectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setSelectedCustomerId(customer.id);
        setCustomerSuggestions([]);
    };

    const handleAddItem = (product: Product, quantity: number) => {
        if (!product || quantity <= 0) return;
        const newItem: SaleItem = {
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
            cost: product.cost
        };
        const existingItemIndex = items.findIndex(i => i.productId === newItem.productId);
        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            setItems(newItems);
        } else {
            setItems([...items, newItem]);
        }
    };
    
    const handleRemoveItem = (productId: string) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        
        let customerToUse: Customer | undefined = customers.find(c => c.id === selectedCustomerId);

        if (!customerToUse && customerName.trim() === '') {
            addNotification(t('customerRequiredError'), 'error');
            return;
        }
        
        if (!customerToUse && customerName.trim() !== '') {
            customerToUse = addCustomer({ name: customerName.trim() });
        }
        
        if (!customerToUse) {
            addNotification(t('customerRequiredError'), 'error');
            return;
        }

        if (items.length === 0) {
            addNotification(t('itemsRequiredError'), 'error');
            return;
        }

        const returnData = {
            customerName: customerToUse.name,
            customerId: customerToUse.id,
            items,
            discount: 0,
            paymentStatus: PaymentStatus.Paid,
            amountPaid: 0,
        };

        if (recordType === 'salesReturn') {
            addSalesReturn(returnData);
        } else {
            addInvoiceReturn(returnData);
        }

        addNotification(t('operationSuccess'), 'success');
        resetForm();
    };
    
     const AddItemForm = () => {
        const [productName, setProductName] = useState('');
        const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
        const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
        const [quantity, setQuantity] = useState(1);

        const handleProductInputChange = (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setProductName(value);
            setSelectedProduct(null);
            if(value){
                setProductSuggestions(products.filter(p => p.name.toLowerCase().includes(value.toLowerCase())));
            } else {
                setProductSuggestions([]);
            }
        };
        
        const selectProduct = (product: Product) => {
            setProductName(product.name);
            setSelectedProduct(product);
            setProductSuggestions([]);
        };

        const onAddItem = () => {
            if (selectedProduct) {
                handleAddItem(selectedProduct, quantity);
                setProductName('');
                setSelectedProduct(null);
                setQuantity(1);
            }
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="relative md:col-span-2">
                    <Input 
                        label={t('productName')} 
                        value={productName}
                        onChange={handleProductInputChange}
                        placeholder={t('searchProductPlaceholder')}
                    />
                    {productSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
                            {productSuggestions.map(p => (
                                <li key={p.id} onClick={() => selectProduct(p)} className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer">
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Input label={t('quantity')} type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min="1" disabled={!selectedProduct}/>
                <Button onClick={onAddItem} disabled={!selectedProduct}>
                    <PlusIcon /> {t('addItem')}
                </Button>
            </div>
        )
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('returns')}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6 max-w-4xl mx-auto">
                <Select label={t('recordType')} value={recordType} onChange={e => setRecordType(e.target.value as any)}>
                    <option value="salesReturn">{t('salesReturn')}</option>
                    <option value="invoiceReturn">{t('invoiceReturn')}</option>
                </Select>

                <div className="relative">
                    <Input 
                        label={t('customer')} 
                        value={customerName} 
                        onChange={handleCustomerInputChange} 
                        placeholder={t('customerSearchPlaceholder')}
                    />
                    {customerSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto">
                            {customerSuggestions.map(c => (
                                <li key={c.id} onClick={() => selectCustomer(c)} className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer">
                                    {c.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <hr className="dark:border-gray-700"/>
                <AddItemForm />
                
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('items')}</h3>
                    <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-md">
                        <table className="w-full text-right">
                            <thead className="bg-gray-100 dark:bg-gray-700/50 sticky top-0">
                                <tr>
                                    <th className="p-2">{t('product')}</th>
                                    <th className="p-2">{t('quantity')}</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.productId} className="border-b dark:border-gray-700">
                                        <td className="p-2">{item.productName}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2"><button onClick={() => handleRemoveItem(item.productId)} className="text-red-500"><TrashIcon/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">{t('createReturn')}</Button>
            </div>
        </div>
    );
};

const RecordsPage: React.FC<PageProps> = ({ appData }) => {
    const { t } = useTranslation();
    const { allRecords, deletedRecords, softDeleteRecord, restoreRecord, permanentDeleteRecord, unarchiveInvoice } = appData;
    const permissions = usePermissions(appData.currentUser.role);
    type Tab = 'sales' | 'invoices' | 'fawrySales' | 'archivedInvoices' | 'salesReturns' | 'invoiceReturns' | 'trash';
    const [activeTab, setActiveTab] = useState<Tab>('sales');
    const [viewingRecord, setViewingRecord] = useState<AnyRecord | null>(null);
    
    const tabs: {id: Tab, label: string}[] = [
        {id: 'sales', label: t('sales')},
        {id: 'invoices', label: t('invoices')},
        {id: 'fawrySales', label: t('fawrySales')},
        {id: 'archivedInvoices', label: t('archivedInvoices')},
        {id: 'salesReturns', label: t('salesReturns')},
        {id: 'invoiceReturns', label: t('invoiceReturns')},
        {id: 'trash', label: t('trash')}
    ];

    const renderTable = (records: AnyRecord[], recordType: RecordType | DeletedRecordType, isTrash: boolean = false) => (
        <div className="overflow-x-auto">
            <table className="w-full min-w-max text-right">
                <thead className="bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">{t('customer')}</th>
                        <th className="p-3">{t('total')}</th>
                        <th className="p-3">{t('status')}</th>
                        <th className="p-3">{t('date')}</th>
                        <th className="p-3">{t('createdBy')}</th>
                        <th className="p-3">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(rec => (
                        <tr key={rec.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="p-3">{rec.recordNumber}</td>
                            <td className="p-3">{rec.customerName}</td>
                            <td className="p-3">{rec.finalTotal.toFixed(2)}</td>
                            <td className="p-3">{rec.paymentStatus}</td>
                            <td className="p-3 text-sm">{formatDate(rec.date)}</td>
                            <td className="p-3">{rec.createdBy}</td>
                            <td className="p-3 flex space-x-1 rtl:space-x-reverse">
                                <button onClick={() => setViewingRecord(rec)} className="p-1 text-blue-500"><EyeIcon/></button>
                                {isTrash ? (
                                    <>
                                        <button title={t('restore')} onClick={() => restoreRecord(rec.id, recordType as DeletedRecordType)} className="p-1 text-green-500"><RestoreIcon/></button>
                                        <button title={t('deletePermanently')} onClick={() => permanentDeleteRecord(rec.id, recordType as DeletedRecordType)} className="p-1 text-red-500"><TrashIcon/></button>
                                    </>
                                ) : (
                                    <>
                                     {activeTab === 'archivedInvoices' && <button onClick={() => unarchiveInvoice(rec.id)} className="p-1 text-green-500" title={t('unarchive')}><RestoreIcon/></button>}
                                     {permissions.canDeleteRecords && <button title={t('delete')} onClick={() => softDeleteRecord(rec.id, recordType as RecordType)} className="p-1 text-red-500"><TrashIcon/></button>}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const recordsMap = {
        sales: allRecords.sales,
        invoices: allRecords.invoices,
        fawrySales: allRecords.fawrySales,
        archivedInvoices: allRecords.archivedInvoices,
        salesReturns: allRecords.salesReturns,
        invoiceReturns: allRecords.invoiceReturns,
        trash: Object.values(deletedRecords).flat()
    };
    
    const recordTypeMap: Record<Tab, RecordType | DeletedRecordType> = {
        sales: 'sales',
        invoices: 'invoices',
        fawrySales: 'fawrySales',
        archivedInvoices: 'archivedInvoices',
        salesReturns: 'salesReturns',
        invoiceReturns: 'invoiceReturns',
        trash: 'deletedSales' // Placeholder, the action functions determine the real type
    }
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('records')}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                 <div className="flex border-b dark:border-gray-700 overflow-x-auto">
                     {tabs.map(tab => (
                         <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 -mb-px border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                             {tab.label}
                         </button>
                    ))}
                </div>
                {renderTable(recordsMap[activeTab], recordTypeMap[activeTab], activeTab === 'trash')}
            </div>
            
            {viewingRecord && <RecordDetailModal isOpen={!!viewingRecord} onClose={() => setViewingRecord(null)} record={viewingRecord} appData={appData} />}
        </div>
    );
};

const RecordDetailModal: React.FC<{isOpen: boolean, onClose: () => void, record: AnyRecord, appData: PageProps['appData']}> = ({isOpen, onClose, record, appData}) => {
    const { t } = useTranslation();
    const { companyInfo, printSettings } = appData;
    const { addNotification } = useNotification();
    const printableContentRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${t('recordDetails')} #${record.recordNumber}`}>
            <div className="space-y-4">
                 <div ref={printableContentRef} className="printable-area">
                    <h3 className="text-xl font-bold text-center mb-4">{companyInfo.name}</h3>
                    <p className="text-center text-xs">{companyInfo.address} - {companyInfo.phone}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm my-4">
                        <p><strong>{t('recordNumber')}:</strong> {record.recordNumber}</p>
                        <p><strong>{t('date')}:</strong> {formatDate(record.date)}</p>
                        <p><strong>{t('customer')}:</strong> {record.customerName}</p>
                        <p><strong>{t('phone')}:</strong> {record.customerPhone || 'N/A'}</p>
                        <p className="col-span-2"><strong>{t('address')}:</strong> {record.customerAddress || 'N/A'}</p>
                        <p><strong>{t('createdBy')}:</strong> {record.createdBy}</p>
                    </div>
                     <h4 className="font-bold mt-4 mb-2">{t('items')}</h4>
                    <table className="w-full text-sm text-right" style={{ fontSize: `${printSettings.fontSize}pt`}}>
                         <thead><tr className="border-b"><th className="p-1">الصنف</th><th className="p-1">الكمية</th><th className="p-1">السعر</th><th className="p-1">الإجمالي</th></tr></thead>
                        <tbody>
                        {record.items.map(item => (
                            <tr key={item.productId}><td className="p-1">{item.productName}</td><td className="p-1">{item.quantity}</td><td className="p-1">{item.price.toFixed(2)}</td><td className="p-1">{(item.price * item.quantity).toFixed(2)}</td></tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="mt-4 pt-2 border-t text-sm space-y-1">
                         <p className="flex justify-between"><strong>{t('subtotal')}:</strong> {record.total.toFixed(2)}</p>
                         <p className="flex justify-between"><strong>{t('discount')}:</strong> {record.discount.toFixed(2)}</p>
                         <p className="flex justify-between text-lg font-bold"><strong>{t('finalTotal')}:</strong> {record.finalTotal.toFixed(2)}</p>
                         <p className="flex justify-between"><strong>{t('amountPaid')}:</strong> {record.amountPaid.toFixed(2)}</p>
                         <p className="flex justify-between text-red-500"><strong>{t('amountRemaining')}:</strong> {record.amountRemaining.toFixed(2)}</p>
                    </div>
                     {printSettings.footerText && <p className="text-center text-xs mt-6">{printSettings.footerText}</p>}
                </div>

                 <h4 className="font-bold mt-4 mb-2">{t('paymentHistory')}</h4>
                 {record.payments.length > 0 ? (
                    <ul className="text-sm space-y-1">{record.payments.map((p, i) => <li key={i}>{p.amount.toFixed(2)} ج.م - {formatDate(p.date)} (بواسطة {p.createdBy})</li>)}</ul>
                 ) : <p>{t('noPayments')}</p>}

                <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse no-print">
                    <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700"><PrintIcon/> {t('print')}</Button>
                </div>
            </div>
        </Modal>
    );
}

const ReportsPage: React.FC<PageProps> = ({ appData }) => {
    const { t } = useTranslation();
    const { allRecords, products, customers } = appData;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [activeTab, setActiveTab] = useState('overview');

    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        
        const all = Object.entries(allRecords)
            .flatMap(([type, records]) => records.map(rec => ({ ...rec, type: type as RecordType })))
            .filter(rec => {
                const recDate = new Date(rec.date);
                return recDate >= start && recDate <= end;
            });
        
        const sales = all.filter(rec => ['sales', 'invoices', 'fawrySales'].includes(rec.type));
        const returns = all.filter(rec => ['salesReturns', 'invoiceReturns'].includes(rec.type));

        return { all, sales, returns };

    }, [allRecords, startDate, endDate]);

    // Memoized calculations
    const stats = useMemo(() => ({
        totalRevenue: filteredData.sales.reduce((sum, s) => sum + s.finalTotal, 0),
        totalProfit: filteredData.sales.reduce((sum, s) => sum + s.profit, 0),
        totalReturns: filteredData.returns.reduce((sum, r) => sum + r.finalTotal, 0),
        transactions: filteredData.sales.length
    }), [filteredData]);

    const salesOverTime = useMemo(() => {
        const data = filteredData.sales
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .reduce((acc, sale) => {
                const date = new Date(sale.date).toLocaleDateString('fr-CA'); // YYYY-MM-DD
                if(!acc[date]) acc[date] = { date, sales: 0, profit: 0 };
                acc[date].sales += sale.finalTotal;
                acc[date].profit += sale.profit;
                return acc;
            }, {} as Record<string, {date: string, sales: number, profit: number}>);
        return Object.values(data);
    }, [filteredData.sales]);

    const topProductsData = useMemo(() => {
        const productSales = filteredData.sales.flatMap(s => s.items).reduce((acc, item) => {
            if(!acc[item.productName]) acc[item.productName] = 0;
            acc[item.productName] += item.quantity;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(productSales).map(([name, quantity]) => ({ name, quantity })).sort((a,b) => b.quantity - a.quantity).slice(0, 10);
    }, [filteredData.sales]);
    
    const topCustomersData = useMemo(() => {
        const customerSales = filteredData.sales.reduce((acc, sale) => {
            if(!acc[sale.customerName]) acc[sale.customerName] = 0;
            acc[sale.customerName] += sale.finalTotal;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(customerSales).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total).slice(0, 10);
    }, [filteredData.sales]);

    const paymentStatusData = useMemo(() => {
        const statusCounts = filteredData.sales.reduce((acc, sale) => {
            acc[sale.paymentStatus] = (acc[sale.paymentStatus] || 0) + 1;
            return acc;
// Fix: Use Record<string, number> for the accumulator to avoid issues with enum keys.
        }, {} as Record<string, number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [filteredData.sales]);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('reports')}</h2>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-end gap-4">
                <Input label={t('startDate')} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <Input label={t('endDate')} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                 <div className="flex border-b dark:border-gray-700 overflow-x-auto">
                     {['overview', 'sales', 'products', 'customers'].map(tab => (
                         <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 -mb-px border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                             {t(tab as any)}
                         </button>
                    ))}
                </div>
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('revenue')} value={`${stats.totalRevenue.toFixed(2)} ج.م`} icon={<SalesIcon className="w-8 h-8 text-blue-500" />} />
                            <StatCard title={t('totalProfit')} value={`${stats.totalProfit.toFixed(2)} ج.م`} icon={<ReportsIcon className="w-8 h-8 text-green-500" />} />
                            <StatCard title={t('transactions')} value={stats.transactions} icon={<RecordsIcon className="w-8 h-8 text-yellow-500" />} />
                            <StatCard title={t('totalReturns')} value={`${stats.totalReturns.toFixed(2)} ج.م`} icon={<ReturnsIcon className="w-8 h-8 text-red-500" />} />
                        </div>
                    )}
                     {activeTab === 'sales' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-bold mb-4">{t('salesAndProfitOverTime')}</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={salesOverTime}><CartesianGrid /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="sales" name={t('sales')} stroke="#8884d8" /><Line type="monotone" dataKey="profit" name={t('profit')} stroke="#82ca9d" /></LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-bold mb-4">{t('paymentStatusDistribution')}</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart><Pie data={paymentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>{paymentStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
                                </ResponsiveContainer>
                            </div>
                         </div>
                     )}
                     {activeTab === 'products' && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-4">{t('topSellingProducts')}</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={topProductsData} layout="vertical"><CartesianGrid /><XAxis type="number" /><YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}}/><Tooltip /><Bar dataKey="quantity" name={t('quantity')} fill="#82ca9d" /></BarChart>
                            </ResponsiveContainer>
                        </div>
                     )}
                     {activeTab === 'customers' && (
                         <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-bold mb-4">{t('topCustomers')}</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={topCustomersData} ><CartesianGrid /><XAxis dataKey="name" tick={{fontSize: 10}}/><YAxis/><Tooltip /><Bar dataKey="total" name={t('totalPurchases')} fill="#8884d8" /></BarChart>
                            </ResponsiveContainer>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};


const ActivityLogModal: React.FC<{isOpen: boolean; onClose: () => void; logs: LogEntry[]}> = ({isOpen, onClose, logs}) => {
    const { t } = useTranslation();
    return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('viewActivityLog')}>
        <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-right">
                <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700">
                    <tr><th className="p-2">{t('username')}</th><th className="p-2">{t('actions')}</th><th className="p-2">{t('date')}</th></tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300">
                    {logs.map(log => (
                        <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="p-2">{log.user}</td><td className="p-2">{log.action}</td>
                            <td className="p-2 text-sm">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Modal>
)};

const SettingsPage: React.FC<{
    appData: ReturnType<typeof useAppData>;
    theme: string;
    setTheme: (theme: 'light' | 'dark') => void;
}> = ({ appData, theme, setTheme }) => {
    const { t, language, setLanguage } = useTranslation();
    const { users, currentUser, updateUser, companyInfo, updateCompanyInfo, printSettings, updatePrintSettings } = appData;
    const { addNotification } = useNotification();
    const permissions = usePermissions(currentUser.role);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [companyForm, setCompanyForm] = useState<CompanyInfo>(companyInfo);
    const [printForm, setPrintForm] = useState<PrintSettings>(printSettings);

    useEffect(() => setCompanyForm(companyInfo), [companyInfo]);
    useEffect(() => setPrintForm(printSettings), [printSettings]);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setNewUsername(user.username);
        setNewPassword('');
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            const updates: Partial<User> = { username: newUsername };
            if (newPassword) updates.password = newPassword;
            updateUser(editingUser.id, updates);
            addNotification(t('operationSuccess'), 'success');
            setEditingUser(null);
        }
    };
    
    // Fix: Use e.target.name as the key and handle different value types.
    const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePrintSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPrintForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCompanyForm(prev => ({...prev, logo: reader.result as string}));
            reader.readAsDataURL(file);
        }
    };

    const handleCompanyInfoSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanyInfo(companyForm);
        addNotification(t('operationSuccess'), 'success');
    }
    
    const handlePrintSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updatePrintSettings(printForm);
        addNotification(t('operationSuccess'), 'success');
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('settings')}</h2>
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Company Info */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <form onSubmit={handleCompanyInfoSave} className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">{t('companyInfo')}</h3>
                        <Input label={t('companyNameLabel')} name="name" value={companyForm.name} onChange={handleCompanyInfoChange} />
                        <Input label={t('companyAddress')} name="address" value={companyForm.address || ''} onChange={handleCompanyInfoChange} />
                        <Input label={t('companyPhone')} name="phone" value={companyForm.phone || ''} onChange={handleCompanyInfoChange} />
                        <div>
                             <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('companyLogo')}</label>
                            <div className="flex items-center gap-4">
                                <input type="file" id="logo-upload" onChange={handleLogoUpload} accept="image/*" className="hidden"/>
                                <label htmlFor="logo-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-sm font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('uploadLogo')}</label>
                                {companyForm.logo && <img src={companyForm.logo} alt="Logo Preview" className="w-16 h-16 object-contain rounded-md bg-gray-100 dark:bg-gray-700 p-1" />}
                                {companyForm.logo && <Button onClick={() => setCompanyForm(prev => ({...prev, logo: ''}))} className="!bg-red-600 hover:!bg-red-700 !p-2 text-xs">{t('removeLogo')}</Button>}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="logoOpacity" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('logoOpacity')}</label>
                            <input type="range" id="logoOpacity" name="logoOpacity" min="0" max="1" step="0.1" value={companyForm.logoOpacity} onChange={e => setCompanyForm(prev => ({...prev, logoOpacity: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                            <span className="text-xs text-gray-500">{t('logoOpacityHelp')} ({companyForm.logoOpacity})</span>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit">{t('save')}</Button>
                        </div>
                    </form>
                 </div>

                 {/* Print Settings */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <form onSubmit={handlePrintSettingsSave} className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">{t('printSettings')}</h3>
                        <Input label={t('printFooterText')} name="footerText" value={printForm.footerText} onChange={e => setPrintForm({...printForm, footerText: e.target.value})} />
                        <Input label={t('printFontSize')} name="fontSize" type="number" value={printForm.fontSize} onChange={e => setPrintForm({...printForm, fontSize: parseInt(e.target.value) || 10})} />
                        <div className="flex justify-end pt-2"> <Button type="submit">{t('save')}</Button> </div>
                    </form>
                 </div>
                
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">{t('theme')}</h3>
                    <div className="flex items-center justify-between">
                         <label className="text-gray-600 dark:text-gray-300">{t('theme')}</label>
                        <div className="flex items-center rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
                            <button onClick={() => setTheme('light')} className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${ theme === 'light' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 dark:text-gray-400' }`}> {t('light')} </button>
                            <button onClick={() => setTheme('dark')} className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${ theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 dark:text-gray-400' }`}> {t('dark')} </button>
                        </div>
                    </div>
                     <div className="flex items-center justify-between mt-4">
                        <label className="text-gray-600 dark:text-gray-300">{t('language')}</label>
                        <Select label="" value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')} className="max-w-xs">
                            <option value="ar">{t('arabic')}</option>
                            <option value="en">{t('english')}</option>
                        </Select>
                    </div>
                </div>

                {permissions.canManageUsers && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">{t('userManagement')}</h3>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                    <div>
                                        <p className="font-semibold">{user.name} ({user.username})</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                                    </div>
                                    <Button onClick={() => handleEditUser(user)} className="bg-gray-600 hover:bg-gray-700"><EditIcon/></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {permissions.canViewLogs && (
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">{t('system')}</h3>
                        <Button onClick={() => setIsLogModalOpen(true)} className="w-full">
                            <LogIcon/>
                            <span>{t('viewActivityLog')}</span>
                        </Button>
                    </div>
                )}
            </div>
            
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`${t('editUser')}: ${editingUser?.name}`}>
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <Input label={t('newUsername')} value={newUsername} onChange={e => setNewUsername(e.target.value)} required/>
                    <Input label={t('newPassword')} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('newPassword')} />
                    <div className="flex justify-end pt-4"> <Button type="submit">{t('save')}</Button> </div>
                </form>
            </Modal>

            <ActivityLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} logs={appData.logs} />
        </div>
    );
};

const AiAssistant: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [prompt, setPrompt] = useState('');
    // Fix: Use a ref to store the chat instance for stateful conversations.
    const chatRef = useRef<Chat | null>(null);

    // Fix: Initialize the chat instance once when the component mounts.
    useEffect(() => {
        if (isOpen && !chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a helpful assistant for the Kiro Corp Management System, an inventory and sales application. 
            You can explain features, guide users on how to perform tasks (like adding a product, creating an invoice, or checking reports), and help troubleshoot common issues.
            Be concise and helpful. Respond in the same language as the user's prompt (Arabic or English).`;
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: systemInstruction }
            });
        }
    }, [isOpen]);

    const handleSend = async () => {
        // Fix: Ensure chat is initialized and not loading.
        if (!prompt || isLoading || !chatRef.current) return;
        
        // Fix: Update history with user's message immediately for better UX.
        const userMessage = { role: 'user' as const, text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);

        try {
            // Fix: Use the stateful chat.sendMessage method instead of stateless generateContent.
            const response = await chatRef.current.sendMessage({ message: prompt });
            const modelResponse = response.text;
            setChatHistory(prev => [...prev, { role: 'model' as const, text: modelResponse }]);

        } catch (error) {
            console.error("AI Assistant error:", error);
            setChatHistory(prev => [...prev, { role: 'model' as const, text: 'Sorry, I encountered an error.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 z-50 no-print"
                title={t('aiAssistant')}
            >
                <BrainCircuitIcon className="w-8 h-8"/>
            </button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('aiAssistant')}>
                <div className="flex flex-col h-[60vh]">
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-100 dark:bg-gray-700/50 rounded-md space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <p className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white'}`}>
                                    {msg.text}
                                </p>
                            </div>
                        ))}
                         {isLoading && <div className="flex justify-start"><SpinnerIcon className="w-8 h-8 text-blue-500"/></div>}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Input label="" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t('askAiPlaceholder')} onKeyDown={e => e.key === 'Enter' && handleSend()} containerClassName="flex-grow" />
                        <Button onClick={handleSend} disabled={isLoading || !prompt}>{t('save')}</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};


// ===================================================================================
// MAIN APP COMPONENT
// ===================================================================================

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('isLoggedIn'));
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const appData = useAppData();
    const [theme, setTheme] = useTheme();
    const permissions = usePermissions(appData.currentUser.role);
    const { language } = useTranslation();

    const handleLogin = (user: User) => { 
        appData.setCurrentUser(user);
        sessionStorage.setItem('isLoggedIn', 'true'); 
        setIsLoggedIn(true); 
    };
    const handleLogout = () => { 
        sessionStorage.removeItem('isLoggedIn'); 
        setIsLoggedIn(false); 
    };

    useEffect(() => {
        document.body.className = `bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`;
        if (theme === 'dark') {
            document.body.classList.add('dark');
        }
    }, [theme]);
    
    // Role-based page access control
    useEffect(() => {
        const pagePermissions: Record<Page, boolean> = {
            dashboard: permissions.canViewDashboard,
            inventory: permissions.canManageInventory,
            customers: permissions.canManageCustomers,
            sales: permissions.canCreateSales,
            returns: permissions.canManageReturns,
            records: permissions.canViewAllRecords,
            reports: permissions.canViewReports,
            settings: true,
        };
        if (!pagePermissions[currentPage]) {
            setCurrentPage('dashboard');
        }
    }, [appData.currentUser, currentPage]);


    if (!isLoggedIn) return <Login onLogin={handleLogin} users={appData.users} companyName={appData.companyInfo.name} />;

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage appData={appData} />;
            case 'inventory': return <InventoryPage appData={appData} />;
            case 'customers': return <CustomersPage appData={appData} />;
            case 'sales': return <SalesPage appData={appData} />;
            case 'returns': return <ReturnsPage appData={appData} />;
            case 'records': return <RecordsPage appData={appData} />;
            case 'reports': return <ReportsPage appData={appData} />;
            case 'settings': return <SettingsPage appData={appData} theme={theme} setTheme={setTheme} />;
            default: return <DashboardPage appData={appData} />;
        }
    };
    
    return (
        <div className="flex h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} appData={appData} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {renderPage()}
            </main>
            <AiAssistant />
        </div>
    );
};

export default App;