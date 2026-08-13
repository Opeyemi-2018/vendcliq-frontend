"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VcIcon } from "./VcIcon";

/** Product images arrive protocol-relative (`//cdn…`), which next/image rejects. */
export const normalizeProductImage = (src?: string | null) => {
  if (!src) return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("http")) return src;
  return null;
};

interface ProductThumbProps {
  src?: string | null;
  alt: string;
  /** Box size in px. */
  size?: number;
  className?: string;
}

/**
 * Square product thumbnail that falls back to the bottle glyph when there is
 * no usable image, or when the remote one fails to load.
 */
export const ProductThumb = ({
  src,
  alt,
  size = 44,
  className = "",
}: ProductThumbProps) => {
  const [failed, setFailed] = useState(false);
  const url = normalizeProductImage(src);

  return (
    <span
      className={`rounded-[12px] bg-[#F4F6F8] border border-[#D8D8D899] inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {url && !failed ? (
        <Image
          src={url}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          onError={() => setFailed(true)}
          className="object-contain w-full h-full p-1"
        />
      ) : (
        <VcIcon
          name="bottle"
          size={Math.round(size * 0.45)}
          stroke="#6E7480"
          strokeWidth={1.7}
        />
      )}
    </span>
  );
};

export default ProductThumb;
