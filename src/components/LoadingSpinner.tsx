function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
