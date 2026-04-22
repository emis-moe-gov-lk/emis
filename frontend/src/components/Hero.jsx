import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl backdrop-blur-sm"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-ping"></div>
                <span className="text-cyan-200 font-semibold text-sm tracking-wide">
                  NEXT-GEN EDUCATION PLATFORM
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl lg:text-7xl font-bold text-white leading-tight"
              >
                Redefining
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Education
                </span>
                <span className="text-xl lg:text-2xl text-gray-300 font-light mt-4 block">
                  For the Digital Generation
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-300 leading-relaxed max-w-2xl"
              >
                Experience the future of learning with our AI-powered platform that connects 
                <span className="text-cyan-300"> 2M+ students</span>, 
                <span className="text-blue-300"> 100K+ educators</span>, and 
                <span className="text-purple-300"> 50K+ institutions</span> in a seamless digital ecosystem.
              </motion.p>
            </div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6"
            >
              {[
                { number: "50K+", label: "Institutions", color: "from-blue-500 to-cyan-500" },
                { number: "2M+", label: "Students", color: "from-green-500 to-emerald-500" },
                { number: "100K+", label: "Educators", color: "from-purple-500 to-pink-500" },
                { number: "95%", label: "Success Rate", color: "from-orange-500 to-red-500" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`bg-gradient-to-r ${stat.color} rounded-2xl p-0.5 mb-3 transform group-hover:scale-105 transition-transform duration-300`}>
                    <div className="bg-slate-900 rounded-xl p-4">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.number}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/25">
                <span className="relative z-10">Launch Your Institution</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group border-2 border-gray-600 hover:border-cyan-400 text-gray-300 hover:text-cyan-300 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-cyan-500/10">
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Platform Demo
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Interactive Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                
                {/* Card Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Smart Dashboard</h3>
                    <p className="text-cyan-300 text-sm">Live Analytics</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-6">
                  {[
                    { label: "Student Engagement", value: "87%", trend: "+12%", color: "bg-green-500" },
                    { label: "Learning Progress", value: "94%", trend: "+8%", color: "bg-blue-500" },
                    { label: "Resource Usage", value: "76%", trend: "+23%", color: "bg-purple-500" }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${metric.color} rounded-full`}></div>
                        <span className="text-gray-300 font-medium">{metric.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{metric.value}</div>
                        <div className="text-green-400 text-sm">{metric.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bars */}
                <div className="mt-8 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>AI Adoption</span>
                      <span>68%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Digital Transformation</span>
                      <span>82%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 shadow-2xl"
            >
              <div className="text-slate-900 font-bold text-sm">AI Powered</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-4 shadow-2xl"
            >
              <div className="text-white font-bold text-sm">Real-time</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;