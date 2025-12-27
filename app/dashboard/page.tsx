import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { DashboardSaverView } from "@/components/dashboard/saver-view";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    // In Next.js 15+ searchParams is a Promise. In 14 it's an object. 
    // We'll await it just in case, or handle it based on version. 16.1.1 implies awaiting.
    const params = await searchParams;
    const isSaver = params.view === 'saver';

    return (
        <>
            <Navbar />
            <main className="flex-grow flex flex-col justify-start py-8 px-4 sm:px-6 lg:px-8">
                {isSaver ? <DashboardSaverView /> : <DashboardEmptyState />}

                {/* Dev Toggle */}
                <div className="fixed bottom-4 right-4 z-50">
                    <a href={isSaver ? "/dashboard" : "/dashboard?view=saver"} className="bg-black/50 hover:bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                        Toggle View
                    </a>
                </div>
            </main>
            <Footer />
        </>
    );
}
