import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trophy, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function JobDetails() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { jobId } = useParams<{ jobId: string }>();

  const jobQuery = trpc.verigen.getJobDetails.useQuery(
    { jobId: parseInt(jobId || "0") },
    { enabled: !!jobId && isAuthenticated }
  );

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (jobQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const job = jobQuery.data;
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Button onClick={() => setLocation("/")} variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <p className="text-slate-600">Job not found</p>
        </div>
      </div>
    );
  }

  const winner = job.candidates?.find((c) => c.id === job.winnerId);

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
          <Button variant="outline" onClick={() => setLocation("/")}>
            Home
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Button onClick={() => setLocation("/")} variant="outline" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Job Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Generation #{job.id}</h1>
          <p className="text-slate-600">
            <strong>Prompt:</strong> {job.prompt}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Created {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Winner Section */}
        {winner && (
          <Card className="p-8 mb-8 border-emerald-300 bg-emerald-50">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-emerald-900">Consensus Winner</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={winner.imageUrl || ""}
                  alt="Winner"
                  className="w-full rounded-lg border-2 border-emerald-300"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 mb-4">
                  {winner.model.toUpperCase()}
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">Consensus Score</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {winner.scores?.consensusScore || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${winner.scores?.consensusScore || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-200">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Prompt Adherence</p>
                      <p className="text-lg font-bold text-slate-900">
                        {winner.scores?.promptAdherence || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Visual Quality</p>
                      <p className="text-lg font-bold text-slate-900">
                        {winner.scores?.visualQuality || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Robustness</p>
                      <p className="text-lg font-bold text-slate-900">
                        {winner.scores?.robustness || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Diversity</p>
                      <p className="text-lg font-bold text-slate-900">
                        {winner.scores?.diversity || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Candidates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Candidates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {job.candidates?.map((candidate) => (
              <Card key={candidate.id} className="p-6 border-slate-200">
                <img
                  src={candidate.imageUrl || ""}
                  alt={candidate.model}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-slate-900 mb-3 uppercase text-sm">
                  {candidate.model}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Consensus</span>
                    <span className="font-bold text-slate-900">
                      {candidate.scores?.consensusScore || 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-slate-600 h-1.5 rounded-full"
                      style={{ width: `${candidate.scores?.consensusScore || 0}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-slate-600">Prompt</p>
                      <p className="font-bold text-slate-900">{candidate.scores?.promptAdherence}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Visual</p>
                      <p className="font-bold text-slate-900">{candidate.scores?.visualQuality}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Robust</p>
                      <p className="font-bold text-slate-900">{candidate.scores?.robustness}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Diversity</p>
                      <p className="font-bold text-slate-900">{candidate.scores?.diversity}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Provenance */}
        {job.manifestHash && (
          <Card className="p-6 border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4">Provenance & Storage</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600 mb-1">SHA-256 Manifest Hash</p>
                <p className="font-mono text-xs text-slate-900 break-all bg-white p-3 rounded border border-slate-200">
                  {job.manifestHash}
                </p>
              </div>
              {job.b2JobPath && (
                <div>
                  <p className="text-slate-600 mb-1">Backblaze B2 Storage Path</p>
                  <p className="font-mono text-xs text-slate-900 break-all bg-white p-3 rounded border border-slate-200">
                    {job.b2JobPath}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
