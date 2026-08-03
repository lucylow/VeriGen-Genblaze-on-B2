import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const historyQuery = trpc.verigen.getJobHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg text-slate-900">VeriGen</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation("/")}>
              Home
            </Button>
            <Button
              onClick={() => setLocation("/generate")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Generation History</h1>
          <p className="text-lg text-slate-600">
            View all your past generation runs with consensus scores and provenance data.
          </p>
        </div>

        {historyQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : !historyQuery.data || historyQuery.data.length === 0 ? (
          <Card className="p-12 text-center border-slate-200">
            <p className="text-slate-600 mb-6">No generations yet. Start creating!</p>
            <Button
              onClick={() => setLocation("/generate")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Generate <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {historyQuery.data.map((job) => (
              <Card
                key={job.id}
                className="p-6 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setLocation(`/job/${job.id}`)}
              >
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  {/* Thumbnail */}
                  <div className="md:col-span-1">
                    <div className="aspect-square rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center">
                      {(job as any).winnerImageUrl ? (
                        <img 
                          src={(job as any).winnerImageUrl} 
                          alt="Winner" 
                          className="w-full h-full object-cover"
                        />
                      ) : job.winnerId ? (
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-600">Winner</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {job.consensusScore}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500">No winner</p>
                      )}
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="md:col-span-2">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                      {job.prompt}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.status === "complete"
                            ? "bg-emerald-100 text-emerald-700"
                            : job.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="md:col-span-1">
                    <div className="text-right">
                      <p className="text-xs text-slate-600 mb-2">Consensus Score</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {job.consensusScore || "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {job.winnerId ? "Complete" : "Processing"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
