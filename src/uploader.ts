// abstract: Playwright browser lifecycle and save-file upload automation for the interactive map.
// out_of_scope: Save discovery, filesystem watching, and third-party API reverse engineering.

import { chromium, type Browser, type Page } from "playwright";

const MAP_URL = "https://satisfactory-calculator.com/zh/interactive-map";
const UPLOAD_PROMPT = /点击|拖拽|Click|Drag|upload|save/i;

export class MapUploader {
  private browser: Browser | undefined;
  private page: Page | undefined;

  async upload(savePath: string): Promise<void> {
    const page = await this.getPage();
    await page.goto(MAP_URL, { waitUntil: "domcontentloaded" });

    if (await this.tryFileInputUpload(page, savePath)) {
      console.log(`Uploaded save: ${savePath}`);
      return;
    }

    if (await this.tryFileChooserUpload(page, savePath)) {
      console.log(`Uploaded save: ${savePath}`);
      return;
    }

    throw new Error("Could not find the map save upload control; the page structure may have changed.");
  }

  async close(): Promise<void> {
    await this.browser?.close();
    this.page = undefined;
    this.browser = undefined;
  }

  private async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false });
    }

    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser.newPage();
    }

    return this.page;
  }

  private async tryFileInputUpload(page: Page, savePath: string): Promise<boolean> {
    const input = page.locator('input[type="file"]').first();

    try {
      await input.setInputFiles(savePath, { timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  private async tryFileChooserUpload(page: Page, savePath: string): Promise<boolean> {
    const uploadTarget = page.getByText(UPLOAD_PROMPT).first();

    try {
      const chooserPromise = page.waitForEvent("filechooser", { timeout: 10_000 });
      await uploadTarget.click({ timeout: 10_000 });
      const chooser = await chooserPromise;
      await chooser.setFiles(savePath);
      return true;
    } catch {
      return false;
    }
  }
}
