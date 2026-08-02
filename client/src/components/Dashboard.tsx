import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Database, 
  Clock, 
  TrendingUp, 
  Activity,
  Users,
  Briefcase
} from "lucide-react";
import * as mockData from "../../../shared/mock";

export function Dashboard() {
  const stats = mockData.MOCK_ANALYTICS.stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Daily Requests" 
          value={stats.totalRequests.toLocaleString()} 
          icon={<Zap className="w-5 h-5 text-emerald-600" />} 
          trend="+12% from yesterday"
        />
        <StatCard 
          title="Success Rate" 
          value={`${stats.successRate}%`} 
          icon={<Shield className="w-5 h-5 text-emerald-600" />} 
          trend="99.9% uptime"
        />
        <StatCard 
          title="Storage Used" 
          value={stats.costSavings} 
          icon={<Database className="w-5 h-5 text-emerald-600" />} 
          trend="1.2TB total"
        />
        <StatCard 
          title="Avg. Latency" 
          value={stats.avgLatency} 
          icon={<Clock className="w-5 h-5 text-emerald-600" />} 
          trend="-200ms optimization"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Request Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-slate-50 rounded-lg flex items-end justify-between p-6 gap-2">
              {mockData.MOCK_ANALYTICS.requestsOverTime.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm transition-all hover:bg-emerald-500/40"
                    style={{ height: `${(d.count / 800) * 100}%` }}
                  />
                  <span className="text-[10px] text-slate-500 rotate-45 mt-2">{d.date.split('-').slice(1).join('/')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockData.MOCK_ACTIVITY.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.target} • {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.MOCK_ORGANIZATIONS.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                      {org.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{org.name}</p>
                      <p className="text-xs text-slate-500">{org.industry} • {org.plan}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{org.users} Users</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              AI Providers Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.MOCK_PROVIDERS.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-bold text-slate-900">{provider.name}</p>
                    <p className="text-xs text-slate-500">{provider.models.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                      {provider.status}
                    </Badge>
                    <p className="text-[10px] text-slate-500 mt-1">Latency: {provider.latency}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
