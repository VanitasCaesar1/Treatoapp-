'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

const navOrder = ['/dashboard', '/search', '/appointments', '/medical-records', '/profile'];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathnameRef = useRef(pathname);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (pathname === prevPathnameRef.current) return;

    // Update content immediately but trigger re-render with new key
    setDisplayChildren(children);
    setKey(prev => prev + 1);
    prevPathnameRef.current = pathname;
  }, [pathname, children]);

  return (
    <div key={key} className="animate-slideIn">
      {displayChildren}
    </div>
  );
}
