import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Shield, Layers } from "lucide-react";
import { startLogin } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg text-slate-900">VeriGen</span>
          </div>
          <div>
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/generate")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Generate <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            One Prompt.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Multiple Models.
            </span>
            <br />
            One Verified Winner.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            VeriGen submits your prompt to multiple AI providers simultaneously, scores each output across quality dimensions, and delivers the consensus winner with complete provenance.
          </p>
        </div>

        {isAuthenticated ? (
          <Button
            onClick={() => setLocation("/generate")}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6"
          >
            Start Generating <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6"
          >
            Sign In to Get Started <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Model Consensus</h3>
            <p className="text-slate-600">
              Simultaneously generate with OpenAI, Gemini, Replicate, and GMI Cloud. Compare outputs across all providers in one unified interface.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Automated Scoring</h3>
            <p className="text-slate-600">
              Each candidate is scored across Prompt Adherence, Visual Quality, Robustness, and Diversity. The consensus algorithm selects the winner.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Immutable Provenance</h3>
            <p className="text-slate-600">
              Every generation is stored in Backblaze B2 with SHA-256 hashes and complete metadata. Full audit trail for compliance and verification.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How VeriGen Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: "Submit Prompt", desc: "Enter your creative vision" },
            { step: 2, title: "Generate", desc: "Multi-model parallel execution" },
            { step: 3, title: "Score", desc: "Consensus evaluation engine" },
            { step: 4, title: "Deliver", desc: "Winner + provenance in B2" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-600">
          <p>VeriGen • Multi-Model AI Consensus Engine</p>
          <p className="text-sm mt-2">Powered by Backblaze B2 and Genblaze</p>
        </div>
      </footer>
    </div>
  );
}
