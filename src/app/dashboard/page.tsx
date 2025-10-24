export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Market Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold">Market Overview</h2>
          <p>General market information available to all users</p>
        </div>
      </div>
    </div>
  )
}
