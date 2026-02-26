import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username dan Password wajib diisi' }, { status: 400 });
        }

        let browser;

        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            // Production / Vercel
            const puppeteer = await import('puppeteer-core');
            const chromium = await import('@sparticuz/chromium');

            browser = await puppeteer.launch({
                args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: chromium.default.defaultViewport,
                executablePath: await chromium.default.executablePath(),
                headless: chromium.default.headless as any,
            });
        } else {
            // Local dev
            const puppeteer = await import('puppeteer');
            browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

        const page = await browser.newPage();

        // 1. Login ke Simantap
        await page.goto('https://simantap.unper.ac.id/login', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Tunggu form login muncul (karena SPA)
        try {
            await page.waitForSelector('input[name="identity"]', { timeout: 15000 });
        } catch (e) {
            console.log("Timeout waiting for identity input, trying generic...");
            await page.waitForSelector('input', { timeout: 5000 }).catch(() => { });
        }

        // Cari selector username yang paling mungkin
        const usernameSelector = await (page as any).evaluate(() => {
            const el = document.querySelector('input[name="identity"]') ||
                document.querySelector('input[name="username"]') ||
                document.querySelector('input[type="text"]') ||
                document.querySelector('input[placeholder*="Username"]') ||
                document.querySelector('input[placeholder*="NIM"]');
            return el ? el.getAttribute('name') || 'input[type="text"]' : null;
        });

        const passwordSelector = await (page as any).evaluate(() => {
            const el = document.querySelector('input[name="password"]') ||
                document.querySelector('input[type="password"]');
            return el ? el.getAttribute('name') || 'input[type="password"]' : null;
        });

        if (!usernameSelector || !passwordSelector) {
            throw new Error("Tidak dapat menemukan field login (Username/Password). Silakan coba lagi.");
        }

        const uSel = usernameSelector.includes('[') ? usernameSelector : `input[name="${usernameSelector}"]`;
        const pSel = passwordSelector.includes('[') ? passwordSelector : `input[name="${passwordSelector}"]`;

        await page.type(uSel, username);
        await page.type(pSel, password);

        // Find and click submit button
        const submitSelector = 'button[type="submit"], button.btn-primary, button.btn-success, input[type="submit"]';

        await Promise.all([
            page.click(submitSelector),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log("Navigation timeout")),
        ]);

        // 2. Navigasi ke Halaman KRS
        await page.goto('https://simantap.unper.ac.id/akademik/krs', { waitUntil: 'networkidle2' });

        // 3. Scraping Data dari Tabel KRS
        const scheduleData = await (page as any).evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            const schedule: any = {};
            const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

            rows.forEach(row => {
                const columns = Array.from(row.querySelectorAll('td'));
                if (columns.length < 3) return;

                // Typical structure in Simantap KRS table:
                // Col 0: No
                // Col 1: Kode MK - Mata Kuliah
                // Col 2: Kelas (A, B, C, etc. or Ganjil/Genap)
                // Col 3: SKS (maybe)
                // Col 4: Jadwal (Lecturer \n Day, Time @ Room)

                // Let's adjust based on likely column positions
                const courseText = columns[1]?.innerText?.trim() || "";
                const className = columns[2]?.innerText?.trim() || "";
                const lecturerAndSchedule = columns[columns.length - 1]?.innerText?.trim() || "";

                // Cleaning course name (often has code prefix)
                const courseName = courseText.split('-').slice(1).join('-').trim() || courseText;

                const lines = lecturerAndSchedule.split('\n').map(l => l.trim());
                const lecturer = lines[0] || "";
                const scheduleLine = lines.find(l => days.some(d => l.includes(d))) || "";

                if (scheduleLine) {
                    // Format: "Senin, 07:00-09:00 @ GM-3G"
                    const [dayPart, rest] = scheduleLine.split(',');
                    const day = dayPart.trim();
                    const [timePart, roomPart] = (rest || "").split('@');
                    const [start, end] = (timePart || "").split('-').map(t => t.trim());
                    const room = (roomPart || "").trim();

                    if (!schedule[day]) schedule[day] = [];
                    schedule[day].push({
                        id: Math.random().toString(36).substr(2, 9),
                        course: courseName,
                        lecturer: lecturer,
                        day: day,
                        startTime: start,
                        endTime: end,
                        room: room,
                        className: className
                    });
                }
            });
            return schedule;
        });

        await browser.close();

        return NextResponse.json({ schedule: scheduleData });
    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Gagal sinkronisasi: ' + error.message }, { status: 500 });
    }
}
