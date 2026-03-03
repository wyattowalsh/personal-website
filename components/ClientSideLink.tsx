import React from 'react'

interface ClientSideLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  isExternal?: boolean
}

const ClientSideLink: React.FC<ClientSideLinkProps> = ({
  href,
  isExternal,
  children,
  className = "transition-colors duration-300",
  ...props
}) => {
  const linkStyle = { color: 'hsl(var(--primary))' }

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
