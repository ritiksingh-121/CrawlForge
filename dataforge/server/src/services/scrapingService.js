import { chromium } from 'playwright';
import ScrapedData from '../models/ScrapedData.js';
import Job from '../models/Job.js';
import Project from '../models/Project.js';
import { v4 as uuidv4 } from 'uuid';

// Force Playwright to find Chromium in node_modules (Render doesn't persist the default cache)
process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

class ScrapingService {
  constructor() {
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  _emit(jobId, event, data) {
    if (this.io) {
      this.io.to(`job:${jobId}`).emit(event, { ...data, timestamp: Date.now() });
    }
  }

  async runScrapingJob(project, job) {
    const batchId = uuidv4();
    let browser;
    const startTime = Date.now();

    try {
      if (!project.fields || project.fields.length === 0) {
        throw new Error('No fields configured for this project. Add at least one field with a CSS selector before scraping.');
      }

      const invalidFields = project.fields.filter(f => !f.selector || !f.name);
      if (invalidFields.length > 0) {
        throw new Error(
          `Invalid field configuration: ${invalidFields.map(f =>
            `"${f.name || '(unnamed)'}" ${!f.selector ? '(missing CSS selector)' : ''}`
          ).join(', ')}. Ensure every field has a name and a CSS selector.`
        );
      }

      console.log(`[Scraping] Starting job ${job.id} for project "${project.name}"`);
      console.log(`[Scraping] Target URL: ${project.targetUrl}`);
      console.log(`[Scraping] Configured fields:`, JSON.stringify(project.fields));

      this._emit(job.id, 'scraping:status', { status: 'launching', message: 'Launching browser...' });

      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      if (project.headers) {
        await page.setExtraHTTPHeaders(project.headers);
      }

      const allData = [];
      let currentPageNum = 1;
      const maxPages = project.pagination?.maxPages || 1;
      const nextSelector = project.nextPageSelector || '.next a, a:has-text("Next"), a:has-text("next"), a:has-text("›"), a:has-text("»"), .pagination .next a';
      const hasPagination = project.pagination?.enabled && maxPages > 1;

      this._emit(job.id, 'scraping:status', { status: 'navigating', message: `Navigating to ${project.targetUrl}...` });

      // Navigate to initial page
      await this._navigateWithRetry(page, project.targetUrl);

      // Validate selectors against the live page
      for (const field of project.fields) {
        const matchCount = await page.$$eval(field.selector, els => els.length);
        console.log(`[Scraping] Selector "${field.selector}" for "${field.name}": ${matchCount} match(es)`);
        this._emit(job.id, 'scraping:log', { message: `Selector "${field.selector}": ${matchCount} matches`, level: 'info' });
        if (matchCount === 0) {
          throw new Error(
            `Selector "${field.selector}" for field "${field.name}" matched 0 elements on ${project.targetUrl}. ` +
            `Verify the CSS selector is correct for the target page.`
          );
        }
      }

      do {
        this._emit(job.id, 'scraping:status', {
          status: 'scraping',
          message: `Scraping page ${currentPageNum}...`,
          page: currentPageNum,
          totalPages: maxPages,
          recordsSoFar: allData.length,
        });

        console.log(`[Scraping] Extracting records from page ${currentPageNum}...`);

        // Bulk extract ALL records from current page in ONE page.evaluate() call
        const pageRecords = await page.evaluate((fields) => {
          const columns = fields.map(f => {
            const els = document.querySelectorAll(f.selector);
            return Array.from(els).map(el => {
              const tag = el.tagName.toLowerCase();
              if (tag === 'img') return el.getAttribute('src') || '';
              if (tag === 'a') {
                const href = el.getAttribute('href') || '';
                const txt = el.textContent?.trim() || '';
                return txt || href;
              }
              if (f.attribute) return el.getAttribute(f.attribute) || '';
              return el.textContent?.trim() || '';
            });
          });

          if (columns.length === 0) return [];
          const rowCount = Math.max(...columns.map(c => c.length));
          const rows = [];
          for (let i = 0; i < rowCount; i++) {
            const row = {};
            fields.forEach((f, j) => {
              row[f.name] = columns[j][i] ?? '';
            });
            if (Object.values(row).some(v => v)) {
              rows.push(row);
            }
          }
          return rows;
        }, project.fields);

        console.log(`[Scraping] Page ${currentPageNum}: extracted ${pageRecords.length} record(s)`);
        console.log(`[Scraping] Sample:`, JSON.stringify(pageRecords.slice(0, 2)));

        this._emit(job.id, 'scraping:progress', {
          page: currentPageNum,
          totalPages: maxPages,
          pageRecords: pageRecords.length,
          recordsSoFar: allData.length + pageRecords.length,
          progress: hasPagination ? Math.round((currentPageNum / maxPages) * 100) : 100,
          currentUrl: page.url(),
        });

        allData.push(...pageRecords);

        // Update job progress
        job.progress = hasPagination ? Math.round((currentPageNum / maxPages) * 100) : 100;
        job.pagesScraped = currentPageNum;
        job.totalPages = maxPages;
        await job.save();

        // Check for next page if pagination is enabled
        if (hasPagination && currentPageNum < maxPages) {
          this._emit(job.id, 'scraping:status', {
            status: 'navigating',
            message: `Navigating to page ${currentPageNum + 1}...`,
            page: currentPageNum + 1,
            totalPages: maxPages,
          });

          const hasNext = await this._goToNextPage(page, nextSelector);
          if (!hasNext) {
            console.log(`[Scraping] No next page found. Stopping at page ${currentPageNum}.`);
            this._emit(job.id, 'scraping:log', { message: `No more pages found after page ${currentPageNum}`, level: 'info' });
            break;
          }
          currentPageNum++;
        } else {
          break;
        }
      } while (currentPageNum <= maxPages);

      if (allData.length === 0) {
        throw new Error(
          `No data could be extracted. Selectors used: ${project.fields.map(f => `"${f.selector}"`).join(', ')}. ` +
          `Verify these selectors match elements on the target page.`
        );
      }

      // Save all records to database
      const BATCH_SIZE = 500;
      for (let i = 0; i < allData.length; i += BATCH_SIZE) {
        const batch = allData.slice(i, i + BATCH_SIZE).map(row => ({
          projectId: project.id,
          data: row,
          batchId,
          pageUrl: project.targetUrl,
        }));
        await ScrapedData.bulkCreate(batch);
        console.log(`[Scraping] Saved batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(allData.length / BATCH_SIZE)} (${batch.length} records)`);
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Scraping] Job ${job.id} completed: ${allData.length} records in ${duration}s`);
      console.log(`[Scraping] Sample saved data:`, JSON.stringify(allData.slice(0, 2), null, 2));

      this._emit(job.id, 'scraping:complete', {
        records: allData.length,
        pagesScraped: currentPageNum,
        duration,
        batchId,
      });

      project.totalRows = await ScrapedData.count({ where: { projectId: project.id } });
      project.status = 'completed';
      project.lastRunAt = new Date();
      await project.save();

      job.status = 'completed';
      job.progress = 100;
      job.pagesScraped = currentPageNum;
      job.totalPages = maxPages;
      job.completedAt = new Date();
      job.metadata = { ...(job.metadata || {}), recordsScraped: allData.length, duration };
      await job.save();

      await browser.close();
      return { success: true, rowsScraped: allData.length, pagesScraped: currentPageNum };
    } catch (error) {
      if (browser) await browser.close().catch(() => {});

      const duration = Math.round((Date.now() - startTime) / 1000);
      const isCaptcha = error.message?.toLowerCase().includes('captcha') || error.message?.toLowerCase().includes('recaptcha');
      const isTimeout = error.message?.toLowerCase().includes('timeout') || error.message?.toLowerCase().includes('network');
      const isConfigError =
        error.message.includes('No fields configured') ||
        error.message.includes('Invalid field configuration') ||
        error.message.includes('matched 0 elements') ||
        error.message.includes('No data could be extracted');

      job.status = 'failed';
      job.error = error.message;
      job.metadata = { ...(job.metadata || {}), duration, errorType: isCaptcha ? 'captcha' : isTimeout ? 'timeout' : 'unknown' };
      await job.save();

      project.status = 'failed';
      project.errorCount += 1;
      await project.save();

      this._emit(job.id, 'scraping:error', {
        error: error.message,
        type: isCaptcha ? 'captcha' : isTimeout ? 'timeout' : 'config_error',
        duration,
      });

      if (!isConfigError && !isCaptcha && job.retryCount < job.maxRetries) {
        job.retryCount += 1;
        console.log(`[Scraping] Scheduling retry ${job.retryCount}/${job.maxRetries} for job ${job.id}: ${error.message}`);
        setTimeout(() => this.runScrapingJob(project, job), 10000);
      } else if (isConfigError) {
        console.log(`[Scraping] Not retrying job ${job.id} — permanent config error: ${error.message}`);
      } else if (isCaptcha) {
        console.log(`[Scraping] Not retrying job ${job.id} — CAPTCHA detected: ${error.message}`);
      }

      return { success: false, error: error.message };
    }
  }

  async _navigateWithRetry(page, url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`[Scraping] Page loaded: ${url}`);
        await page.waitForTimeout(1000);
        return;
      } catch (err) {
        if (attempt === retries) throw new Error(`Failed to load ${url} after ${retries} attempts: ${err.message}`);
        console.log(`[Scraping] Retry ${attempt}/${retries} for ${url}: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
  }

  async _goToNextPage(page, selector) {
    try {
      const nextBtn = await page.$(selector);
      if (!nextBtn) {
        console.log(`[Scraping] Next button not found with selector: "${selector}"`);
        return false;
      }

      const isDisabled = await nextBtn.evaluate(el => el.disabled || el.classList.contains('disabled') || el.getAttribute('aria-disabled') === 'true');
      if (isDisabled) {
        console.log(`[Scraping] Next button is disabled`);
        return false;
      }

      await nextBtn.click();
      await page.waitForTimeout(1500);
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch {
        console.log(`[Scraping] Network idle timeout on next page, continuing anyway`);
      }
      await page.waitForTimeout(500);
      return true;
    } catch (err) {
      console.log(`[Scraping] Failed to navigate to next page: ${err.message}`);
      return false;
    }
  }
}

export default new ScrapingService();
