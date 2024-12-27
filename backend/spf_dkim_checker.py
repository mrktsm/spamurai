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

def check_dkim(domain):
    """Checks the DKIM record for a given domain."""
    try:
        # DKIM records are typically prefixed with a selector (google._domainkey, etc.)
        # We'll use a common selector prefix, but you may want to make this more dynamic
        selector = 'google'  # This could be different depending on the domain
        dkim_domain = f"{selector}._domainkey.{domain}"
        result = dns.resolver.resolve(dkim_domain, 'TXT')
        if result:
            return True, [str(record) for record in result]
        else:
            return False, None
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        return False, None

def check_email_authentication(email):
    """Checks both SPF and DKIM records for a given email address."""
    domain = get_domain_from_email(email)

    # Check SPF
    spf_valid, spf_records = check_spf(domain)
    if spf_valid:
        print(f"SPF Records for {domain}: {spf_records}")
    else:
        print(f"No valid SPF record found for {domain}")

    # Check DKIM
    dkim_valid, dkim_records = check_dkim(domain)
    if dkim_valid:
        print(f"DKIM Records for {domain}: {dkim_records}")
    else:
        print(f"No valid DKIM record found for {domain}")

    # Return results
    return spf_valid, dkim_valid

# # Example usage
# email = 'user@legitdomain.com'
# spf_valid, dkim_valid = check_email_authentication(email)
# if spf_valid and dkim_valid:
#     print("The email domain is properly authenticated with SPF and DKIM.")
# else:
#     print("The email domain failed SPF or DKIM checks.")
