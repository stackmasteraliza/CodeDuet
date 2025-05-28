import { useState } from 'react';
import { Database, Code, ArrowRight, Zap, Play, Terminal } from 'lucide-react';
import SQLCompilerApp from './screens/sql-compiler';
import PythonCompilerApp from './screens/python-compiler';

function App() {
  const [selectedCompiler, setSelectedCompiler] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  if (selectedCompiler === 'sql') return <SQLCompilerApp />;
  if (selectedCompiler === 'python') return <PythonCompilerApp />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 relative overflow-hidden">

      {/* Animated Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/30 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Code Snippets */}
      <div className="absolute top-20 left-20 text-blue-400 font-mono text-sm animate-pulse">
        SELECT * FROM users;
      </div>
      <div className="absolute top-32 right-32 text-green-400 font-mono text-sm animate-pulse delay-300">
        print("Hello World")
      </div>
      <div className="absolute bottom-45 left-20 text-blue-300 font-mono text-sm animate-pulse delay-700">
        def factorial(n):
      </div>
      <div className="absolute bottom-20 right-20 text-green-300 font-mono text-sm animate-pulse delay-1000">
        ORDER BY id DESC
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white backdrop-blur-sm rounded-2xl border border-white/30">
              <Zap className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-700 via-green-600 to-teal-500 bg-clip-text text-transparent mb-4">
            Code Compiler
          </h1>
          <p className="text-xl text-gray-800 mb-2 max-w-2xl mx-auto leading-relaxed">
            Choose your programming language and start coding instantly
          </p>
          <p className="text-gray-500 text-sm">
            Execute code directly in your browser with real-time results
          </p>
        </div>

        {/* Compiler Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* SQL Compiler Card */}
          <div
            className={`group relative overflow-hidden rounded-3xl bg-white/30 backdrop-blur-lg border border-blue-200/50 p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:border-blue-400 ${hoveredCard === 'sql' ? 'shadow-2xl shadow-blue-400/30' : 'shadow-md'}`}
            onMouseEnter={() => setHoveredCard('sql')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setSelectedCompiler('sql')}
          >
            <div className="absolute inset-0 bg-blue-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-blue-100 rounded-2xl border border-blue-200">
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
                <ArrowRight className={`w-6 h-6 text-blue-500 transition-transform duration-300 ${hoveredCard === 'sql' ? 'translate-x-2' : ''}`} />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">SQL Compiler</h3>
              <p className="mb-6 leading-relaxed text-gray-700">
                Execute SQL queries against sample databases. Perfect for learning database operations and testing queries.
              </p>

              <div className="space-y-2 mb-6">
                {['SELECT, INSERT, UPDATE queries', 'Sample datasets included', 'Real-time query execution'].map((feature, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="bg-white/40 rounded-lg p-3 border border-blue-200/50">
                <code className="text-blue-600 text-xs font-mono">SELECT * FROM users WHERE age &gt; 25;</code>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-center w-full py-3 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-xl transition-colors duration-200">
                  <Play className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-blue-600 font-medium">Start SQL Coding</span>
                </div>
              </div>
            </div>
          </div>

          {/* Python Compiler Card */}
          <div
            className={`group relative overflow-hidden rounded-3xl bg-white/30 backdrop-blur-lg border border-green-200/50 p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:border-green-400 ${hoveredCard === 'python' ? 'shadow-2xl shadow-green-400/30' : 'shadow-md'}`}
            onMouseEnter={() => setHoveredCard('python')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setSelectedCompiler('python')}
          >
            <div className="absolute inset-0 bg-green-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-green-100 rounded-2xl border border-green-200">
                  <Code className="w-8 h-8 text-green-500" />
                </div>
                <ArrowRight className={`w-6 h-6 text-green-500 transition-transform duration-300 ${hoveredCard === 'python' ? 'translate-x-2' : ''}`} />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">Python Compiler</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Write and execute Python code instantly. Features built-in functions, loops, and variable handling.
              </p>

              <div className="space-y-2 mb-6">
                {['Variables & functions', 'Loops & conditionals', 'Instant code execution'].map((feature, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="bg-white/40 rounded-lg p-3 border border-green-200/50">
                <code className="text-green-600 text-xs font-mono">
                  print("Hello, World!")<br />
                  for i in range(5): print(i)
                </code>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-center w-full py-3 bg-green-100 hover:bg-green-200 border border-green-300 rounded-xl transition-colors duration-200">
                  <Terminal className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-green-600 font-medium">Start Python Coding</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          No installation required • Run code instantly • Learning-friendly environment
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
