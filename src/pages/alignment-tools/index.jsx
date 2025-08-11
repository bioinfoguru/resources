import { A } from '@solidjs/router';

const AlignmentToolsPage = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-cyan-900 via-purple-900 to-pink-900">
      {/* Fade-in animation styles */}
      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .fade-in-delay {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s 0.4s ease-out forwards;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: none;
          }
        }
        .glow {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }
        .glow:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
        }
      `}</style>
      <main class="container mx-auto px-4 py-16">
        <section class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 fade-in">Alignment Tools</h1>
          <p class="text-xl text-cyan-200 max-w-3xl mx-auto fade-in-delay">
            Professional tools for sequence alignment, multiple sequence analysis, and bioinformatics research.
          </p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tool Card 1 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-cyan-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">MSA Annotator</h3>
            <p class="text-cyan-100 mb-4">Interactive tool for visualizing and annotating multiple sequence alignments with customizable colors and highlights.</p>
            <A href="/alignment-tools/msa_dia" class="text-cyan-300 hover:text-white font-medium">Launch Tool →</A>
          </div>

          {/* Tool Card 2 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-emerald-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Secondary structure with sequence</h3>
            <p class="text-emerald-100 mb-4">Construct dssp based secondary structure overlay on protein sequence.</p>
            <a href="/alignment-tools/ss-dia" class="text-emerald-300 hover:text-white font-medium">Launch Tool →</a>
          </div>

          {/* Tool Card 3 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Sequence Analysis tools</h3>
            <p class="text-purple-100 mb-4">Coming soon...</p>
            <a href="#" class="text-purple-300 hover:text-white font-medium">Launch Tool →</a>
          </div>


        </section>
      </main>

    </div>
  );
};

export default AlignmentToolsPage;