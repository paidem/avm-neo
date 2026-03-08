import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { searchTags } from '../../api/bookmarks';
import styles from './TagInput.module.css';

interface Props {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ selectedTags, onChange }: Props) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    try {
      const tags = await searchTags(query);
      const filtered = tags
        .map((t) => t.name)
        .filter((name) => !selectedTags.includes(name));
      setSuggestions(filtered);
      setOpen(filtered.length > 0 || query.trim().length > 0);
      setHighlightIdx(-1);
    } catch {
      setSuggestions([]);
    }
  }, [selectedTags]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(input), 200);
    return () => clearTimeout(debounceRef.current);
  }, [input, fetchSuggestions]);

  const addTag = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setInput('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (name: string) => {
    onChange(selectedTags.filter((t) => t !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        addTag(suggestions[highlightIdx]);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const showCreateOption = input.trim() && !suggestions.includes(input.trim()) && !selectedTags.includes(input.trim());

  return (
    <div className={styles.container}>
      <div className={styles.inputArea}>
        {selectedTags.map((tag) => (
          <span key={tag} className={styles.chip}>
            {tag}
            <button className={styles.chipRemove} onClick={() => removeTag(tag)}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => input.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
        />
      </div>

      {open && (suggestions.length > 0 || showCreateOption) && (
        <div className={styles.dropdown}>
          {suggestions.map((name, idx) => (
            <div
              key={name}
              className={`${styles.option} ${idx === highlightIdx ? styles.highlighted : ''}`}
              onMouseDown={() => addTag(name)}
              onMouseEnter={() => setHighlightIdx(idx)}
            >
              {name}
            </div>
          ))}
          {showCreateOption && (
            <div
              className={`${styles.option} ${styles.createOption} ${suggestions.length === highlightIdx ? styles.highlighted : ''}`}
              onMouseDown={() => addTag(input.trim())}
            >
              Create "{input.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
