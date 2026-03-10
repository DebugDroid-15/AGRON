'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-dark-bg via-dark-secondary to-dark-bg">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue rounded-full mix-blend-screen filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-green rounded-full mix-blend-screen filter blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-40 border-b border-neon-blue border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            AGRON
          </h1>
          <div className="flex gap-6 items-center">
            <nav className="hidden md:flex gap-8">
              <a href="#home" className="text-gray-300 hover:text-neon-blue transition">Home</a>
              <a href="#features" className="text-gray-300 hover:text-neon-blue transition">Features</a>
              <a href="#technology" className="text-gray-300 hover:text-neon-blue transition">Technology</a>
            </nav>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-green text-dark-bg font-semibold rounded-lg hover:shadow-neon-blue transition-all hover:scale-105"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-7xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue animate-pulse">
            AGRON
          </h2>
          <p className="text-2xl md:text-3xl text-gray-300 font-light mb-6">
            Intelligent Real-Time Agricultural Control System
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Harness the power of IoT and AI to automate your farming operations. Monitor, control, and optimize your crops with our premium dashboard.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-green text-dark-bg font-semibold rounded-lg hover:shadow-neon-blue hover:scale-105 transition-all"
            >
              Launch Dashboard
            </button>
            <button className="px-8 py-4 border-2 border-neon-blue text-neon-blue font-semibold rounded-lg hover:bg-neon-blue hover:text-dark-bg transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 bg-dark-secondary bg-opacity-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            Premium Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💧', title: 'Smart Irrigation', desc: 'Automated water management' },
              { icon: '🌡️', title: 'Climate Monitoring', desc: 'Real-time environmental tracking' },
              { icon: '⚡', title: 'Smart Lighting', desc: 'Optimized light cycles for growth' },
              { icon: '📊', title: 'Analytics', desc: 'Historical trends & predictive insights' },
              { icon: '🤖', title: 'AI Optimization', desc: 'Machine learning-driven automation' },
              { icon: '🛡️', title: 'Protection', desc: 'Alerts & failsafes for critical events' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-neon-blue border-opacity-20 hover:border-opacity-50 bg-dark-bg bg-opacity-50 backdrop-blur-sm hover:shadow-neon-blue transition-all hover:-translate-y-2"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-neon-blue mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            Advanced Tech Stack
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 border border-neon-blue border-opacity-20 rounded-2xl backdrop-blur-sm">
            {[
              { name: 'ESP32', emoji: '🔧' },
              { name: 'React', emoji: '⚛️' },
              { name: 'Next.js', emoji: '▲' },
              { name: 'Framer Motion', emoji: '✨' },
              { name: 'TailwindCSS', emoji: '🎨' },
              { name: 'Zustand', emoji: '📦' },
              { name: 'Recharts', emoji: '📈' },
              { name: 'TypeScript', emoji: '🔷' },
            ].map((tech, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-2">{tech.emoji}</div>
                <p className="text-neon-blue font-semibold">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center p-12 border border-neon-blue border-opacity-20 rounded-2xl backdrop-blur-sm">
          <h3 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            Ready to Transform Your Farm?
          </h3>
          <p className="text-gray-400 mb-8 text-lg">
            Experience real-time IoT monitoring and intelligent automation with AGRON.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-green text-dark-bg font-semibold rounded-lg hover:shadow-neon-blue hover:scale-105 transition-all"
          >
            Explore Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neon-blue border-opacity-10 py-8 px-6 text-center text-gray-500">
        <p>© 2024 AGRON - Intelligent Agricultural Control System. All rights reserved.</p>
      </footer>
    </div>
  );
}
