interface CTAButtonProps {
  onBegin: () => void;
}

export function CTAButton({ onBegin }: CTAButtonProps) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <button
        onClick={onBegin}
        className="zz-cta-button hover:scale-105 transform transition-all duration-300"
        aria-label="begin zero zero experience"
      >
        begin
      </button>
    </div>
  );
}