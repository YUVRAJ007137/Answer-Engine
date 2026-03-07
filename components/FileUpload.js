"use client";

import { useCallback, useState } from "react";

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

export default function FileUpload({ onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const isValid = Object.keys(ACCEPTED_TYPES).includes(file.type);
      if (!isValid) {
        alert("Please upload a PDF or image file (PNG, JPEG, WebP).");
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
        Upload PDF or Image
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center gap-3
          transition-all duration-200 cursor-pointer
          ${disabled ? "opacity-50 pointer-events-none" : ""}
          ${dragOver ? "border-[var(--primary)] bg-[var(--primary-light)]" : "border-[var(--card-border)] hover:border-[var(--primary)]"}
        `}
      >
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <svg className="w-10 h-10" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>

        {selectedFile ? (
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {selectedFile.name}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Drag & drop or click to browse
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              PDF, PNG, JPEG, WebP
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={clearFile}
          disabled={disabled}
          className="text-xs hover:underline"
          style={{ color: "var(--error)" }}
        >
          Remove file
        </button>
      )}
    </div>
  );
}
