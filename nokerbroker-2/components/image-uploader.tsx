"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";
import { PropertyImage } from "@/components/property-image";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  multiple = true,
  label = "Add photos",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toasts = useToastManager();
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Upload failed");
        uploaded.push(data.url as string);
      } catch (error) {
        toasts.add({
          type: "error",
          title: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
    setUploading(false);
    if (uploaded.length > 0) {
      onChange(multiple ? [...value, ...uploaded] : [...uploaded]);
    }
  }

  return (
    <div>
      <div className="upload-row">
        {value.map((url) => (
          <div className="upload-thumb" key={url}>
            <PropertyImage imageUrl={url} alt="Uploaded" sizes="96px" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange(value.filter((item) => item !== url))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="upload-drop"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={18} className="spin" /> : <ImagePlus size={18} />}
          <span>{uploading ? "Uploading…" : label}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
