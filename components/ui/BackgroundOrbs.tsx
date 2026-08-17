export function BackgroundOrbs() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="bg-orb h-[32rem] w-[32rem] -top-40 -left-40"
        style={{ background: "radial-gradient(circle, rgb(99 91 255 / 0.55), transparent 70%)" }}
      />
      <div
        className="bg-orb h-[28rem] w-[28rem] top-1/3 -right-32"
        style={{ background: "radial-gradient(circle, rgb(56 189 248 / 0.5), transparent 70%)", animationDelay: "-8s" }}
      />
      <div
        className="bg-orb h-[24rem] w-[24rem] bottom-[-6rem] left-1/4"
        style={{ background: "radial-gradient(circle, rgb(236 72 153 / 0.35), transparent 70%)", animationDelay: "-14s" }}
      />
    </div>
  );
}
