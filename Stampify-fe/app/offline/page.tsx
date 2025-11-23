"use client"

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">You're Offline</h1>
        <p className="mb-6 text-lg text-muted-foreground">Please check your internet connection and try again</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
