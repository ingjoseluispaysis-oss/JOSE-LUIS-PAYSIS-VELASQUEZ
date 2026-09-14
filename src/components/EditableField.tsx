import React, { useState, useEffect, useRef } from "react";

interface EditableFieldProps {
  value: string | number;
  onSave: (val: any) => void;
  type?: "text" | "number" | "select" | "date";
  options?: string[];
  className?: string;
  placeholder?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  type = "text",
  options,
  className = "",
  placeholder = "—",
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  const commit = () => {
    let result: string | number = draft;
    if (type === "number") {
      result = parseFloat(draft);
      if (isNaN(result)) result = 0;
    }
    onSave(result);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        title="Doble clic para editar"
        className={`px-2 py-1 rounded hover:bg-[#13274F] cursor-text border border-transparent hover:border-[#1E3A5F] text-[#E6F1FF] text-[12px] font-mono min-h-[26px] flex items-center transition-colors truncate ${className}`}
      >
        {type === "select" ? (value ?? placeholder) : value === "" || value === null || value === undefined ? placeholder : String(value)}
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <select
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onSave(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="bg-[#0B1D3A] border border-[#FF6B00] text-[#E6F1FF] text-[12px] px-2 py-1 rounded w-full outline-none font-mono"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0B1D3A] text-white">
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      type={type === "number" ? "number" : type === "date" ? "date" : "text"}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      onBlur={commit}
      className={`bg-[#020A1E] border border-[#FF6B00] text-[#E6F1FF] text-[12px] px-2 py-1 rounded w-full font-mono outline-none shadow-inner ${className}`}
    />
  );
};
