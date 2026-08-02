import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, Zap, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";

const STATUSES = ["pending", "generating", "scoring", "storage", "complete"];

export default function Generate() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [jobId, setJobId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  const generateMutation = trpc.verigen.generateImage.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
      setResult(data);
      setCurrentStatus("complete");
    },
    onError: (error) => {
      console.error("Generation failed:", error);
      setCurrentStatus("");
    },
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true" || (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true');

    if (isDemoMode) {
      // Simulate multi-stage progress for demo mode
      const stages = [
        { status: "pending", delay: 800 },
        { status: "generating", delay: 2500 },
        { status: "scoring", delay: 1500 },
        { status: "storage", delay: 1200 },
      ];

      setCurrentStatus("pending");
      setResult(null);

      for (const stage of stages) {
        setCurrentStatus(stage.status);
        await new Promise(resolve => setTimeout(resolve, stage.delay));
      }
      
      // Final call to get mock data
      await generateMutation.mutateAsync({ prompt });
    } else {
      setCurrentStatus("pending");
      setResult(null);
      await generateMutation.mutateAsync({ prompt });
    }
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {!result ? (
          <>
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Generate with Consensus</h1>
              <p className="text-lg text-slate-600">
                Enter your creative prompt and watch as VeriGen generates across multiple AI models simultaneously.
              </p>
            </div>

            {/* Prompt Input */}
            <Card className="p-8 mb-8 border-slate-200">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                disabled={generateMutation.isPending}
                className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-slate-50"
              />
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generateMutation.isPending}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white w-full py-6 text-lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </Card>

            {/* Progress Indicator */}
            {currentStatus && (
              <Card className="p-8 border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Generation Progress</h2>
                <div className="space-y-4">
                  {STATUSES.map((status, idx) => {
                    const isActive = currentStatus === status;
                    const isComplete = STATUSES.indexOf(currentStatus) > idx;

                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            isComplete
                              ? "bg-emerald-600 text-white"
                              : isActive
                              ? "bg-emerald-100 text-emerald-600 animate-pulse"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isActive ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 capitalize">
                            {status.replace("_", " ")}
                          </p>
                          <p className="text-sm text-slate-600">
                            {status === "pending" && "Initializing generation job..."}
                            {status === "generating" && "Submitting to multiple AI providers..."}
                            {status === "scoring" && "Evaluating candidates across quality dimensions..."}
                            {status === "storage" && "Storing manifest and provenance in B2..."}
                            {status === "complete" && "Generation complete!"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Results View */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Generation Complete</h1>
              <p className="text-lg text-slate-600 mb-6">
                <strong>Prompt:</strong> {prompt}
              </p>
            </div>

            {/* Winner */}
            {result.winner && (
              <Card className="p-8 mb-8 border-emerald-300 bg-emerald-50">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-emerald-900">Consensus Winner</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <img
                      src={result.winner.imageUrl}
                      alt="Winner"
                      className="w-full rounded-lg border-2 border-emerald-300"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 mb-4">
                      {result.winner.model.toUpperCase()}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-700">Consensus Score</span>
                          <span className="text-sm font-bold text-emerald-600">
                            {result.winner.consensusScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${result.winner.consensusScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-200">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Prompt Adherence</p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.winner.scores?.promptAdherence || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Visual Quality</p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.winner.scores?.visualQuality || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Robustness</p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.winner.scores?.robustness || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Diversity</p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.winner.scores?.diversity || 0}
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
                {result.candidates?.map((candidate: any) => (
                  <Card key={candidate.model} className="p-6 border-slate-200">
                    <img
                      src={candidate.imageUrl}
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
                          {candidate.scores.consensusScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-slate-600 h-1.5 rounded-full"
                          style={{ width: `${candidate.scores.consensusScore}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-slate-600">Prompt</p>
                          <p className="font-bold text-slate-900">{candidate.scores.promptAdherence}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Visual</p>
                          <p className="font-bold text-slate-900">{candidate.scores.visualQuality}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Robust</p>
                          <p className="font-bold text-slate-900">{candidate.scores.robustness}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Diversity</p>
                          <p className="font-bold text-slate-900">{candidate.scores.diversity}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setPrompt("");
                  setCurrentStatus("");
                  setResult(null);
                  setJobId(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
              >
                Generate Again
              </Button>
              <Button
                onClick={() => setLocation(`/job/${jobId}`)}
                variant="outline"
                className="flex-1 py-6 text-lg"
              >
                View Full Details
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
