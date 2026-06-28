"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShadcnDropdown({
  value,
  onChange,
  options,
  style = {},
  placeholder = "Select option",
  triggerWidth = 'auto',
  onOpenChange,
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value };

  const [openUpward, setOpenUpward] = useState(false);

  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = 200;
      if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    } else if (!isOpen) {
      setOpenUpward(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onOpenChangeRef.current) onOpenChangeRef.current(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelectOption = (optVal) => {
    onChange(optVal);
    setIsOpen(false);
    if (onOpenChangeRef.current) onOpenChangeRef.current(false);
  };

  const toggleDropdown = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (onOpenChangeRef.current) onOpenChangeRef.current(nextOpen);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width: triggerWidth, zIndex: isOpen ? 1001 : 10 }}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.45rem 0.85rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '600',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
          width: '100%',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          ...style
        }}
        className="glass-panel active-scale-98"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption.label}
        </span>
        <ChevronDown 
          size={13} 
          style={{ 
            color: 'var(--muted-foreground)', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease', 
            flexShrink: 0 
          }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              ...(openUpward ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
              left: 0,
              zIndex: 1000,
              minWidth: '160px',
              width: '100%',
              background: 'var(--popover)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '4px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOption(opt.value);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? 'var(--accent)' : 'var(--foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
