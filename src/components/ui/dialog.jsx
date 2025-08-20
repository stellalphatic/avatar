"use client"

import React, { useState, createContext, useContext, useEffect } from "react"
import { useTheme } from "../../contexts/ThemeContext"

const DialogContext = createContext()

const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false)

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    if (onOpenChange) onOpenChange(newOpen)
  }

  return <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>{children}</DialogContext.Provider>
}

const DialogTrigger = ({ children, asChild, ...props }) => {
  const { setIsOpen } = useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(true),
      ...props,
    })
  }

  return (
    <button onClick={() => setIsOpen(true)} {...props}>
      {children}
    </button>
  )
}

const DialogContent = ({ children, className = "", ...props }) => {
  const { isOpen, setIsOpen } = useContext(DialogContext)
  const { theme } = useTheme()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div
        className={`relative z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg duration-200 rounded-lg ${
          theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className = "", ...props }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ children, className = "", ...props }) => {
  const { theme } = useTheme()

  return (
    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} ${className}`} {...props}>
      {children}
    </p>
  )
}

const DialogFooter = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
