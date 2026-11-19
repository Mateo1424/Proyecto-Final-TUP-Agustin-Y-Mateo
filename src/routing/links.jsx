import { Link as WouterLink, useLocation as useWouterLocation } from 'wouter';
export function Link({ to, href, children, ...props }) { return <WouterLink href={to ?? href} {...props}>{children}</WouterLink>; }
export function NavLink({ to, className, children, ...props }) {
  const [path] = useWouterLocation(); const active = path === to || path.startsWith(`${to}/`);
  return <Link to={to} className={typeof className === 'function' ? className({ isActive: active }) : className} aria-current={active ? 'page' : undefined} {...props}>{children}</Link>;
}
