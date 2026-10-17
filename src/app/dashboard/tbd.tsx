// import HlsPlayer from '@/components/HlsPlayer';
// import TestHls from '@/components/TestHls';
// import WebRTCPlayer from '@/components/WebRTCPlayer';

const DashboardPage = () => {
  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-4xl">Dashboard page coming soon!</p>

      {/* <div className="min-h-screen bg-gray-100 py-8">
        <WebRTCPlayer defaultUrl="http://localhost:8889/mystream/" />
      </div> */}

      {/* <TestHls
        src="http://204.168.215.157:8888/camera/index.m3u8"
      /> */}

      <iframe
        src="http://204.168.215.157:8888/camera/index.m3u8"
        width="100%"
        height="500"
        frameBorder="0"
        allowFullScreen
      />

      {/* <HlsPlayer
        streamUrl="http://localhost:8888/mystream/index.m3u8"
      /> */}
    </div>
  );
};

export default DashboardPage;