const puppeteer = require('puppeteer');
const cron = require('node-cron');
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

const GOOGLE_DOC_URL = 'https://docs.google.com/document/d/1ujYf9MIOEeH3UpaHKZmXm_9-W6XpSQ5LAcLUv0ue32k/preview';
const PDF_PATH = path.join(__dirname, 'resume.pdf');
const git = simpleGit();

async function downloadResume() {
    try {
        console.log('Starting resume download process...');
        
        const browser = await puppeteer.launch({
            headless: 'new'
        });
        
        const page = await browser.newPage();
        
        await page.goto(GOOGLE_DOC_URL, {
            waitUntil: 'networkidle0'
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await fs.writeFile(PDF_PATH, pdf);
        console.log('PDF downloaded successfully');

        await browser.close();

        const status = await git.status();
        
        if (status.modified.includes('resume.pdf') || status.not_added.includes('resume.pdf')) {
            await git.add('resume.pdf');
            await git.commit(`feat: update resume from cron job at ${new Date().toISOString()}`);
            await git.push();
            console.log('Changes committed and pushed to repository');
        } else {
            console.log('No changes detected in resume PDF');
        }

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled resume update...');
    downloadResume();
});

downloadResume();

console.log('Resume update service started...');
