export const placeholderReplacer = async (stringValue, page) => {
    const location = await page.evaluate(() => location);

    return stringValue
        .replace('{{location.host}}', location.host)
        .replace('{{location.hostname}}', location.hostname)
        .replace('{{location.href}}', location.href)
        .replace('{{location.origin}}', location.origin)
        .replace('{{location.pathname}}', location.pathname)
        .replace('{{location.search}}', location.search);
};
