// src/pages/HomePage.jsx

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Navbar from './Navbar';
import { useState, useEffect, useRef } from 'react';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Icons for the UI cards.
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi';

dayjs.extend(isBetween);

// --- Reusable UI Components (No changes) ---
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white border shadow-sm rounded-xl w-full ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, className = '', ...props }) => (
  <button className={`px-4 py-2 rounded bg-black text-white hover:transition ${className}`} {...props}>
    {children}
  </button>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const ShimmerCard = ({ height = 'h-[250px]' }) => (
  <div className={`bg-gray-200 animate-pulse rounded-xl w-full ${height}`} />
);


// --- CALENDAR COMPONENT (No changes) ---
const DashboardCalendar = ({ bookings, currentDate, setCurrentDate }) => {
  const [days, setDays] = useState([]);
  const [events, setEvents] = useState(new Map());
  const navigate = useNavigate();
  
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const eventMap = new Map();
    
    bookings.forEach(booking => {
        (booking.campaigns || []).forEach(campaign => {
            const campaignInfo = {
                id: `${booking._id}-${campaign.name || 'unnamed'}`,
                bookingId: booking._id,
                brandName: booking.brandName || 'Unknown Brand',
                campaignName: campaign.name || 'Unnamed Campaign',
            };

            if (campaign.startDate) {
                const startDateStr = dayjs(campaign.startDate).format('YYYY-MM-DD');
                const dayEvents = eventMap.get(startDateStr) || {};
                const starting = dayEvents.startingCampaigns || [];
                eventMap.set(startDateStr, { ...dayEvents, startingCampaigns: [...starting, campaignInfo] });
            }
            if (campaign.endDate) {
                const endDateStr = dayjs(campaign.endDate).format('YYYY-MM-DD');
                const dayEvents = eventMap.get(endDateStr) || {};
                const ending = dayEvents.endingCampaigns || [];
                eventMap.set(endDateStr, { ...dayEvents, endingCampaigns: [...ending, campaignInfo] });
            }
        });
    });

    setEvents(eventMap);
  }, [bookings]);

  useEffect(() => {
    const start=currentDate.startOf('month'),end=currentDate.endOf('month'),first=start.startOf('week'),last=end.endOf('week');const d=[];let day=first;
    while(day.isBefore(last)||day.isSame(last,'day')){d.push(day);day=day.add(1,'day')}setDays(d);
  }, [currentDate]);

  const p=()=>setCurrentDate(currentDate.subtract(1,'month')),n=()=>setCurrentDate(currentDate.add(1,'month'));
  
  const handleNavigate = (bookingId) => {
    if (bookingId) {
      navigate(`/campaign/${bookingId}`);
    }
  };
  
  const handleMouseOver = (e, campaigns) => {
    if (!campaigns || campaigns.length === 0) return;
    const campaignNames = campaigns.map(c => c.campaignName).join(', ');
    setTooltip({
      visible: true,
      content: campaignNames,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseOut = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (<>
    <Card className="h-full">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Campaign Starting</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Campaign Ending</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={p} className="p-1 rounded-md hover:bg-gray-100"><FiChevronLeft /></button>
            <span className="font-semibold text-sm sm:text-base">{currentDate.format('MMMM YYYY')}</span>
            <button onClick={n} className="p-1 rounded-md hover:bg-gray-100"><FiChevronRight /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 border-b">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="py-2">{d}</div>)}</div>
        <div className="grid grid-cols-7 border-l">
          {days.map((day,i)=>{const k=day.format('YYYY-MM-DD'),e=events.get(k),cm=day.month()===currentDate.month(),t=day.isSame(dayjs(),'day');
            return(<div key={i} className={`h-24 border-b border-r p-1 relative ${!cm?'bg-gray-50 text-gray-400':'text-black'}`}><span className={`text-sm absolute top-1.5 right-1.5 ${t?'bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center':''}`}>{day.format('D')}</span>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                {e?.startingCampaigns?.length > 0 && 
                  <div 
                    className="w-2 h-2 rounded-full bg-green-500 cursor-pointer"
                    onMouseEnter={(event) => handleMouseOver(event, e.startingCampaigns)}
                    onMouseLeave={handleMouseOut}
                    onClick={() => handleNavigate(e.startingCampaigns[0].bookingId)}>
                  </div>
                }
                {e?.endingCampaigns?.length > 0 && 
                  <div 
                    className="w-2 h-2 rounded-full bg-red-500 cursor-pointer"
                    onMouseEnter={(event) => handleMouseOver(event, e.endingCampaigns)}
                    onMouseLeave={handleMouseOut}
                    onClick={() => handleNavigate(e.endingCampaigns[0].bookingId)}>
                  </div>
                }
              </div>
            </div>);
          })}
        </div>
      </CardContent>
    </Card>
    
    {tooltip.visible && (
      <div
        className="fixed z-50 bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow-lg pointer-events-none"
        style={{
          top: `${tooltip.y + 15}px`,
          left: `${tooltip.x + 15}px`,
        }}
      >
        {tooltip.content}
      </div>
    )}
  </>);
};


// --- MAIN DASHBOARD COMPONENT ---
const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const campaignDropdownRef = useRef(null);
    const paymentDropdownRef = useRef(null);
    
    // Data State
    const [allBookings, setAllBookings] = useState([]);
    const [allSpaces, setAllSpaces] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [revenueView, setRevenueView] = useState('yearly');
    const [range, setRange] = useState('month');
    
    const [campaignStatusRange, setCampaignStatusRange] = useState('30d');
    const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
    
    const [paymentOverviewRange, setPaymentOverviewRange] = useState('all');
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
    
    // Derived State for UI
    const [bookingStatus, setBookingStatus] = useState({ ongoing: 0, completed: 0, upcoming: 0 });
    const [unitUtilizationStats, setUnitUtilizationStats] = useState({ bookedUnits: 0, freeUnits: 0 });
    const [availabilityStats, setAvailabilityStats] = useState({ available: 0, booked: 0, overlapping: 0 });
    const [paymentStats, setPaymentStats] = useState({ totalReceived: 0, totalDue: 0 });
    const [revenueChartData, setRevenueChartData] = useState({ xLabels: [], yData: [] });
    const [pipelineBarData, setPipelineBarData] = useState({ labels: [], values: [] });
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [muiBookingData, setMuiBookingData] = useState({ xLabels: [], yData: [] });
    const [muiProposalData, setMuiProposalData] = useState({ xLabels: [], yData: [] });
    const [inventoryBookingStats, setInventoryBookingStats] = useState({
      labels: ['Full Vacant', 'Full Booked', 'Partial Booked'],
      values: [0, 0, 0],
    });
    const [inventoryDistributionStats, setInventoryDistributionStats] = useState({
      owned: 0,
      leased: 0,
      traded: 0,
    });
    
    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (!loading) processAllStats(); }, [loading, allBookings, allSpaces, proposals, range, revenueView, campaignStatusRange, paymentOverviewRange]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target)) {
                setIsCampaignDropdownOpen(false);
            }
            if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
                setIsPaymentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const getStartDateForRange = (range) => {
        const now = dayjs();
        if (range === 'all') return null; // No date filter
        switch (range) {
          case '3m': return now.subtract(3, 'month');
          case '6m': return now.subtract(6, 'month');
          case '1y': return now.subtract(1, 'year');
          case '2y': return now.subtract(2, 'year');
          case '30d':
          default:
            return now.subtract(30, 'day');
        }
    };
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  
        const [bookingsRes, spaceStatsRes, allSpacesRes, proposalsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces/dashboard-stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/spaces`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proposals`, { headers }),
        ]);
  
        if ([bookingsRes, spaceStatsRes, allSpacesRes, proposalsRes].some(res => res.status === 403)) { localStorage.clear(); navigate('/login'); return; }
      
        const bookingsData = await bookingsRes.json();
        const spaceStatsData = await spaceStatsRes.json();
        const allSpacesData = await allSpacesRes.json();
        const proposalsData = await proposalsRes.json();
        
        setAllBookings(bookingsData.bookings || []);
        setProposals(proposalsData || []);
        setAllSpaces(allSpacesData || []);
        setUnitUtilizationStats(spaceStatsData.doohUtilization || {});
        setAvailabilityStats(spaceStatsData.staticAvailability || {});
      } catch (err) { console.error('Dashboard fetch failed:', err); } finally { setLoading(false); }
    };
    
    const processAllStats = () => {
      const now = dayjs();
      const bStatus = { ongoing: 0, completed: 0, upcoming: 0 };
      allBookings.forEach(booking => {
          (booking.campaigns || []).forEach(campaign => {
              const s = dayjs(campaign.startDate);
              const e = dayjs(campaign.endDate);
              if (s.isValid() && e.isValid()) {
                  if (now.isAfter(e, 'day')) {
                      bStatus.completed++;
                  } else if (now.isBefore(s, 'day')) {
                      bStatus.upcoming++;
                  } else {
                      bStatus.ongoing++;
                  }
              }
          });
      });
      setBookingStatus(bStatus);

      const paymentStartDate = getStartDateForRange(paymentOverviewRange);
      const filteredBookingsForPayments = paymentStartDate
        ? allBookings.filter(booking => dayjs(booking.createdAt).isAfter(paymentStartDate))
        : allBookings;

      const totalPayments = filteredBookingsForPayments.reduce((acc, booking) => {
          const payment = booking.campaigns?.[0]?.pipeline?.payment;
          if (payment) {
              acc.totalReceived += payment.totalPaid || 0;
              acc.totalDue += payment.paymentDue || 0;
          }
          return acc;
      }, { totalReceived: 0, totalDue: 0 });
      setPaymentStats(totalPayments);
      
      const rStart = dayjs().subtract(range === 'week' ? 7 : range === 'month' ? 30 : 90, 'day').startOf('day');
      const processForBarChart = (items) => {
          const map = new Map();
          items.forEach(({ createdAt }) => {
              const date = dayjs(createdAt);
              if (date.isValid() && date.isAfter(rStart)) {
                  const key = date.format('YYYY-MM-DD');
                  map.set(key, (map.get(key) || 0) + 1);
              }
          });
          const sortedKeys = Array.from(map.keys()).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
          return {
              xLabels: sortedKeys.map(k => dayjs(k).format('DD MMM')),
              yData: sortedKeys.map(k => map.get(k))
          };
      };
      setMuiBookingData(processForBarChart(allBookings));
      setMuiProposalData(processForBarChart(proposals));
      
      const pipelineStartDate = getStartDateForRange(campaignStatusRange);
      const filteredBookingsForPipeline = allBookings.filter(booking => dayjs(booking.createdAt).isAfter(pipelineStartDate));

      const pCounts = filteredBookingsForPipeline.reduce((counts, booking) => {
          const pipeline = booking.campaigns?.[0]?.pipeline;
          if (pipeline) {
              if (pipeline.bookingStatus?.confirmed) counts.bookingConfirmed++;
              if (pipeline.artwork?.confirmed) counts.artworkReceived++;
              if (pipeline.po?.documentUrl) counts.poReceived++;
              if (pipeline.invoice?.invoiceNumber) counts.invoiceReceived++;
              booking.campaigns.forEach(c => {
                  c.spaces?.forEach(s => {
                      if (s?.id?.printingStatus?.confirmed) counts.printingStatus++;
                      if (s?.id?.mountingStatus?.confirmed) counts.mountingStatus++;
                  });
              });
          }
          return counts;
      }, { bookingConfirmed: 0, artworkReceived: 0, printingStatus: 0, mountingStatus: 0, poReceived: 0, invoiceReceived: 0 });
      setPipelineBarData({
          labels: ['Booking Confirmed', 'Artwork', 'Printing', 'Mounting', 'PO', 'Invoice'],
          values: [pCounts.bookingConfirmed, pCounts.artworkReceived, pCounts.printingStatus, pCounts.mountingStatus, pCounts.poReceived, pCounts.invoiceReceived]
      });
      
      const activeCampaigns = allBookings.flatMap(b => b.campaigns || []).filter(c => {
        const s = dayjs(c.startDate);
        const e = dayjs(c.endDate);
        return s.isValid() && e.isValid() && now.isBetween(s, e, null, '[]');
      });

      const bookedSpaceIds = new Set(activeCampaigns.flatMap(c => c.spaces.map(s => s.spaceId)));

      // --- MODIFIED LOGIC FOR DOOH AVAILABILITY ---
      const invStats = { fullVacant: 0, fullBooked: 0, partialBooked: 0 };
      allSpaces.forEach(space => {
        // We now check if the space *type* is DOOH first.
        if (space.spaceType === 'DOOH') {
            // Check if it has units to determine partial/full booking
            if (space.units && space.units.length > 0) {
                const totalUnits = space.units.length;
                const bookedUnitsCount = space.units.filter(unit => bookedSpaceIds.has(unit._id)).length;
                
                if (bookedUnitsCount === 0) {
                    invStats.fullVacant++;
                } else if (bookedUnitsCount === totalUnits) {
                    invStats.fullBooked++;
                } else {
                    invStats.partialBooked++;
                }
            } else {
                // If it's a DOOH space with no units, it is by definition Fully Vacant.
                invStats.fullVacant++;
            }
        }
      });
      
      setInventoryBookingStats({
        labels: ['Full Vacant', 'Full Booked', 'Partial Booked'],
        values: [invStats.fullVacant, invStats.fullBooked, invStats.partialBooked],
      });

      const ownershipCounts = allSpaces.reduce((acc, space) => {
        const ownership = space.ownership?.toLowerCase() || 'owned'; // Default to owned if undefined
        if (ownership === 'leased') {
            acc.leased++;
        } else if (ownership === 'traded') {
            acc.traded++;
        } else {
            acc.owned++;
        }
        return acc;
      }, { owned: 0, leased: 0, traded: 0 });

      setInventoryDistributionStats(ownershipCounts);

      const isYearly = revenueView === 'yearly';

      if (isYearly) {
        let startOfFY;
        const currentMonth = now.month();
        if (currentMonth >= 3) {
            startOfFY = dayjs().month(3).startOf('month');
        } else {
            startOfFY = dayjs().subtract(1, 'year').month(3).startOf('month');
        }
        const endOfFY = startOfFY.add(1, 'year').subtract(1, 'day');

        const fyMonths = [];
        for (let i = 0; i < 12; i++) {
            fyMonths.push(startOfFY.add(i, 'month').format('MMM'));
        }

        const revMap = new Map();
        fyMonths.forEach(month => revMap.set(month, 0));

        allBookings.forEach(booking => {
            const date = dayjs(booking.createdAt);
            if (date.isBetween(startOfFY, endOfFY, null, '[]')) {
                const key = date.format('MMM');
                const paidAmount = booking.campaigns?.reduce((sum, c) => sum + (c.pipeline?.payment?.totalPaid || 0), 0) || 0;
                if (revMap.has(key)) {
                    revMap.set(key, revMap.get(key) + paidAmount);
                }
            }
        });
        
        setRevenueChartData({ xLabels: Array.from(revMap.keys()), yData: Array.from(revMap.values()) });
      } else {
        const timeUnits = 30;
        const timePeriod = 'day';
        const timeFormat = 'D MMM';
        const startPeriod = now.subtract(timeUnits - 1, timePeriod).startOf(timePeriod);
        
        const revMap = new Map();
        const sortedLabels = [];
        for(let i = 29; i >= 0; i--) {
            sortedLabels.push(now.subtract(i, 'day').format(timeFormat))
        }
        sortedLabels.forEach(label => revMap.set(label, 0));

        allBookings.forEach(booking => {
            const date = dayjs(booking.createdAt);
            if (date.isAfter(startPeriod)) {
                const key = date.format(timeFormat);
                const paidAmount = booking.campaigns?.reduce((sum, c) => sum + (c.pipeline?.payment?.totalPaid || 0), 0) || 0;
                if (revMap.has(key)) {
                    revMap.set(key, revMap.get(key) + paidAmount);
                }
            }
        });
        setRevenueChartData({ xLabels: Array.from(revMap.keys()), yData: Array.from(revMap.values()) });
      }
    };
    
    const handleDoohAvailabilityClick = (event, d) => {
        if (d.dataIndex === undefined) return;
        const statusMap = {
            0: 'full_vacant',
            1: 'full_booked',
            2: 'partial_booked'
        };
        const status = statusMap[d.dataIndex];
        if (status) {
            navigate(`/inventory?availability=${status}&spaceType=DOOH`);
        }
    };

    const filterRangeOptions = [
        { value: '30d', label: '30 Days' },
        { value: '3m', label: '3 Months' },
        { value: '6m', label: '6 Months' },
        { value: '1y', label: '1 Year' },
        { value: '2y', label: '2 Years' },
        { value: 'all', label: 'All Time' },
    ];
    
    const inventoryDistributionPieData = [
        { id: 0, value: inventoryDistributionStats.owned, label: 'Owned', color: '#6366f1' },
        { id: 1, value: inventoryDistributionStats.leased, label: 'Leased', color: '#f59e0b' },
        { id: 2, value: inventoryDistributionStats.traded, label: 'Traded', color: '#10b981' },
    ];

    const bookingStatusPieData = [
      { id: 0, value: bookingStatus.completed, label: 'Completed', color: '#84cc16' }, 
      { id: 1, value: bookingStatus.ongoing, label: 'Ongoing', color: '#a855f7' }, 
      { id: 2, value: bookingStatus.upcoming, label: 'Upcoming', color: '#f97316' }
    ];
    const paymentPieData = [
      { id: 0, value: paymentStats.totalReceived, label: 'Received', color: '#4f46e5' }, 
      { id: 1, value: paymentStats.totalDue, label: 'Due', color: '#f59e0b' }
    ];
    
    const availabilityPieData = [
      { id: 0, value: availabilityStats.available, label: 'Available', color: '#4f46e5' }, 
      { id: 1, value: availabilityStats.booked, label: 'Booked', color: '#f59e0b' }, 
      { id: 2, value: availabilityStats.overlapping, label: 'Overlapping', color: '#ef4444' }
    ];

    let doohPieData;
    if (unitUtilizationStats.bookedUnits === 0 && unitUtilizationStats.freeUnits === 0) {
      doohPieData = [
        { id: 0, value: 50, label: 'Booked', color: '#4f46e5' },
        { id: 1, value: 50, label: 'Free', color: '#f59e0b' }
      ];
    } else {
      doohPieData = [
        { id: 0, value: unitUtilizationStats.bookedUnits, label: 'Booked', color: '#4f46e5' },
        { id: 1, value: unitUtilizationStats.freeUnits, label: 'Free', color: '#f59e0b' }
      ];
    }

    return (
      <div className="min-h-screen h-screen w-screen bg-gray-50 text-black flex flex-col">
        <Navbar />
        <main className="flex-1 h-full overflow-y-auto px-4 md:px-6 py-6 ml-0 lg:ml-64">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-sans font-normal">Dashboard</h2>
            <Button onClick={logout} className="text-xs mt-2 md:mt-0 hover:scale-105">Log Out</Button>
          </div>
  
          {/* --- TOP SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
              {loading ? (
                <>
                  <ShimmerCard height="h-[200px]" />
                  <ShimmerCard height="h-[200px]" />
                </>
              ) : (
                <>
                  <Card><CardContent><h2 className="text-sm font-medium mb-4">Billboard Inventory</h2><div className="flex items-center gap-4">
                    <div className="w-1/2 flex justify-center items-center">
                      <PieChart 
                        series={[{ data: availabilityPieData, innerRadius: 40 }]}
                        width={140}
                        height={140} 
                        sx={{ '& .MuiChartsLegend-root': { display: 'none' } }}
                      />
                    </div>
                    <div className="w-1/2 text-xs space-y-2">
                        <div onClick={() => navigate('/inventory?status=vacant')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#4f46e5'}}></div>Available</span>
                            <strong className="font-semibold">{availabilityStats.available}</strong>
                        </div>
                        <div onClick={() => navigate('/inventory?status=booked')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>Booked</span>
                            <strong className="font-semibold">{availabilityStats.booked}</strong>
                        </div>
                        <div onClick={() => navigate('/inventory?status=overlap')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#ef4444'}}></div>Overlapping</span>
                            <strong className="font-semibold">{availabilityStats.overlapping}</strong>
                        </div>
                    </div>
                  </div></CardContent></Card>
                  <Card>
                    <CardContent>
                      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h2 className="text-sm font-medium">Payment Overview</h2>
                        <div className="relative" ref={paymentDropdownRef}>
                          <button
                            onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                            className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            {filterRangeOptions.find(o => o.value === paymentOverviewRange)?.label}
                            <FiChevronDown />
                          </button>
                          {isPaymentDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                              {filterRangeOptions.map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setPaymentOverviewRange(option.value);
                                    setIsPaymentDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-1/2 flex justify-center items-center">
                          <PieChart 
                            series={[{ data: paymentPieData, innerRadius: 40 }]}
                            width={140}
                            height={140} 
                            sx={{ '& .MuiChartsLegend-root': { display: 'none' } }}
                          />
                        </div>
                        <div className="w-1/2 text-xs space-y-2">
                          <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#4f46e5'}}></div>Received</span><strong className="font-semibold">₹{paymentStats.totalReceived.toLocaleString()}</strong></div>
                          <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>Due</span><strong className="font-semibold">₹{paymentStats.totalDue.toLocaleString()}</strong></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            <div className="lg:col-span-3">{loading ? <ShimmerCard height="h-full min-h-[424px]" /> : <DashboardCalendar bookings={allBookings} currentDate={currentDate} setCurrentDate={setCurrentDate} />}</div>
          </div>
  
          {/* --- PIE CHARTS SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? <><ShimmerCard height="h-[200px]" /><ShimmerCard height="h-[200px]" /><ShimmerCard height="h-[200px]" /></> : (<>
              
              <Card><CardContent><h2 className="text-sm font-medium mb-4">Booking Status</h2><div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-center items-center">
                  <PieChart 
                    series={[{ data: bookingStatusPieData, innerRadius: 40 }]}
                    width={140}
                    height={140} 
                    sx={{ '& .MuiChartsLegend-root': { display: 'none' } }}
                  />
                </div>
                <div className="w-1/2 text-xs space-y-2">
                  <div onClick={() => navigate('/bookings?status=ongoing')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#a855f7'}}></div>Ongoing</span>
                    <strong className="font-semibold">{bookingStatus.ongoing}</strong>
                  </div>
                  <div onClick={() => navigate('/bookings?status=upcoming')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#f97316'}}></div>Upcoming</span>
                    <strong className="font-semibold">{bookingStatus.upcoming}</strong>
                  </div>
                  <div onClick={() => navigate('/bookings?status=completed')} className="flex items-center justify-between cursor-pointer hover:opacity-75">
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#84cc16'}}></div>Completed</span>
                    <strong className="font-semibold">{bookingStatus.completed}</strong>
                  </div>
                </div>
              </div></CardContent></Card>

              <Card><CardContent><h2 className="text-sm font-medium mb-4">DOOH Utilization</h2><div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-center items-center">
                  <PieChart 
                    series={[{ data: doohPieData, innerRadius: 40 }]}
                    width={140}
                    height={140}
                    sx={{ '& .MuiChartsLegend-root': { display: 'none' } }}
                  />
                </div>
                <div className="w-1/2 text-xs space-y-2">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#4f46e5'}}></div>Booked</span><strong className="font-semibold">{unitUtilizationStats.bookedUnits}</strong></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>Free</span><strong className="font-semibold">{unitUtilizationStats.freeUnits}</strong></div>
                </div>
              </div></CardContent></Card>

              <Card>
                <CardContent>
                  <h2 className="text-sm font-medium mb-4">Inventories Distribution</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-1/2 flex justify-center items-center">
                      <PieChart 
                        series={[{ data: inventoryDistributionPieData, innerRadius: 40 }]}
                        width={140}
                        height={140} 
                        sx={{ '& .MuiChartsLegend-root': { display: 'none' } }}
                      />
                    </div>
                    <div className="w-1/2 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#6366f1'}}></div>Owned</span>
                        <strong className="font-semibold">{inventoryDistributionStats.owned}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>Leased</span>
                        <strong className="font-semibold">{inventoryDistributionStats.leased}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: '#10b981'}}></div>Traded</span>
                        <strong className="font-semibold">{inventoryDistributionStats.traded}</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>)}
          </div>
          
          <div className="mt-8 flex flex-col w-full gap-8">
              {!loading && (<>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2 h-10">
                        <h2 className="text-sm font-medium">DOOH Availability by Unit</h2>
                      </div>
                      <BarChart
                        xAxis={[{ scaleType: 'band', data: inventoryBookingStats.labels }]}
                        series={[{ data: inventoryBookingStats.values, label: 'Count' }]}
                        height={280}
                        margin={{ top: 20, right: 30, bottom: 70, left: 50 }}
                        onItemClick={handleDoohAvailabilityClick}
                        sx={{ '& .MuiCharts-bar': { cursor: 'pointer' } }}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2 h-10">
                        <h2 className="text-sm font-medium">Recent Bookings vs. Proposals</h2>
                      </div>
                      <BarChart 
                          xAxis={[{scaleType:'band',data:muiBookingData.xLabels}]} 
                          series={[
                              {data:muiBookingData.yData,label:'# Bookings'}, 
                              {data:muiProposalData.yData, label:'# Proposals'}
                          ]} 
                          height={280}
                          margin={{ top: 20, right: 30, bottom: 70, left: 50 }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <div className="flex flex-wrap justify-between items-center mb-2 gap-2 h-10">
                        <h2 className="text-sm font-medium">Campaign Status</h2>
                        <div className="relative" ref={campaignDropdownRef}>
                          <button
                            onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
                            className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            {filterRangeOptions.find(o => o.value === campaignStatusRange && o.value !== 'all')?.label || 'Select Range'}
                            <FiChevronDown />
                          </button>
                          {isCampaignDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                              {filterRangeOptions.filter(o => o.value !== 'all').map(option => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setCampaignStatusRange(option.value);
                                    setIsCampaignDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <BarChart
                        xAxis={[{ scaleType: 'band', data: pipelineBarData.labels, padding: 0.5 }]}
                        series={[{ data: pipelineBarData.values, label: 'Completed Campaigns' }]}
                        height={280}
                        margin={{ top: 20, right: 30, bottom: 70, left: 50 }}
                      />
                    </CardContent>
                  </Card>
              </div>
              </>)}
          </div>
  
          <div className="mt-8">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-lg font-semibold">Revenue Graph</h2>
                {!loading && (
                    <button onClick={() => setRevenueView(prev => prev === 'yearly' ? 'monthly' : 'yearly')} className="bg-gray-200 text-black text-xs px-3 py-1.5 rounded-md mt-2 sm:mt-0">
                        View By: {revenueView === 'yearly' ? 'Yearly' : 'Monthly'}
                    </button>
                )}
            </div>
            {loading ? <ShimmerCard height="h-[350px]" /> : (
              (() => {
                const yMax = revenueChartData.yData.length > 0 ? Math.max(...revenueChartData.yData) : 0;
                
                const yAxisFormatter = (value) => `${(value / 100000).toFixed(1)} L`;
                const tooltipFormatter = (value) => `₹${(value / 100000).toFixed(2)} L`;

                return (
                  <div className="bg-white border shadow-sm rounded-xl w-full">
                    <LineChart
                        xAxis={[{ data: revenueChartData.xLabels, scaleType: 'point', label: revenueView === 'yearly' ? 'Months' : '' }]}
                        yAxis={[{ 
                            label: 'Amount in Lakhs (₹)',
                            min: 0,
                            max: yMax > 0 ? yMax * 1.2 : 100000,
                            valueFormatter: yAxisFormatter,
                        }]}
                        series={[{ 
                          data: revenueChartData.yData, 
                          label: 'Revenue', 
                          color: '#8b5cf6', 
                          area: true, 
                          curve: "monotoneX", 
                          showMark: true,
                          valueFormatter: tooltipFormatter,
                        }]}
                        height={350}
                        grid={{ vertical: true, horizontal: true }}
                        legend={{ position: { vertical: 'top', horizontal: 'center' } }}
                    />
                  </div>
                )
              })()
            )}
          </div>
        </main>
      </div>
    );
};

export default HomePage;