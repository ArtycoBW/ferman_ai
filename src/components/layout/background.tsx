'use client'

export function Background() {
  return (
    <>
      <div className="fixed inset-0 animated-bg -z-20" />
      <div className="fixed inset-0 grid-pattern -z-10" />
      <div className="floating-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>
    </>
  )
}
