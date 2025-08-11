import { createSignal } from 'solid-js';

export default function MSADiaHelp() {
  return (
    <div class="help-page min-h-screen bg-gray-50 py-8 px-4">
      <header class="bg-gradient-to-r from-teal-400 to-blue-500 text-white text-center py-12 mb-8 rounded-lg shadow-lg">
        <h1 class="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          Welcome to MSA Annotator Help
        </h1>
        <p class="text-lg md:text-xl font-medium">Your interactive guide to sequence alignment annotation</p>
      </header>

      <main class="max-w-4xl mx-auto space-y-8">
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-dna text-blue-500"></i>
            What is MSA Annotator?
          </h2>
          <p class="text-lg text-gray-700">
            MSA Annotator is an <span class="text-teal-600 font-semibold">interactive web tool</span> for visualizing and annotating multiple sequence alignments (MSA) in FASTA format. Highlight regions, add notes, and export your annotations for further analysis or sharing.
          </p>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-compass text-teal-500"></i>
            How to Use
          </h2>
          <ol class="space-y-4 text-lg text-gray-700">
            <li>
              <strong class="text-blue-600">
                <i class="fa-solid fa-upload mr-2"></i>Upload MSA File:
              </strong>
              <span>Click <b>Upload MSA File</b> or drag and drop your FASTA file into the upload area. Supported formats: <code class="bg-gray-100 px-2 py-1 rounded text-sm">.fasta</code>, <code class="bg-gray-100 px-2 py-1 rounded text-sm">.fas</code>.</span>
            </li>
            <li>
              <strong class="text-teal-600">
                <i class="fa-solid fa-sliders mr-2"></i>View Controls:
              </strong>
              <span>Adjust color scheme, line length, and zoom level using the sidebar controls.</span>
            </li>
            <li>
              <strong class="text-orange-400">
                <i class="fa-solid fa-highlighter mr-2"></i>Annotation Tools:
              </strong>
              <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Select <b>Selection Mode</b>: Choose between single residue or region selection.</li>
                <li>Select <b>Annotation Mode</b>: Fill or border only.</li>
                <li>Pick <b>Annotation Color</b>: Use palette or custom color picker.</li>
                <li>Adjust <b>Opacity</b> and <b>Border Width</b> as needed.</li>
                <li>Click <span class="text-blue-600 font-medium">Add Annotation</span> to highlight selected regions.</li>
                <li>Use <span class="text-orange-400 font-medium">Clear All</span> to remove all annotations.</li>
              </ul>
            </li>
            <li>
              <strong class="text-yellow-600">
                <i class="fa-solid fa-download mr-2"></i>Export & Download:
              </strong>
              <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Download the alignment image using <b>Download Image</b>.</li>
                <li>Export annotations with <b>Export Annotations</b>.</li>
              </ul>
            </li>
          </ol>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-lightbulb text-yellow-500"></i>
            Tips
          </h2>
          <ul class="space-y-2 text-lg text-gray-700">
            <li class="flex items-start gap-2">
              <span class="text-xl">💡</span>
              <span><span class="text-blue-500">Hover</span> over alignment regions to see position details on the status bar.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-xl">📝</span>
              <span>Use the sidebar to manage and review your annotations.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-xl">⚠️</span>
              <span><span class="text-orange-400 font-medium">Annotations are not saved automatically</span>; export them before leaving the page.</span>
            </li>
          </ul>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-quote-left text-orange-400"></i>
            Citation
          </h2>
          <p class="text-lg text-gray-700">
            Please cite <span class="text-teal-600 font-semibold">bioinfo.guru</span> if you use this tool in your research.
          </p>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-envelope-circle-check text-teal-500"></i>
            Contact & Support
          </h2>
          <p class="text-lg text-gray-700">
            For questions or feedback, visit our social links below or contact 
            <a href="mailto:support@bioinfo.guru" class="text-blue-600 font-semibold hover:underline">
              support@bioinfo.guru
            </a>.
          </p>
        </section>
      </main>

      <footer class="bg-slate-900 text-cream-100 py-6 mt-12">
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-center gap-4">
            <a href="https://fb.bioinfo.guru" target="_blank" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 text-white transition-all" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://tw.bioinfo.guru" target="_blank" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 text-white transition-all" title="Twitter">
              <i class="fab fa-x-twitter"></i>
            </a>
            <a href="https://li.bioinfo.guru" target="_blank" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 text-white transition-all" title="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="https://wa.bioinfo.guru" target="_blank" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 text-white transition-all" title="WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
            <a href="https://ig.bioinfo.guru" target="_blank" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 text-white transition-all" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

