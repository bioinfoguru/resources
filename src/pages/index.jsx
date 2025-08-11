import './index.css';
export default function IndexPage() {
  return (
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
  {/* Background animation removed to ensure footer visibility */}
      {/* Main content and cards above background */}
      <div class="relative z-10 flex flex-col flex-1">

        <main class="container mx-auto px-4 py-16 flex-1">
          <section class="text-center mb-20">
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Discover Amazing
              <span class="block text-blue-400">Resources</span>
            </h1>
            <p class="text-xl text-blue-200 max-w-2xl mx-auto font-semibold mt-2 animate-fade-in-delay">
              Your gateway to learning, research, and fun.
            </p>
            <p class="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-delay">
              Explore our collection of ebooks, tools, and games designed to enhance your learning and productivity.
            </p>
          </section>
          {/* Cards Section */}
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Ebooks Card */}
            <a href="/ebooks" class="group relative overflow-hidden rounded-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 p-8 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
              <div class="relative z-10">
                <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Ebooks</h3>
                <p class="text-gray-300">Access a vast collection of educational resources and learning materials.</p>
              </div>
            </a>
            {/* Docking Tools Card */}
            <a href="/docking-tools" class="group relative overflow-hidden rounded-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 p-8 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
              <div class="relative z-10">
                <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Docking Tools</h3>
                <p class="text-gray-300">Professional tools for docking and managing your workspace efficiently.</p>
              </div>
            </a>
            {/* Alignment Tools Card */}
            <a href="/alignment-tools" class="group relative overflow-hidden rounded-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 p-8 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
              <div class="relative z-10">
                <div class="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Alignment Tools</h3>
                <p class="text-gray-300">Precise alignment utilities for perfect positioning and organization.</p>
              </div>
            </a>
            {/* Games Card */}
            <a href="/games" class="group relative overflow-hidden rounded-2xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 p-8 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
              <div class="relative z-10">
                <div class="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Games</h3>
                <p class="text-gray-300">Fun and educational games to make learning enjoyable and interactive.</p>
              </div>
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}
