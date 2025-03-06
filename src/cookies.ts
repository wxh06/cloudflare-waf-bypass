/** An RFC 6265 domain matching implementation */
export function matchDomain(s: string, domain: string) {
  // See 5.2.3
  if (domain.startsWith(".")) domain = domain.slice(1);
  domain = domain.toLowerCase();
  // See 5.1.3
  if (s === domain) return true;
  if (s.endsWith(domain) && s[s.length - domain.length - 1] === ".")
    return true;
  return false;
}
