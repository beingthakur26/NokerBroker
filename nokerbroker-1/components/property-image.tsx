import Image from "next/image";

interface PropertyImageProps {
  imageUrl?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
}

export function PropertyImage({
  imageUrl,
  alt = "Property",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: PropertyImageProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 facade" aria-hidden="true">
      <div className="roofline" />
      <div className="windows">
        {Array.from({ length: 15 }, (_, index) => (
          <i key={index} className={index % 3 === 0 ? "lit" : ""} />
        ))}
      </div>
    </div>
  );
}
