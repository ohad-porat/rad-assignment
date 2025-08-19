import { Navbar } from "./components/Navbar";
import { ThreatTable } from "./components/ThreatTable/ThreatTable";
import { ThreatTrendGraph } from "./components/visualizations/ThreatTrendGraph";
import { CategoryPieChart } from "./components/visualizations/CategoryPieChart";
import { CriticalAlertsFeed } from "./components/CriticalAlertsFeed";
import { Toaster } from "./components/ui/sonner";
import { useThreatStream } from "./hooks/useThreatStream";
import { AIAssistant } from "./components/AIAssistant/AIAssistant";

function App() {
  useThreatStream();

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 pb-8 sm:pb-12 pt-16 sm:pt-20">
        <div className="space-y-8 sm:space-y-8 lg:space-y-14">
          <CriticalAlertsFeed />
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-6">
            <div className="flex-1">
              <ThreatTrendGraph />
            </div>
            <div className="flex-1">
              <CategoryPieChart />
            </div>
          </div>
          <ThreatTable />
        </div>
      </main>
      <Toaster />
      <AIAssistant />
    </div>
  );
}

export default App;
