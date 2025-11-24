/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Maximum number of retries (default: 3)
 * @param delay Initial delay in ms (default: 1000)
 * @param backoffFactor Factor to multiply delay by after each failure (default: 2)
 */
export async function retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
    backoffFactor = 2
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));

        return retry(fn, retries - 1, delay * backoffFactor, backoffFactor);
    }
}
