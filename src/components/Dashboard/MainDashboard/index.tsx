import AdSpend from "@/components/Dashboard/AdSpend";
import CostPerThousand from "@/components/Dashboard/CostPerThousand";
import CostPerClick from "@/components/Dashboard/CostPerClick";
import ClickThroughRate from "@/components/Dashboard/ClickThroughRate";
import PerformanceOverview from "@/components/Dashboard/PerformanceOverview";
import DownloadMobileApp from "@/components/Dashboard/DownloadMobileApp";
import Channels from "@/components/Dashboard/Channels";
import InstagramCampaigns from "@/components/Dashboard/InstagramCampaigns";
import Cta from "@/components/Dashboard/Cta";
import Campaigns from "@/components/Dashboard/Campaigns";
import MarkersMap from "@/components/Maps/MarkersMap"; // Updated import for MarkersMap

export default function MainDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px] mb-[25px]">
        <AdSpend />

        <CostPerThousand />

        <CostPerClick />

        <ClickThroughRate />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px] mb-[25px]">
        <div className="lg:col-span-2">
          <PerformanceOverview />
        </div>

        <div className="lg:col-span-1">
          <DownloadMobileApp />
        </div>
      </div>
        <div className="lg:col-span-2">
          <Campaigns />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px]">
            {/* Removed ExternalLinks */}
            <MarkersMap /> {/* Added MarkersMap */}

            <InstagramCampaigns />
          </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[25px] mb-[25px]">
        <div className="lg:col-span-1">
          <Cta />
        </div>
      </div>
    </>
  );
}
