export default function ExplorePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Questions</h1>
        <p className="text-gray-600">Browse questions from the community</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="Search questions..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option>All Topics</option>
          <option>React</option>
          <option>TypeScript</option>
          <option>Next.js</option>
          <option>Supabase</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option>Most Recent</option>
          <option>Most Upvoted</option>
          <option>Most Answered</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors">
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <button className="text-gray-400 hover:text-violet-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">42</span>
              <button className="text-gray-400 hover:text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-violet-600 cursor-pointer">
                How to optimize Next.js app performance with ISR and SSR?
              </h3>
              <p className="text-gray-600 mb-4">
                I&apos;m working on a Next.js application and I&apos;m confused about when to use Incremental Static Regeneration (ISR) versus Server-Side Rendering (SSR)...
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>8 answers</span>
                <span>asked 3 hours ago</span>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">next.js</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors">
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <button className="text-gray-400 hover:text-violet-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">28</span>
              <button className="text-gray-400 hover:text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-violet-600 cursor-pointer">
                Best practices for TypeScript in React projects?
              </h3>
              <p className="text-gray-600 mb-4">
                What are the best practices for setting up TypeScript in a large React project? I&apos;m looking for advice on...
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>5 answers</span>
                <span>asked 5 hours ago</span>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">typescript</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">react</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors">
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <button className="text-gray-400 hover:text-violet-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">15</span>
              <button className="text-gray-400 hover:text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  AI Draft
                </span>
                <span className="text-sm text-gray-500">Generated instantly</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-violet-600 cursor-pointer">
                How does Supabase handle real-time subscriptions?
              </h3>
              <p className="text-gray-600 mb-4">
                Supabase provides real-time functionality through PostgreSQL&apos;s logical replication. When you subscribe to a table...
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="text-amber-600">0 answers</span>
                <span>asked 30 minutes ago</span>
                <div className="flex space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">supabase</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">realtime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign up prompt */}
      <div className="mt-8 bg-violet-50 p-6 rounded-lg border border-violet-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-violet-900 mb-2">Join the conversation</h3>
          <p className="text-violet-700 mb-4">
            Sign up to ask questions, write answers, and help build the perfect knowledge base.
          </p>
          <a 
            href="/signup" 
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors inline-block"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  )
}
