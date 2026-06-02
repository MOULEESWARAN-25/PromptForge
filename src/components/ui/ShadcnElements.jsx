import React, { useState, useRef, useEffect } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── ACCESSIBLE SHADCN SELECT ────────────────────────────────────
export function ShadcnSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  triggerWidth = '100%',
  style = {}
}) {
  const currentOpt = options.find(o => o.value === value) || { label: placeholder, value };

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '600',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
          width: triggerWidth,
          textAlign: 'left',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          ...style
        }}
        className="active-scale-98"
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentOpt.label}
          </span>
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          style={{
            zIndex: 9999,
            minWidth: '180px',
            background: 'var(--popover)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '4px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <SelectPrimitive.ScrollUpButton style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px', color: 'var(--accent)' }}>
            ▲
          </SelectPrimitive.ScrollUpButton>
          
          <SelectPrimitive.Viewport style={{ padding: '2px' }}>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: value === opt.value ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: value === opt.value ? '700' : '500',
                  color: value === opt.value ? 'var(--accent)' : 'var(--foreground)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                  position: 'relative',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                }}
                className="select-item-hoverable"
              >
                <SelectPrimitive.ItemText>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                </SelectPrimitive.ItemText>
                
                <SelectPrimitive.ItemIndicator>
                  <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          
          <SelectPrimitive.ScrollDownButton style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px', color: 'var(--accent)' }}>
            ▼
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
      
      <style>{`
        .select-item-hoverable:hover {
          background: color-mix(in srgb, var(--accent) 8%, transparent) !important;
          color: var(--accent) !important;
        }
      `}</style>
    </SelectPrimitive.Root>
  );
}

// ─── ACCESSIBLE SHADCN COMBOBOX (SEARCHABLE & KEYBOARD NAVIGABLE) ────
export function ShadcnCombobox({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  searchPlaceholder = "Search options...",
  triggerWidth = '100%',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.desc && opt.desc.toLowerCase().includes(search.toLowerCase())) ||
    (opt.keywords && opt.keywords.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOpt = options.find(o => o.value === value) || { label: placeholder, value };

  // Reset highlight index when filter shifts
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Focus input automatically on opening popover
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(idx => (idx + 1) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(idx => (idx - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '600',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
          width: triggerWidth,
          textAlign: 'left',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          ...style
        }}
        className="active-scale-98"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOpt.label}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--muted-foreground)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          style={{
          zIndex: 9999,
          width: '240px',
          background: 'var(--popover)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '6px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxSizing: 'border-box'
        }}
        align="start"
        sideOffset={5}
      >
        {/* Combobox Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px' }}>
            <Search size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.74rem',
                color: 'var(--foreground)',
                width: '100%',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {search && (
              <X size={12} style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }} onClick={() => setSearch('')} />
            )}
          </div>

          {/* Combobox Option List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '1px',
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      background: isSelected 
                        ? 'color-mix(in srgb, var(--accent) 15%, transparent)' 
                        : isHighlighted 
                        ? 'color-mix(in srgb, var(--foreground) 5%, transparent)' 
                        : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                      {isSelected && <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                    </div>
                    {opt.desc && (
                      <span style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {opt.desc}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '12px 6px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                No options found.
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
