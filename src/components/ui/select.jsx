"use client"

import { useState, createContext, useContext } from "react"

const SelectContext = createContext()

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || value || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    setIsOpen(false)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <SelectContext.Provider
      value={{
        selectedValue,
        setSelectedValue: handleValueChange,
        isOpen,
        setIsOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ children, className = "", ...props }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

const SelectValue = ({ placeholder, className = "", ...props }) => {
  const { selectedValue } = useContext(SelectContext)

  return (
    <span className={className} {...props}>
      {selectedValue || placeholder}
    </span>
  )
}

const SelectContent = ({ children, className = "", ...props }) => {
  const { isOpen } = useContext(SelectContext)

  if (!isOpen) return null

  return (
    <div
      className={`absolute top-full left-0 z-50 w-full mt-1 rounded-md border border-gray-200 bg-white shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

const SelectItem = ({ children, value, className = "", ...props }) => {
  const { setSelectedValue } = useContext(SelectContext)

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      onClick={() => setSelectedValue(value)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
