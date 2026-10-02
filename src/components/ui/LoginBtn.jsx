import React from 'react'

export default function LoginBtn({ className = '' }) {
  return (
    <div>
      <button
        className={`
          cursor-pointer
          bg-black dark:bg-white
          text-white dark:text-black
          px-5 py-2
          rounded-full
          border border-black dark:border-white
          
          transition-all duration-300 ease-out
          
          hover:bg-background
          hover:text-foreground
          hover:scale-105
          hover:shadow-lg
          
          active:scale-95
          ${className}
        `}
      >
        Login
      </button>
    </div>
  )
}