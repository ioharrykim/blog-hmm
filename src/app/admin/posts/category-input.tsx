"use client";

import { KeyboardEvent, useMemo, useState } from "react";

export function CategoryInput({ initial, options }: { initial: string[]; options: string[] }) {
  const [categories, setCategories] = useState(initial);
  const [draft, setDraft] = useState("");

  const suggestions = useMemo(() => {
    const query = draft.trim().toLowerCase();
    return options
      .filter((option) => !categories.includes(option))
      .filter((option) => (query ? option.toLowerCase().includes(query) : true))
      .slice(0, 6);
  }, [categories, draft, options]);

  function addCategory(value: string) {
    const next = value.trim();
    if (!next || categories.includes(next)) return;
    setCategories([...categories, next]);
    setDraft("");
  }

  function removeCategory(value: string) {
    setCategories(categories.filter((category) => category !== value));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addCategory(draft);
    }
    if (event.key === "Backspace" && !draft && categories.length > 0) {
      removeCategory(categories[categories.length - 1]);
    }
  }

  return (
    <div className="category-input">
      <input type="hidden" name="tags" value={categories.join(", ")} />
      <div className="category-input__box">
        {categories.map((category) => (
          <button key={category} type="button" className="category-chip" onClick={() => removeCategory(category)}>
            {category} ×
          </button>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="카테고리 입력 후 Enter"
          aria-label="카테고리 입력"
        />
      </div>
      {suggestions.length > 0 ? (
        <div className="category-suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => addCategory(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
