import Navbar from '../../components/ui/Navbar';
import NextjsSidebar from '../../components/ui/NextjsSidebar';

export default function LessonsLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar globale */}
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar Navigation */}
        <NextjsSidebar />
        <div className="flex-1 ml-[240px]">
          {/* Top Navigation - Info utilisateur */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between shadow-sm">
            <div className="md:hidden">
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium dark:text-white">Utilisateur</span>
              </div>
            </div>
          </header>
          
          {/* Content */}
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}