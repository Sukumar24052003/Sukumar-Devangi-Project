import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components required for all charts
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

// --- Reusable UI Components ---
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border shadow-sm rounded-xl w-full ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 md:p-6 ${className}`}>{children}</div>
);

const Input = (props) => (
  <input className="border px-3 py-2 rounded text-sm w-full" {...props} />
);

const Select = ({ children, ...props }) => (
  <select className="border px-3 py-2 rounded text-sm w-full" {...props}>
    {children}
  </select>
);

// --- Helper Components & Functions ---
const DownloadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// A new helper component for table headers to match the image style
const SortableHeader = ({ children }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
        <div className="flex items-center gap-1.5 cursor-pointer">
            {children}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
            </svg>
        </div>
    </th>
);


// Icon placeholders for KPI cards
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;

const formatIndianCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
};

const formatToLac = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return (num / 100000).toFixed(2);
};


// --- Static Data for New Charts (as per the provided image) ---
const fiscalYearMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const additionalFilterData = {
  labels: fiscalYearMonths,
  datasets: [
    { label: 'BMR', data: [null, null, null, null, null, null, null, 0, null, 0, null, null], borderColor: '#f87171', backgroundColor: '#f87171', tension: 0.1, pointRadius: 5, pointBackgroundColor: '#f87171' },
    { label: 'HSTC', data: [null, null, null, null, null, null, null, null, null, null, 0, null], borderColor: '#2dd4bf', backgroundColor: '#2dd4bf', tension: 0.1, pointRadius: 5, pointBackgroundColor: '#2dd4bf' },
  ],
};

const monthlySalesData = {
  labels: fiscalYearMonths,
  datasets: [
    { label: 'Government', data: fiscalYearMonths.map(() => 0), backgroundColor: '#f472b6' },
    { label: 'National Agency', data: [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#60a5fa' },
    { label: 'Local Agency', data: [0.10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 563, 0], backgroundColor: '#facc15' },
    { label: 'Direct Client', data: [0, 0, 0, 0, 0, 0, 15, 15.6, 0, 0, 1976 - 563, 2], backgroundColor: '#2dd4bf' },
  ]
};

const monthlyPercentageData = {
  labels: fiscalYearMonths,
  datasets: [
    { label: 'Government', data: fiscalYearMonths.map(() => 0), backgroundColor: '#f472b6' },
    { label: 'National Agency', data: [0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#60a5fa' },
    { label: 'Local Agency', data: [100, 0, 0, 0, 0, 0, 0, 65, 0, 0, 22, 0], backgroundColor: '#facc15' },
    { label: 'Direct Client', data: [0, 0, 0, 0, 0, 0, 100, 35, 0, 0, 78, 100], backgroundColor: '#2dd4bf' },
  ],
};

const salesComparisonData = {
  labels: fiscalYearMonths,
  datasets: [
    { type: 'bar', label: '2022', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#f472b6' },
    { type: 'bar', label: '2023', data: [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#8b5cf6' },
    { type: 'bar', label: '2024', data: [0, 0, 0, 0, 0, 0, 15, 22.5, 0, 0, 0, 0], backgroundColor: '#3b82f6' },
    { type: 'line', label: 'Trend', data: [0, null, 0, 5, null, 0, 15, 22.5, null, 0, 0, 0], borderColor: '#ef4444', backgroundColor: '#ef4444', tension: 0.3 },
  ],
};


export default function Report() {
  // NOTE: Logic and state management are unchanged.
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [bookingFilters, setBookingFilters] = useState({ client: '', paymentStatus: '', startDate: '', poStatus: '', endDate: '' });
  const [paymentFilters, setPaymentFilters] = useState({ client: '', booking: '', startDate: '', endDate: '' });
  const [changelogs, setChangelogs] = useState([]);
  const [filteredChangelogs, setFilteredChangelogs] = useState([]);
  const [changelogFilters, setChangelogFilters] = useState({ searchText: '', startDate: '', endDate: '' });
  const [reportData, setReportData] = useState({ totalRevenue: 0, mtdRevenue: 0, ytdRevenue: 0, totalProposals: 0, totalProposalsValue: 0, sourceDistribution: { labels: [], datasets: [] }, clientTypeDistribution: { labels: [], datasets: [] } });
  const [changelogChartData, setChangelogChartData] = useState({ byUser: { labels: [], datasets: [] }, byType: { labels: [], datasets: [] }, byTime: { labels: [], datasets: [] } });
  const [financeData, setFinanceData] = useState({});
  const [selectedFinanceYear, setSelectedFinanceYear] = useState(String(new Date().getFullYear()));
  const [financeChartData, setFinanceChartData] = useState({ yearlySummary: { labels: [], datasets: [] }, monthlyBreakdown: { labels: [], datasets: [] } });
  
  useEffect(() => { fetchBookings(); fetchChangelogs(); fetchFinanceData(); }, []);
  useEffect(() => { applyBookingFilters(); }, [bookings, bookingFilters]);
  useEffect(() => { applyChangelogFilters(); }, [changelogs, changelogFilters]);
  useEffect(() => { processBookingDataForReports(); }, [bookings]);
  useEffect(() => { processChangelogDataForCharts(); }, [filteredChangelogs]);
  useEffect(() => { processFinanceDataForCharts(); }, [financeData, selectedFinanceYear]);
  const fetchBookings = async () => { try { const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`); const data = await res.json(); setBookings(data.bookings || []); } catch (err) { console.error('Failed to fetch bookings:', err); } };
  const fetchChangelogs = async () => { try { const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/change-Log`); const data = await res.json(); setChangelogs(data.changelogs || []); } catch (err) { console.error('Failed to fetch changelogs:', err); } };
  const fetchFinanceData = async () => { try { const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pipeline/finance`); if (!res.ok) throw new Error('Failed to fetch finance data'); const data = await res.json(); setFinanceData(data); const years = Object.keys(data); if (years.length > 0) { setSelectedFinanceYear(years.sort().pop()); } } catch (err) { console.error(err); } };
  const processBookingDataForReports = () => { if (bookings.length === 0) return; let totalRev = 0, mtdRev = 0, ytdRev = 0; const sourceData = { 'Own Sites': 0, 'Traded Sites': 0 }; const clientTypes = ['Direct client', 'Local Agency', 'National Agency', 'Government']; const clientTypeData = Object.fromEntries(clientTypes.map(type => [type, 0])); const now = dayjs(); const startOfMonth = now.startOf('month'); const fiscalYearStart = now.month() >= 3 ? now.year() : now.year() - 1; const startOfFiscalYear = dayjs(`${fiscalYearStart}-04-01`); bookings.forEach((booking, index) => { let bookingRevenue = booking.campaigns?.reduce((sum, c) => sum + (c.pipeline?.payment?.totalAmount || 0), 0) || 0; totalRev += bookingRevenue; const createdAt = dayjs(booking.createdAt); if (createdAt.isAfter(startOfMonth.subtract(1, 'day'))) mtdRev += bookingRevenue; if (createdAt.isAfter(startOfFiscalYear.subtract(1, 'day'))) ytdRev += bookingRevenue; const mockSiteType = index % 3 === 0 ? 'Traded Sites' : 'Own Sites'; sourceData[mockSiteType] += bookingRevenue; const mockClientType = clientTypes[index % clientTypes.length]; clientTypeData[mockClientType]++; }); setReportData({ totalRevenue: totalRev, mtdRevenue: mtdRev, ytdRevenue: ytdRev, totalProposals: bookings.length, totalProposalsValue: totalRev, sourceDistribution: { labels: Object.keys(sourceData), datasets: [{ data: Object.values(sourceData), backgroundColor: ['#F97316', '#A855F7'], borderColor: '#FFFFFF', borderWidth: 5, }] }, clientTypeDistribution: { labels: Object.keys(clientTypeData), datasets: [{ data: Object.values(clientTypeData), backgroundColor: ['#2DD4BF', '#FBBF24', '#3B82F6', '#EC4899'], borderColor: '#FFFFFF', borderWidth: 5, }] } }); };
  const processChangelogDataForCharts = () => { if (filteredChangelogs.length === 0) { setChangelogChartData({ byUser: { labels: [], datasets: [] }, byType: { labels: [], datasets: [] }, byTime: { labels: [], datasets: [] } }); return; } const userCounts = filteredChangelogs.reduce((acc, log) => { const userName = log.userName || log.userEmail || 'Unknown'; acc[userName] = (acc[userName] || 0) + 1; return acc; }, {}); const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]); const byUserData = { labels: sortedUsers.map(e => e[0]), datasets: [{ label: 'Changes', data: sortedUsers.map(e => e[1]), backgroundColor: ['#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f97316'] }] }; const typeCounts = filteredChangelogs.reduce((acc, log) => { const type = log.changeType || 'Unknown'; acc[type] = (acc[type] || 0) + 1; return acc; }, {}); const byTypeData = { labels: Object.keys(typeCounts), datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#ec4899', '#6366f1', '#22c55e', '#facc15', '#0ea5e9'], borderColor: '#FFFFFF', borderWidth: 3 }] }; const timeCounts = filteredChangelogs.reduce((acc, log) => { const date = dayjs(log.createdAt).format('YYYY-MM-DD'); acc[date] = (acc[date] || 0) + 1; return acc; }, {}); const sortedTimeEntries = Object.entries(timeCounts).sort((a, b) => dayjs(a[0]).isAfter(dayjs(b[0])) ? 1 : -1); const byTimeData = { labels: sortedTimeEntries.map(e => dayjs(e[0]).format('MMM DD')), datasets: [{ label: 'Daily Changes', data: sortedTimeEntries.map(e => e[1]), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.3 }] }; setChangelogChartData({ byUser: byUserData, byType: byTypeData, byTime: byTimeData }); };
  const processFinanceDataForCharts = () => { if (Object.keys(financeData).length === 0) return; const years = Object.keys(financeData).sort(); const yearlyPoData = [], yearlyInvoiceData = []; years.forEach(year => { let totalPo = 0, totalInvoice = 0; Object.values(financeData[year]).forEach(monthData => { totalPo += monthData.purchaseOrders?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0; totalInvoice += monthData.invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0; }); yearlyPoData.push(totalPo); yearlyInvoiceData.push(totalInvoice); }); const yearlySummary = { labels: years, datasets: [{ label: 'Purchase Orders (PO)', data: yearlyPoData, backgroundColor: '#3b82f6' }, { label: 'Invoices', data: yearlyInvoiceData, backgroundColor: '#16a34a' }] }; const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; const monthlyPoData = Array(12).fill(0), monthlyInvoiceData = Array(12).fill(0); if (financeData[selectedFinanceYear]) { Object.entries(financeData[selectedFinanceYear]).forEach(([monthName, monthData]) => { const monthIndex = monthsOrder.indexOf(monthName); if (monthIndex !== -1) { monthlyPoData[monthIndex] = monthData.purchaseOrders?.reduce((sum, po) => sum + (po.amount || 0), 0) || 0; monthlyInvoiceData[monthIndex] = monthData.invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0; } }); } const monthlyBreakdown = { labels: monthsOrder, datasets: [{ label: 'Purchase Orders (PO)', data: monthlyPoData, backgroundColor: '#3b82f6' }, { label: 'Invoices', data: monthlyInvoiceData, backgroundColor: '#16a34a' }] }; setFinanceChartData({ yearlySummary, monthlyBreakdown }); };
  const applyBookingFilters = () => { let result = [...bookings]; const { client, paymentStatus, poStatus, startDate, endDate } = bookingFilters; if (client) result = result.filter((b) => b.clientName?.toLowerCase().includes(client.toLowerCase())); if (paymentStatus) { result = result.filter((b) => { let totalPaid = 0, totalAmount = 0; b.campaigns?.forEach((c) => { const p = c.pipeline?.payment; if (p) { totalPaid += p.totalPaid || 0; totalAmount += p.totalAmount || 0; } }); if (paymentStatus === 'pending') return totalPaid < totalAmount; return totalPaid >= totalAmount && totalAmount > 0; }); } if (poStatus) { result = result.filter((b) => { const isAnyPoPending = b.campaigns?.some(c => !c.pipeline?.po?.confirmed); return poStatus === 'pending' ? isAnyPoPending : !isAnyPoPending; }); } if (startDate) result = result.filter((b) => dayjs(b.createdAt).isAfter(dayjs(startDate).subtract(1, 'day'))); if (endDate) result = result.filter((b) => dayjs(b.createdAt).isBefore(dayjs(endDate).add(1, 'day'))); setFilteredBookings(result); };
  const applyChangelogFilters = () => { let result = [...changelogs]; const { searchText, startDate, endDate } = changelogFilters; if (searchText) { const lower = searchText.toLowerCase(); result = result.filter((log) => log.campaignId?.campaignName?.toLowerCase().includes(lower) || log.userName?.toLowerCase().includes(lower) || log.userEmail?.toLowerCase().includes(lower) || log.changeType?.toLowerCase().includes(lower)); } if (startDate) result = result.filter((log) => dayjs(log.createdAt).isAfter(dayjs(startDate).subtract(1, 'day'))); if (endDate) result = result.filter((log) => dayjs(log.createdAt).isBefore(dayjs(endDate).add(1, 'day'))); setFilteredChangelogs(result); };
  const downloadExcel = (rows, filename) => { const sheet = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, sheet, 'Report'); const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); const file = new Blob([buf], { type: 'application/octet-stream' }); saveAs(file, filename); };
  const getPaymentRows = () => { const rows = []; bookings.forEach((b) => { b.campaigns?.forEach((c) => { const p = c.pipeline?.payment; if (!p) return; const payments = p.payments || []; payments.forEach((pay) => { const date = pay.date ? dayjs(pay.date) : null; if (paymentFilters.client && !b.clientName?.toLowerCase().includes(paymentFilters.client.toLowerCase())) return; if (paymentFilters.booking && !b.companyName?.toLowerCase().includes(paymentFilters.booking.toLowerCase())) return; if (paymentFilters.startDate && date?.isBefore(dayjs(paymentFilters.startDate))) return; if (paymentFilters.endDate && date?.isAfter(dayjs(paymentFilters.endDate))) return; rows.push({ Booking: b.companyName, Client: b.clientName, Amount: pay.amount, Date: date?.format('DD MMM YYYY'), Mode: pay.modeOfPayment, }); }); }); }); return rows; };
  const getChangelogRows = () => filteredChangelogs.map((log) => ({ Campaign: log.campaignId?.campaignName || '', User: log.userName || log.userId?.name || '', Email: log.userEmail, ChangeType: log.changeType, Previous: JSON.stringify(log.previousValue), New: JSON.stringify(log.newValue), Date: dayjs(log.createdAt).format('DD MMM YYYY HH:mm'), }));

  return (
    <div className="bg-[#fafafb] min-h-screen text-black flex flex-col">
      <Navbar />
      <main className="flex-1 h-full overflow-y-auto px- md:px-6 py-6 ml-0  lg:ml-64 ">
        <h2 className="text-2xl font-sans mb-6">Reports Dashboard</h2>

        {/* --- Static Charts Section (Unchanged) --- */}
        <Card className="mb-10"> <CardContent> <div className="flex justify-between items-center mb-1"> <h3 className="text-xl font-semibold">Additional Filter Distribution</h3> <button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"> <DownloadIcon /> </button> </div> <p className="text-gray-500 text-sm mb-4">This line chart displays the revenue trends over different time periods, filtered by specific tags.</p> <div className="flex flex-wrap items-center gap-4 mb-6"> <div className="flex items-center gap-2"> <button className="px-4 py-2 text-sm bg-gray-200 rounded-md">View By: Revenue</button> <button className="px-4 py-2 text-sm bg-gray-200 text-gray-500 rounded-md">View By: Current Year</button> </div> <select className="border px-3 py-2 rounded text-sm w-full sm:w-auto"> <option>Select Additional Tags</option> </select> <button className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200">Reset</button> </div> <div className="h-72"> <Line data={additionalFilterData} options={{ maintainAspectRatio: false, scales: { y: { ticks: { callback: (value) => `${value} L` } } } }} /> </div> </CardContent> </Card>
        <Card className="mb-10"> <CardContent> <div className="flex justify-between items-center mb-1"> <h3 className="text-xl font-semibold">Monthly Sales Distribution</h3> <button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"> <DownloadIcon /> </button> </div> <p className="text-gray-500 text-sm mb-4">This bar chart shows the monthly revenue distribution between different clients types.</p> <div className="h-96"> <Bar data={monthlySalesData} options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (value) => `${value} L` } } } }} /> </div> </CardContent> </Card>
        <Card className="mb-10"> <CardContent> <div className="flex justify-between items-center mb-1"> <h3 className="text-xl font-semibold">Monthly Percentage Contribution</h3> <button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"> <DownloadIcon /> </button> </div> <p className="text-gray-500 text-sm mb-4">This chart visualizes the percentage contribution of different client types.</p> <div className="h-96"> <Bar data={monthlyPercentageData} options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, max: 100, ticks: { callback: (value) => `${value}%` } } }, plugins: { tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw}%` } } } }} /> </div> </CardContent> </Card>
        <Card className="mb-10"> <CardContent> <div className="flex justify-between items-center mb-1"> <h3 className="text-xl font-semibold">Sales Comparison</h3> <button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"> <DownloadIcon /> </button> </div> <p className="text-gray-500 text-sm mb-4">This bar chart shows the sales trends for selected time duration</p> <div className="h-96"> <Bar data={salesComparisonData} options={{ maintainAspectRatio: false, scales: { y: { ticks: { callback: (value) => `${value} L` } } } }} /> </div> </CardContent> </Card>
        
        {/* --- Revenue Cards Section (Unchanged) --- */}
        <div className="mb-10"> <div className="flex justify-between items-center mb-2"> <h3 className="text-xl font-semibold">Revenue Cards</h3> <button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"> <DownloadIcon /> </button> </div> <p className="text-gray-500 text-sm mb-6">This report shows total revenue Cards.</p> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> <Card><CardContent className="flex items-start gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><BarChartIcon /></div><div><p className="text-sm text-gray-500">Total Revenue (till date)</p><p className="text-2xl font-bold text-green-600">{formatIndianCurrency(reportData.totalRevenue)}</p></div></CardContent></Card> <Card><CardContent className="flex items-start gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><CalendarIcon /></div><div><p className="text-sm text-gray-500">Month to Date</p><p className="text-xs text-gray-400">{`(${dayjs().startOf('month').format('D MMM')} - ${dayjs().format('D MMM, YYYY')})`}</p><p className="text-xl font-bold text-blue-600">₹{formatToLac(reportData.mtdRevenue)} Lac</p></div></CardContent></Card> <Card><CardContent className="flex items-start gap-4"><div className="p-3 bg-orange-100 text-orange-500 rounded-lg"><CalendarIcon /></div><div><p className="text-sm text-gray-500">Year to Date</p><p className="text-xs text-gray-400">{`(1 Apr, ${dayjs().year()} - ${dayjs().format('D MMM, YYYY')})`}</p><p className="text-xl font-bold text-orange-500">₹{formatToLac(reportData.ytdRevenue)} Lac</p></div></CardContent></Card> <Card><CardContent className="flex items-start gap-4"><div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><DocumentIcon /></div><div><p className="text-sm text-gray-500">Total Proposals: <span className="font-bold text-black">{reportData.totalProposals}</span></p><p className="text-xl font-bold">{formatToLac(reportData.totalProposalsValue)} L</p></div></CardContent></Card> </div> </div>

        {/* --- Financial Overview Section (Unchanged) --- */}
        <Card className="mb-10"> <CardContent> <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2"> <h3 className="text-xl font-semibold">Financial Overview (PO & Invoices)</h3> <div className="flex items-center gap-2 mt-2 sm:mt-0"> <span className="text-sm text-gray-600">Year:</span> <Select value={selectedFinanceYear} onChange={(e) => setSelectedFinanceYear(e.target.value)} className="w-auto"> {Object.keys(financeData).sort((a,b) => b-a).map(year => ( <option key={year} value={year}>{year}</option>))} </Select> </div> </div> <p className="text-gray-500 text-sm mb-6">Visual summary of Purchase Orders and Invoices generated.</p> <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div> <h4 className="text-lg font-medium text-center mb-3">Monthly Breakdown for {selectedFinanceYear}</h4> <div className="h-80"> {financeChartData.monthlyBreakdown.datasets.length > 0 ? ( <Bar data={financeChartData.monthlyBreakdown} options={{ maintainAspectRatio: false, scales: { y: { ticks: { callback: (value) => `${formatToLac(value)} L` } } }, plugins: { tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatIndianCurrency(context.raw)}` } } } }} /> ) : <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>} </div> </div> <div> <h4 className="text-lg font-medium text-center mb-3">Yearly Summary</h4> <div className="h-80"> {financeChartData.yearlySummary.datasets.length > 0 ? ( <Bar data={financeChartData.yearlySummary} options={{ maintainAspectRatio: false, scales: { y: { ticks: { callback: (value) => `${formatToLac(value)} L` } } }, plugins: { tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatIndianCurrency(context.raw)}` } } } }} /> ) : <div className="flex items-center justify-center h-full text-gray-400">Loading data...</div>} </div> </div> </div> </CardContent> </Card>
        
        {/* --- Distribution Charts Section (Unchanged) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10"> <Card><CardContent><div className="flex justify-between items-center mb-2"><h3 className="text-xl font-semibold">Source Distribution</h3><button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"><DownloadIcon /></button></div><p className="text-gray-500 text-sm mb-4">Revenue split between "Own Sites" and "Traded Sites".</p><div className="mx-auto w-full max-w-xs h-64">{reportData.sourceDistribution.datasets.length > 0 && <Doughnut data={reportData.sourceDistribution} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%' }} />}</div></CardContent></Card> <Card><CardContent><div className="flex justify-between items-center mb-2"><h3 className="text-xl font-semibold">Client Type Distribution</h3><button className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"><DownloadIcon /></button></div><p className="text-gray-500 text-sm mb-4">Breakdown of proposals by client type.</p><div className="mx-auto w-full max-w-xs h-64">{reportData.clientTypeDistribution.datasets.length > 0 && <Pie data={reportData.clientTypeDistribution} options={{ responsive: true, maintainAspectRatio: false }} />}</div></CardContent></Card> </div>

        {/* --- Bookings Section (STYLES UPDATED) --- */}
        <Card className="mb-10">
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2 sm:mb-0">Bookings</h3>
                    <div className='flex items-center gap-2'>
                        <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold hover:bg-slate-800" onClick={() => downloadExcel( filteredBookings.map((b) => { let tP = 0, tA = 0; b.campaigns?.forEach((c) => { const p = c.pipeline?.payment; if (p) { tP += p.totalPaid || 0; tA += p.totalAmount || 0; } }); return { Company: b.companyName, Client: b.clientName, CreatedAt: dayjs(b.createdAt).format('DD MMM YYYY'), PaymentStatus: tP < tA ? 'Pending' : 'Completed', POStatus: b.campaigns?.some(c => !c.pipeline?.po?.confirmed) ? 'Pending' : 'Completed' }; }), 'bookings.xlsx' )}> 
                            Download Excel
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Input placeholder="Search by Client Name..." value={bookingFilters.client} onChange={(e) => setBookingFilters({ ...bookingFilters, client: e.target.value })} />
                    <Select value={bookingFilters.paymentStatus} onChange={(e) => setBookingFilters({ ...bookingFilters, paymentStatus: e.target.value })}> <option value="">All Payment Status</option> <option value="pending">Pending</option> <option value="completed">Completed</option> </Select>
                    <Select value={bookingFilters.poStatus} onChange={(e) => setBookingFilters({ ...bookingFilters, poStatus: e.target.value })}> <option value="">All PO Status</option> <option value="pending">Pending</option> <option value="completed">Completed</option> </Select>
                    <Input type="date" value={bookingFilters.startDate} onChange={(e) => setBookingFilters({ ...bookingFilters, startDate: e.target.value })} />
                    <Input type="date" value={bookingFilters.endDate} onChange={(e) => setBookingFilters({ ...bookingFilters, endDate: e.target.value })} />
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <SortableHeader>Company</SortableHeader>
                                <SortableHeader>Client</SortableHeader>
                                <SortableHeader>Created At</SortableHeader>
                                <SortableHeader>Payment Status</SortableHeader>
                                <SortableHeader>PO Status</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.map((b) => {
                                let tP = 0, tA = 0;
                                b.campaigns?.forEach((c) => {
                                    const p = c.pipeline?.payment;
                                    if (p) { tP += p.totalPaid || 0; tA += p.totalAmount || 0; }
                                });
                                return (
                                    <tr key={b._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{b.companyName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.clientName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dayjs(b.createdAt).format('DD MMM YYYY')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tP < tA ? 'Pending' : 'Completed'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.campaigns?.some(c => !c.pipeline?.po?.confirmed) ? 'Pending' : 'Completed'}</td>
                                    </tr>
                                );
                            })}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">No bookings found for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
        
        {/* --- Payments Section (STYLES UPDATED) --- */}
        <Card className="mb-10">
            <CardContent>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Payments</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"> <Input placeholder="Client Name" value={paymentFilters.client} onChange={(e) => setPaymentFilters({ ...paymentFilters, client: e.target.value })} /> <Input placeholder="Booking Name" value={paymentFilters.booking} onChange={(e) => setPaymentFilters({ ...paymentFilters, booking: e.target.value })} /> <Input type="date" value={paymentFilters.startDate} onChange={(e) => setPaymentFilters({ ...paymentFilters, startDate: e.target.value })} /> <Input type="date" value={paymentFilters.endDate} onChange={(e) => setPaymentFilters({ ...paymentFilters, endDate: e.target.value })} /> </div>
                <div className="flex justify-end mb-4">
                    <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold hover:bg-slate-800" onClick={() => downloadExcel(getPaymentRows(), 'payments.xlsx')}> Download Excel </button>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <SortableHeader>Booking</SortableHeader>
                                <SortableHeader>Client</SortableHeader>
                                <SortableHeader>Amount</SortableHeader>
                                <SortableHeader>Date</SortableHeader>
                                <SortableHeader>Mode</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getPaymentRows().map((p, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{p.Booking}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.Client}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{p.Amount?.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.Date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{p.Mode}</td>
                                </tr>
                            ))}
                            {getPaymentRows().length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">No payments found for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
        
        {/* --- Changelog Section (STYLES UPDATED) --- */}
        <Card className="mt-10"> <CardContent> <h3 className="text-xl font-semibold mb-1">Change Logs Report</h3> <p className="text-gray-500 text-sm mb-6">Track all modifications made across campaigns and bookings.</p> <div className="mb-10"> <h3 className="text-lg font-semibold mb-2">Changelog Visualizations</h3> <p className="text-gray-500 text-sm mb-6">These charts visualize the filtered data. They update as you apply filters below.</p> <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8"> <div className="bg-gray-50 p-4 rounded-lg shadow-inner"> <h4 className="font-semibold text-center mb-3">Activity by User</h4> <div className="h-72"> {changelogChartData.byUser.labels.length > 0 ? ( <Bar data={changelogChartData.byUser} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> ) : ( <div className="flex items-center justify-center h-full text-gray-500">No data for selected filters.</div> )} </div> </div> <div className="bg-gray-50 p-4 rounded-lg shadow-inner"> <h4 className="font-semibold text-center mb-3">Distribution of Change Types</h4> <div className="h-72"> {changelogChartData.byType.labels.length > 0 ? ( <Doughnut data={changelogChartData.byType} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} /> ) : ( <div className="flex items-center justify-center h-full text-gray-500">No data for selected filters.</div> )} </div> </div> </div> <div className="bg-gray-50 p-4 rounded-lg shadow-inner"> <h4 className="font-semibold text-center mb-3">Activity Over Time</h4> <div className="h-72"> {changelogChartData.byTime.labels.length > 0 ? ( <Line data={changelogChartData.byTime} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> ) : ( <div className="flex items-center justify-center h-full text-gray-500">No data for selected filters.</div> )} </div> </div> </div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-slate-800">Logs</h3>
                <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-semibold hover:bg-slate-800" onClick={() => downloadExcel(getChangelogRows(), 'changelogs.xlsx')}> Download Excel </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> <Input placeholder="Search Campaign, User, Email..." value={changelogFilters.searchText} onChange={(e) => setChangelogFilters({ ...changelogFilters, searchText: e.target.value })} /> <Input type="date" value={changelogFilters.startDate} onChange={(e) => setChangelogFilters({ ...changelogFilters, startDate: e.target.value })} /> <Input type="date" value={changelogFilters.endDate} onChange={(e) => setChangelogFilters({ ...changelogFilters, endDate: e.target.value })} /></div> 
            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-xs text-left">
                    <thead className="bg-slate-800">
                        <tr>
                            <SortableHeader>Campaign</SortableHeader>
                            <SortableHeader>User</SortableHeader>
                            <SortableHeader>Change Type</SortableHeader>
                            <SortableHeader>Previous</SortableHeader>
                            <SortableHeader>New</SortableHeader>
                            <SortableHeader>Date</SortableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredChangelogs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.campaignId?.campaignName || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{log.userName || log.userEmail || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{log.changeType}</td>
                                <td className="px-6 py-4 text-xs text-gray-600 whitespace-pre-wrap"> {log.previousValue && Object.keys(log.previousValue).length > 0 ? ( Object.entries(log.previousValue).map(([key, val]) => ( <div key={key}><strong>{key}:</strong> {String(val)}</div> )) ) : ( <em>Creation</em> )} </td>
                                <td className="px-6 py-4 text-xs text-gray-600 whitespace-pre-wrap"> {Object.entries(log.newValue || {}).map(([key, val]) => ( <div key={key}><strong>{key}:</strong> {String(val)}</div> ))} </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{dayjs(log.createdAt).format('DD MMM YYYY HH:mm')}</td>
                            </tr>
                        ))}
                         {filteredChangelogs.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">No logs found for the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </CardContent> </Card>
      </main>
    </div>
  );
}