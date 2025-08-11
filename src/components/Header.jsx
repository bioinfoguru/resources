import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';

const Header = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <header class="bg-gradient-to-r from-blue-900 via-purple-600 to-[#9c51e0] text-white shadow-lg sticky top-0 z-50 border-b border-white/20 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          {/* Logo */}
          <div class="flex items-center">
            <A href="/" class="flex items-center space-x-2">
              <div class="w-10 h-10 flex items-center justify-center">
                <span class="text-xl font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg"
     width="50px" height="50px"
     viewBox="0 0 476 712">
  <path id="bg_logo"
        fill="#9c51e0" stroke="none" stroke-width="0"
        d="M 0.00,0.00
           C 0.00,0.00 130.00,0.00 130.00,0.00
             130.00,0.00 168.00,0.00 168.00,0.00
             168.00,0.00 186.00,1.00 186.00,1.00
             186.00,1.00 152.00,17.75 152.00,17.75
             152.00,17.75 92.00,47.75 92.00,47.75
             92.00,47.75 72.00,57.75 72.00,57.75
             72.00,57.75 64.02,63.21 64.02,63.21
             64.02,63.21 63.00,71.00 63.00,71.00
             63.00,71.00 63.00,649.00 63.00,649.00
             63.00,649.00 413.00,649.00 413.00,649.00
             413.00,649.00 413.00,359.00 413.00,359.00
             413.00,359.00 298.00,397.33 298.00,397.33
             298.00,397.33 262.00,409.33 262.00,409.33
             262.00,409.33 240.00,416.00 240.00,416.00
             240.00,416.00 240.00,471.00 240.00,471.00
             240.00,471.00 313.00,452.63 313.00,452.63
             313.00,452.63 358.00,442.00 358.00,442.00
             358.00,442.00 358.00,594.00 358.00,594.00
             358.00,594.00 118.00,594.00 118.00,594.00
             118.00,594.00 118.00,294.00 118.00,294.00
             118.00,294.00 320.00,334.40 320.00,334.40
             320.00,334.40 382.00,346.80 382.00,346.80
             382.00,346.80 417.00,353.00 417.00,353.00
             417.00,353.00 431.59,441.00 431.59,441.00
             431.59,441.00 458.41,602.00 458.41,602.00
             458.41,602.00 470.25,673.00 470.25,673.00
             470.25,673.00 476.00,712.00 476.00,712.00
             476.00,712.00 0.00,712.00 0.00,712.00
             0.00,712.00 0.00,0.00 0.00,0.00 Z" />
</svg>
                </span>
              </div>
              {/* <span class="text-xl font-bold">Resources</span> */}
            </A>
          </div>

          {/* Desktop Navigation */}
          <nav class="hidden md:flex space-x-8">
            <A href="/" class="hover:text-blue-400 transition-colors">Home</A>
            <A href="/ebooks" class="hover:text-blue-400 transition-colors">Ebooks</A>
            <A href="/docking-tools" class="hover:text-blue-400 transition-colors">Docking Tools</A>
            <A href="/alignment-tools" class="hover:text-blue-400 transition-colors">Alignment Tools</A>
            <A href="/games" class="hover:text-blue-400 transition-colors">Games</A>
          </nav>

          {/* Mobile menu button */}
          <button 
            class="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen())}
          >
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen() ? (
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen() && (
          <nav class="md:hidden py-4">
            <div class="flex flex-col space-y-3">
              <A href="/" class="hover:text-blue-400 transition-colors">Home</A>
              <A href="/ebooks" class="hover:text-blue-400 transition-colors">Ebooks</A>
              <A href="/docking-tools" class="hover:text-blue-400 transition-colors">Docking Tools</A>
              <A href="/alignment-tools" class="hover:text-blue-400 transition-colors">Alignment Tools</A>
              <A href="/games" class="hover:text-blue-400 transition-colors">Games</A>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
