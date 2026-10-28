import { test, expect } from '@playwright/test';

// The WAI-ARIA accordion pattern: each FAQ question's button sits inside a
// heading, and aria-controls names the answer it opens.

test('each FAQ question is a heading whose button controls its answer', async ({
    page,
}) => {
    const faq = page.locator('#faq');
    // The header marks FAQ once the page has hydrated, so clicks are handled.
    await page.goto('/#faq');
    await expect(
        page
            .getByRole('navigation', { name: 'Main' })
            .getByRole('button', { name: 'FAQ', exact: true })
    ).toHaveAttribute('aria-current', 'location');

    const count = await faq.locator('button[aria-expanded]').count();
    expect(count).toBeGreaterThan(0);
    const questions = faq.getByRole('heading', { level: 3 });
    expect(await questions.count()).toBe(count);

    const ids = new Set<string>();
    for (let i = 0; i < count; i++) {
        const heading = questions.nth(i);
        const button = heading.getByRole('button');
        // The heading holds its question and nothing else.
        await expect(heading).toHaveText((await button.textContent()) ?? '');
        const id = await button.getAttribute('aria-controls');
        expect(id, `question ${i + 1}`).toBeTruthy();
        ids.add(String(id));
        // An attribute selector, since a useId value may not be a CSS identifier.
        const answer = faq.locator(`[id="${id}"]`);
        await expect(answer).toBeHidden();
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(answer).toBeVisible();
    }
    expect(ids.size).toBe(count);
});
