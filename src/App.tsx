import { useEffect } from 'react';
import { useComputeStore } from '@/store/useComputeStore';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/layout/Dashboard';
import WebGpuBanner from '@/components/ui/WebGpuBanner';

export default function App() {
  const initGpuState = useComputeStore((s) => s.initGpuState);
  const gpuAvailable = useComputeStore((s) => s.gpuAvailable);
  const gpuInitialized = useComputeStore((s) => s.gpuInitialized);

  useEffect(() => {
    initGpuState();
  }, [initGpuState]);

  // Only show the banner after the async check has resolved — avoids false-positive
  // "unavailable" flash during the requestAdapter() call on page load.
  const showBanner = gpuInitialized && !gpuAvailable;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        {showBanner && <WebGpuBanner />}
        <Dashboard />
      </main>
    </div>
  );
}
