import React from "react";
import Image from "next/image";

/**
 * ChadWallet brand mark — the official Gigachad head (white variant for dark
 * backgrounds) from the brand kit, paired with the wordmark in Poppins.
 */
export function Glyph({ size = 30 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10"
      style={{ width: size + 8, height: size + 8 }}
    >
      <Image
        src="/brand/chad-head.png"
        alt="ChadWallet"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </span>
  );
}

export function Logo({
  size = 30,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Glyph size={size} />
      {showText && (
        <span className="font-display text-[1.15rem] font-extrabold tracking-tight text-bone">
          ChadWallet
        </span>
      )}
    </span>
  );
}
