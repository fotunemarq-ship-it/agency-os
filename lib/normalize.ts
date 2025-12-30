export function normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    // Remove all non-digits
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length === 0) return null;
    // Take last 10 digits
    if (cleaned.length > 10) {
        return cleaned.slice(-10);
    }
    return cleaned;
}

export function normalizeEmail(email: string | null | undefined): string | null {
    if (!email) return null;
    return email.trim().toLowerCase();
}

export function extractDomain(url: string | null | undefined): string | null {
    if (!url) return null;
    let domain = url.trim().toLowerCase();
    // Remove protocol
    domain = domain.replace(/^https?:\/\//, "");
    // Remove www.
    domain = domain.replace(/^www\./, "");
    // Remove path
    domain = domain.split("/")[0];
    return domain || null;
}

export function normalizeName(name: string | null | undefined): string | null {
    if (!name) return null;
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}
