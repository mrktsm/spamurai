import dns.resolver
import re

def get_domain_from_email(email):
    """Extracts the domain from an email address."""
    return email.split('@')[1]

def check_spf(domain):
    """Checks the SPF record for a given domain."""
    try:
        # Query for the SPF record (TXT record)
        result = dns.resolver.resolve(domain, 'TXT')
        spf_records = [str(record) for record in result if 'v=spf1' in str(record).lower()]
        if spf_records:
            return True, spf_records
        else:
            return False, None
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        return False, None

def check_dkim(domain, selector):
    """Checks the DKIM record for a given domain and selector."""
    try:
        # Use the provided DKIM selector to form the DKIM domain
        dkim_domain = f"{selector}._domainkey.{domain}"
        print(f"Checking DKIM for domain: {dkim_domain}")
        result = dns.resolver.resolve(dkim_domain, 'TXT')

        if result:
            dkim_records = [str(record) for record in result]
            print(f"DKIM Records found for {dkim_domain}: {dkim_records}")
            return True, dkim_records
        else:
            print(f"No DKIM records found for {dkim_domain}")
            return False, None
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN) as e:
        print(f"Error resolving DKIM for {domain} with selector {selector}: {e}")
        return False, None

def check_email_authentication(email, dkim_selector):
    """Checks both SPF and DKIM records for a given email address."""
    domain = get_domain_from_email(email)

    # Check SPF
    spf_valid, spf_records = check_spf(domain)
    if spf_valid:
        print(f"SPF Records for {domain}: {spf_records}")
    else:
        print(f"No valid SPF record found for {domain}")

        # Only check DKIM if a selector is provided (typically for organizational emails)
    if dkim_selector:
        dkim_valid, dkim_records = check_dkim(domain, dkim_selector)
        if dkim_valid:
            print(f"DKIM Records for {domain}: {dkim_records}")
        else:
            print(f"No valid DKIM record found for {domain}")
    else:
        # For personal emails without DKIM, we'll consider DKIM check as "not applicable"
        print(f"No DKIM selector provided for {domain}, likely a personal email")
        dkim_valid = True  # Consider it valid since it's not applicable

    return spf_valid, dkim_valid
