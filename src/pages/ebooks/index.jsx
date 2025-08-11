const EbooksPage = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
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
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        .glow:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
        }
      `}</style>
      <main class="container mx-auto px-4 py-16">
        <section class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 fade-in">Ebooks Collection</h1>
          <p class="text-xl text-purple-200 max-w-3xl mx-auto fade-in-delay">
            Explore our curated collection of educational ebooks covering various topics from programming to design.
          </p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ebook Card 1 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Python book</h3>
            <p class="text-purple-100 mb-4">Learn the basics of Python programming and its applications in data science.</p>
            <a href="https://pythonbook.bioinfo.guru" class="text-purple-300 hover:text-white font-medium">Read now →</a>
          </div>

          {/* Ebook Card 2 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">R book</h3>
            <p class="text-indigo-100 mb-4">Master the fundamentals of R programming and data analysis.</p>
            <a href="https://rbook.bioinfo.guru" class="text-indigo-300 hover:text-white font-medium">Read now →</a>
          </div>

          {/* Ebook Card 3 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-emerald-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Bioinformatics</h3>
            <p class="text-emerald-100 mb-4">Coming soon...</p>
            <a href="#" class="text-emerald-300 hover:text-white font-medium">Read now →</a>
          </div>
        </section>
      </main>

    </div>
  );
};

export default EbooksPage;