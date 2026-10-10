import { LoaderCircle } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="loadingShell" aria-live="polite" aria-busy="true">
      <div className="loadingCard">
        <LoaderCircle className="loadingIcon" />
        <p>Loading your account...</p>
      </div>
    </div>
  )
}
