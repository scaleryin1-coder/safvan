import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  IndianRupee, 
  ArrowUpRight, 
  CheckCircle2, 
  BarChart3,
  LineChart as LineChartIcon,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic, playSound } from '../utils/feedback';

interface WorkerEarningsAnalyticsProps {
  todayEarnings: number;
  completedJobsCount: number;
}

interface ChartPoint {
  label: string;
  fullName: string;
  amount: number;
  jobs: number;
}

const WEEKLY_DATA: ChartPoint[] = [
  { label: 'Mon', fullName: 'Monday', amount: 1400, jobs: 3 },
  { label: 'Tue', fullName: 'Tuesday', amount: 1850, jobs: 4 },
  { label: 'Wed', fullName: 'Wednesday', amount: 950, jobs: 2 },
  { label: 'Thu', fullName: 'Thursday', amount: 2100, jobs: 5 },
  { label: 'Fri', fullName: 'Friday', amount: 1650, jobs: 4 },
  { label: 'Sat', fullName: 'Saturday', amount: 2450, jobs: 6 },
  { label: 'Sun', fullName: 'Sunday (Today)', amount: 1850, jobs: 4 },
];

const TODAY_HOURLY_DATA: ChartPoint[] = [
  { label: '9 AM', fullName: '9:00 AM - 11:00 AM', amount: 250, jobs: 1 },
  { label: '11 AM', fullName: '11:00 AM - 1:00 PM', amount: 480, jobs: 1 },
  { label: '1 PM', fullName: '1:00 PM - 3:00 PM', amount: 320, jobs: 1 },
  { label: '3 PM', fullName: '3:00 PM - 5:00 PM', amount: 520, jobs: 1 },
  { label: '5 PM', fullName: '5:00 PM - 7:00 PM', amount: 280, jobs: 1 },
  { label: '7 PM', fullName: '7:00 PM - 9:00 PM', amount: 0, jobs: 0 },
];

export const WorkerEarningsAnalytics: React.FC<WorkerEarningsAnalyticsProps> = ({
  todayEarnings,
  completedJobsCount,
}) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'daily'>('weekly');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const totalWeekly = WEEKLY_DATA.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWeeklyJobs = WEEKLY_DATA.reduce((acc, curr) => acc + curr.jobs, 0);
  const avgPerJob = Math.round(totalWeekly / totalWeeklyJobs);

  const chartData = timeframe === 'weekly' ? WEEKLY_DATA : TODAY_HOURLY_DATA;

  const handleWithdraw = () => {
    triggerHaptic('success');
    playSound('success');
    setIsWithdrawing(true);

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1000);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartPoint;
      return (
        <div className="bg-stone-900 text-white px-3 py-2 rounded-xl shadow-xl border border-stone-700 text-xs">
          <p className="font-extrabold text-[11px] text-red-400">
            {data.fullName || label}
          </p>
          <div className="flex items-center gap-1 font-black text-sm text-white mt-0.5">
            <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
            <span>{payload[0].value.toLocaleString()}</span>
          </div>
          {data.jobs !== undefined && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              {data.jobs} {data.jobs === 1 ? 'Job Completed' : 'Jobs Completed'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-black">
              Earnings & Trends
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              Daily & weekly income visualization
            </p>
          </div>
        </div>

        <div className="flex items-center p-0.5 bg-stone-100 rounded-xl border border-stone-200">
          <button
            onClick={() => {
              triggerHaptic('light');
              setTimeframe('weekly');
            }}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition ${
              timeframe === 'weekly'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-stone-500 hover:text-black'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setTimeframe('daily');
            }}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition ${
              timeframe === 'daily'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-stone-500 hover:text-black'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-black text-white rounded-2xl p-3.5 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
              {timeframe === 'weekly' ? 'This Week Net Income' : "Today's Earned Total"}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-white">
                ₹{(timeframe === 'weekly' ? totalWeekly : todayEarnings).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +24%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700">
            <button
              onClick={() => {
                triggerHaptic('light');
                setChartType('area');
              }}
              title="Area Curve"
              className={`p-1 rounded transition ${
                chartType === 'area' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setChartType('bar');
              }}
              title="Bar Chart"
              className={`p-1 rounded transition ${
                chartType === 'bar' ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-800 text-[10px]">
          <div>
            <span className="text-stone-400 block font-semibold">Avg / Job</span>
            <span className="font-black text-amber-300">₹{avgPerJob}</span>
          </div>
          <div>
            <span className="text-stone-400 block font-semibold">Peak Day</span>
            <span className="font-black text-white">Sat (₹2,450)</span>
          </div>
          <div>
            <span className="text-stone-400 block font-semibold">Total Jobs</span>
            <span className="font-black text-emerald-400">
              {timeframe === 'weekly' ? totalWeeklyJobs : completedJobsCount + 3}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Component */}
      <div className="pt-1">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716C', fontWeight: 700 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#A8A29E' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#DC2626"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#earningsRed)"
                  activeDot={{ r: 6, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#78716C', fontWeight: 700 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#A8A29E' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#DC2626" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cashout to UPI */}
      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">Available for Payout</span>
            <span className="font-black text-black text-sm">₹{todayEarnings}</span>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || todayEarnings === 0}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-black text-xs shadow-xs active:scale-95 transition disabled:opacity-50"
          >
            {isWithdrawing ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5" />
                <span>Instant Cashout to UPI</span>
              </>
            )}
          </button>
        </div>

        {withdrawSuccess && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-black flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>₹{todayEarnings} transferred to your UPI ID!</span>
          </div>
        )}
      </div>
    </div>
  );
};
