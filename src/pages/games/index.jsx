
const GamesPage = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
      
      <main class="container mx-auto px-4 py-16">
        <section class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">Educational Games</h1>
          <p class="text-xl text-red-200 max-w-3xl mx-auto">
            Fun and interactive games designed to make learning enjoyable and engaging for all ages.
          </p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Game Card 1 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-red-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-red-400 via-orange-400 to-amber-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">The Codon Game App</h3>
            <p class="text-red-100 mb-4">Learn the codon table through interactive gameplay.</p>
            <a href="https://codongame.bioinfo.guru" class="text-red-300 hover:text-white font-medium">Play Now →</a>
          </div>

          {/* Game Card 2 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-orange-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">More games</h3>
            <p class="text-orange-100 mb-4">Coming soon...</p>
            <a href="#" class="text-orange-300 hover:text-white font-medium">Play Now →</a>
          </div>

        </section>
      </main>

    </div>
  );
};

export default GamesPage;