'use client'

import React from 'react'
import Link from 'next/link'

interface ClientSideLinkProps {
  href: string
  children: React.ReactNode
  isExternal?: boolean
  className?: string
  [key: string]: any
}

const ClientSideLink: React.FC<ClientSideLinkProps> = ({
  href,
  isExternal,
  children,
  className = "transition-colors duration-300",
  ...props
}) => {
  const linkStyle = { color: 'hsl(var(--primary))' }

  // Check if we're already inside an anchor tag
  const isNested = React.useCallback(() => {
    let parent = props.parentElement
    while (parent) {
      if (parent.tagName === 'A') return true
      parent = parent.parentElement
    }
    return false
  }, [props.parentElement])

  if (isNested()) {
    // If nested, just render content without link
    return <span className={className} style={linkStyle} {...props}>{children}</span>
  }

  return (
    <a
      href={href}
      className={className}
      style={linkStyle}
      {...props}
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer"
      })}
    >
      {children}
    </a>
  )
}

export default ClientSideLink
