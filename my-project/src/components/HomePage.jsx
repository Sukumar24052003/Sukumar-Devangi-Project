// src/pages/HomePage.jsx

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Icons for the UI cards.
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiCalendar,
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


// --- CALENDAR COMPONENT (UPDATED) ---
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
    
    // Data State
    const [allBookings, setAllBookings] = useState([]);
    const [allSpaces, setAllSpaces] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [revenueView, setRevenueView] = useState('yearly');
    const [range, setRange] = useState('month');
    
    // Derived State for UI
    const [bookingStatus, setBookingStatus] = useState({ ongoing: 0, completed: 0, upcoming: 0 });
    const [inventorySummary, setInventorySummary] = useState({ occupied: 0, vacant: 0 });
    const [unitUtilizationStats, setUnitUtilizationStats] = useState({ bookedUnits: 0, freeUnits: 0 });
    const [availabilityStats, setAvailabilityStats] = useState({ available: 0, booked: 0, overlapping: 0 });
    const [paymentStats, setPaymentStats] = useState({ totalReceived: 0, totalDue: 0 });
    const [revenueChartData, setRevenueChartData] = useState({ xLabels: [], yData: [] });
    const [pipelineBarData, setPipelineBarData] = useState({ labels: [], values: [] });
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [muiBookingData, setMuiBookingData] = useState({ xLabels: [], yData: [] });
    const [muiProposalData, setMuiProposalData] = useState({ xLabels: [], yData: [] });
    
    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (!loading) processAllStats(); }, [loading, allBookings, allSpaces, proposals, range, revenueView]);
    
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
      setInventorySummary({
          vacant: (availabilityStats.available || 0) + (unitUtilizationStats.freeUnits || 0),
          occupied: (availabilityStats.booked || 0) + (availabilityStats.overlapping || 0) + (unitUtilizationStats.bookedUnits || 0)
      });
      const totalPayments = allBookings.reduce((acc, booking) => {
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
      const pCounts = allBookings.reduce((counts, booking) => {
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
      const isYearly = revenueView === 'yearly';
      const timeUnits = isYearly ? 12 : 30;
      const timePeriod = isYearly ? 'month' : 'day';
      const timeFormat = isYearly ? 'MMM' : 'D MMM';
      const startPeriod = now.subtract(timeUnits - 1, timePeriod).startOf(timePeriod);
      const revMap = new Map();
      let sortedLabels = [];
      if(isYearly) {
        // Generate last 12 months in order
        for(let i = 11; i >= 0; i--) {
            sortedLabels.push(now.subtract(i, 'month').format('MMM'))
        }
      } else {
        // Generate last 30 days in order
        for(let i = 29; i >= 0; i--) {
            sortedLabels.push(now.subtract(i, 'day').format('D MMM'))
        }
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
    };
    
    const inventoryPieData = [{ value: inventorySummary.vacant || 1, color: '#f97316' }, { value: inventorySummary.occupied, color: '#d8b4fe' }];
    const bookingStatusPieData = [{ value: bookingStatus.completed, color: '#84cc16' }, { value: bookingStatus.ongoing, color: '#a855f7' }, { value: bookingStatus.upcoming, color: '#f97316' }];
    const paymentPieData = [{ value: paymentStats.totalReceived, color: '#4f46e5' }, { value: paymentStats.totalDue, color: '#f59e0b' }];
    const availabilityPieData = [{ value: availabilityStats.available, color: '#4f46e5' }, { value: availabilityStats.booked, color: '#f59e0b' }, { value: availabilityStats.overlapping, color: '#ef4444' }];
    
    let doohPieData;
    if (unitUtilizationStats.bookedUnits === 0 && unitUtilizationStats.freeUnits === 0) {
      doohPieData = [
        { value: 50, color: '#4f46e5' },
        { value: 50, color: '#f59e0b' }
      ];
    } else {
      doohPieData = [
        { value: unitUtilizationStats.bookedUnits, color: '#4f46e5' },
        { value: unitUtilizationStats.freeUnits, color: '#f59e0b' }
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
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
              {loading ? <><ShimmerCard height="h-[200px]" /><ShimmerCard height="h-[200px]" /></> : (
                <>
                  <Card><CardContent><h2 className="text-sm font-medium mb-4">Inventory</h2><div className="flex items-center gap-4">
                    <div className="w-1/2 flex justify-center items-center">
                      <PieChart 
                        series={[{ data: inventoryPieData, innerRadius: 40 }]}
                        width={140}
                        height={140} 
                        legend={{ hidden: true }} 
                      />
                    </div>
                    <div className="w-1/2 text-xs space-y-2">
                      <div className="flex items-center gap-2"><FiPackage className="text-gray-500"/>Occupied: <strong className="ml-auto">{inventorySummary.occupied}</strong></div>
                      <div className="flex items-center gap-2"><FiClock className="text-gray-500"/>Vacant: <strong className="ml-auto">{inventorySummary.vacant}</strong></div>
                    </div>
                  </div></CardContent></Card>
                  
                  <Card><CardContent><h2 className="text-sm font-medium mb-4">Booking Status</h2><div className="flex items-center gap-4">
                    <div className="w-1/2 flex justify-center items-center">
                      <PieChart 
                        series={[{ data: bookingStatusPieData, innerRadius: 40 }]}
                        width={140}
                        height={140} 
                        legend={{ hidden: true }}
                      />
                    </div>
                    <div className="w-1/2 text-xs space-y-2">
                      <div className="flex items-center gap-2"><FiRefreshCw className="text-gray-500"/>Ongoing: <strong className="ml-auto">{bookingStatus.ongoing}</strong></div>
                      <div className="flex items-center gap-2"><FiCalendar className="text-gray-500"/>Upcoming: <strong className="ml-auto">{bookingStatus.upcoming}</strong></div>
                      <div className="flex items-center gap-2"><FiCheckCircle className="text-gray-500"/>Completed: <strong className="ml-auto">{bookingStatus.completed}</strong></div>
                    </div>
                  </div></CardContent></Card>
                </>
              )}
            </div>
            <div className="lg:col-span-2">{loading ? <ShimmerCard height="h-full min-h-[250px]" /> : <DashboardCalendar bookings={allBookings} currentDate={currentDate} setCurrentDate={setCurrentDate} />}</div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? <><ShimmerCard height="h-[200px]" /><ShimmerCard height="h-[200px]" /><ShimmerCard height="h-[200px]" /></> : (<>
              <Card><CardContent><h2 className="text-sm font-medium mb-4">Payment Overview</h2><div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-center items-center">
                  <PieChart 
                    series={[{ data: paymentPieData, innerRadius: 40 }]}
                    width={140}
                    height={140} 
                    legend={{ hidden: true }} 
                  />
                </div>
                <div className="w-1/2 text-xs space-y-2">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-700"></div>Received: <strong className="ml-auto">₹{paymentStats.totalReceived.toLocaleString()}</strong></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Due: <strong className="ml-auto">₹{paymentStats.totalDue.toLocaleString()}</strong></div>
                </div>
              </div></CardContent></Card>
              <Card><CardContent><h2 className="text-sm font-medium mb-4">DOOH Utilization</h2><div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-center items-center">
                  <PieChart 
                    series={[{ data: doohPieData, innerRadius: 40 }]}
                    width={140}
                    height={140}
                    legend={{ hidden: true }} 
                  />
                </div>
                <div className="w-1/2 text-xs space-y-2">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-700"></div>Booked: <strong className="ml-auto">{unitUtilizationStats.bookedUnits}</strong></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Free: <strong className="ml-auto">{unitUtilizationStats.freeUnits}</strong></div>
                </div>
              </div></CardContent></Card>
              <Card><CardContent><h2 className="text-sm font-medium mb-4">Static Availability</h2><div className="flex items-center gap-4">
                <div className="w-1/2 flex justify-center items-center">
                  <PieChart 
                    series={[{ data: availabilityPieData, innerRadius: 40 }]}
                    width={140}
                    height={140} 
                    legend={{ hidden: true }}
                  />
                </div>
                <div className="w-1/2 text-xs space-y-2">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-700"></div>Available: <strong className="ml-auto">{availabilityStats.available}</strong></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Booked: <strong className="ml-auto">{availabilityStats.booked}</strong></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Overlapping: <strong className="ml-auto">{availabilityStats.overlapping}</strong></div>
                </div>
              </div></CardContent></Card>
            </>)}
          </div>
          
          <div className="mt-8 flex flex-col w-full gap-8">
              {!loading && (<>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card><CardContent><h2 className="text-sm font-medium mb-2">Recent Bookings vs. Proposals</h2><BarChart xAxis={[{scaleType:'band',data:muiBookingData.xLabels}]} series={[{data:muiBookingData.yData,label:'# Bookings'}, {data:muiProposalData.yData, label:'# Proposals'}]} height={300}/></CardContent></Card>
                  <Card><CardContent><h2 className="text-sm font-medium mb-2">Campaign Pipeline Status</h2><BarChart layout="horizontal" yAxis={[{scaleType:'band',data:pipelineBarData.labels}]} series={[{data:pipelineBarData.values,label:'Completed Campaigns'}]} height={300}/></CardContent></Card>
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
              // --- UPDATED: REVENUE GRAPH WITH DYNAMIC Y-AXIS ---
              (() => {
                // 1. Calculate the max value from your data
                const yMax = revenueChartData.yData.length > 0 ? Math.max(...revenueChartData.yData) : 0;
                
                return (
                  <div className="bg-white border shadow-sm rounded-xl w-full">
                    <LineChart
                        xAxis={[{ data: revenueChartData.xLabels, scaleType: 'point', label: revenueView === 'yearly' ? 'Months' : '' }]}
                        // 2. Update the yAxis prop
                        yAxis={[{ 
                            label: 'Amount in INR',
                            min: 0, // Force the graph to start at 0
                            // Set max to be slightly larger than the max data point for better visualization
                            // This provides a default max if all data points are 0.
                            max: yMax > 0 ? yMax * 1.2 : 500 
                        }]}
                        series={[{ data: revenueChartData.yData, label: 'Revenue', color: '#8b5cf6', area: true, curve: "monotoneX", showMark: true }]}
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