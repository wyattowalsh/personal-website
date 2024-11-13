// ...existing imports...
import Link from 'next/link';
// ...existing code...

const Header = () => {
  let headerClass = 'flex items-center w-full bg-primary text-white font-display justify-between py-10';
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50';
  }

  return (
    <header className={headerClass}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" aria-label="Home">
          <Logo className="h-8 w-8" />
        </Link>
        <nav className="flex space-x-4">
          {headerNavLinks.map((link) => (
            <Link key={link.title} href={link.href} className="hover:underline">
              {link.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <SearchButton />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header;
