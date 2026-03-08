'use client';
import { useEffect, useState } from 'react';

type NumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  step?: number | string;
  allowDecimal?: boolean;
};

export default function NumericInput({ value, onChange, className, step, allowDecimal = false }: NumericInputProps) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (nextValue: string) => {
    const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(nextValue)) {
      return;
    }

    setDraftValue(nextValue);

    if (nextValue === '' || (allowDecimal && nextValue.endsWith('.'))) {
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (draftValue === '' || draftValue === '.') {
      onChange(0);
      setDraftValue('0');
      return;
    }

    const parsed = Number(draftValue);
    if (Number.isNaN(parsed)) {
      onChange(0);
      setDraftValue('0');
      return;
    }

    onChange(parsed);
    setDraftValue(String(parsed));
  };

  return (
    <input
      type="number"
      step={step}
      className={className}
      value={draftValue}
      onFocus={() => setIsFocused(true)}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
    />
  );
}
