export const SITE_NAME = "BookStore";

/**
 * Free-shipping threshold in paise (e.g. 49900 = ₹499).
 * Keep null until shipping rules are decided; the announcement bar then
 * shows neutral wording instead of an invented offer.
 */
export const FREE_SHIPPING_THRESHOLD_PAISE: number | null = null;

/** How many categories appear in the desktop navbar. */
export const NAV_CATEGORY_LIMIT = 5;

/** Maximum copies of one book per order. */
export const MAX_QUANTITY_PER_ORDER = 10;