"""CI validates the packaged shell and local routes with every remote request blocked."""
import asyncio, json
from pathlib import Path
from urllib.parse import urlparse, unquote
from playwright.async_api import async_playwright

ROOT = Path("dist/client").resolve()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 360, "height": 646})
        remote = []
        async def local_only(route):
            url = urlparse(route.request.url)
            if url.netloc != "localhost":
                remote.append(url.netloc)
                return await route.abort()
            path = (ROOT / unquote(url.path).lstrip("/")).resolve()
            if not path.is_relative_to(ROOT):
                return await route.abort()
            if not path.is_file():
                path = ROOT / "index.html"
            await route.fulfill(path=str(path))
        await context.route("**/*", local_only)
        await context.set_offline(True)
        page = await context.new_page()
        await page.goto("https://localhost/settings", wait_until="domcontentloaded")
        await page.get_by_role("heading", name="الإعدادات", exact=True).wait_for()
        if await page.get_by_role("button", name="لاحقاً", exact=True).count():
            await page.get_by_role("button", name="لاحقاً", exact=True).click(force=True)
        await page.get_by_role("switch", name="تفعيل الذاكرة").click(force=True)
        await page.reload()
        await page.get_by_role("heading", name="الإعدادات", exact=True).wait_for()
        assert await page.get_by_role("switch", name="تفعيل الذاكرة").get_attribute("aria-checked") == "false"
        catalog = json.loads(Path("src/lib/native-catalog.json").read_text())
        item = next(row for row in catalog if row.get("slug") and row.get("image_url"))
        category = item["categories"][0]
        await page.goto(f"https://localhost/{category}/{item['slug']}", wait_until="domcontentloaded")
        await page.get_by_role("heading", name=item["title"], exact=True).wait_for()
        assert await page.locator(f'img[src="{item["image_url"]}"]').first.evaluate("img => img.complete && img.naturalWidth > 0")
        for path in ["/apps", "/games", "/websites", "/ai", "/about", "/contact", "/privacy", "/terms", "/sitemap", "/chat"]:
            await page.goto("https://localhost" + path, wait_until="domcontentloaded")
            await page.locator("h1,h2,[data-slot=sheet-title]").first.wait_for()
            assert "This page didn't load" not in await page.locator("body").inner_text()
        print("Packaged routes, first-launch item images, and persisted settings verified with internet blocked.")
        await browser.close()

asyncio.run(main())