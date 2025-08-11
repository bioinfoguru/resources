const DockingToolsPage = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      
      <main class="container mx-auto px-4 py-16">
        <section class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">Docking Tools</h1>
          <p class="text-xl text-emerald-200 max-w-3xl mx-auto">
            Professional tools for efficient workspace management, window docking, and productivity enhancement.
          </p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tool Card 1 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-emerald-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Docking App</h3>
            <p class="text-emerald-100 mb-4">A desktop app for running and analyzing protein-ligand docking.</p>
            <a href="https://github.com/bioinfoguru/molecular_docking" class="text-emerald-300 hover:text-white font-medium">Download →</a>
          </div>

          {/* Tool Card 2 */}
          <div class="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-400 transition-all duration-300 glow">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Interaction analysis</h3>
            <p class="text-purple-100 mb-4">Coming soon...</p>
            <a href="#" class="text-purple-300 hover:text-white font-medium">Download →</a>
          </div>

        </section>
      </main>

    </div>
  );
};

export default DockingToolsPage;