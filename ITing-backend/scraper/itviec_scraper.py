"""
ITviec Job Scraper for ITing Job Portal
========================================
Cào dữ liệu việc làm từ ITviec.com và lưu vào database PostgreSQL

Sử dụng:
1. pip install -r requirements.txt
2. Copy .env.example thành .env và điền thông tin database
3. python itviec_scraper.py

Lưu ý: Script này chỉ dùng cho mục đích học tập và nghiên cứu.
"""

import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import execute_values
import time
import random
import re
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from fake_useragent import UserAgent

# Load environment variables
load_dotenv()

# ==========================================
# CONFIGURATION
# ==========================================
class Config:
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'iting_jobportal')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    # Scraper
    BASE_URL = "https://itviec.com"
    JOBS_URL = "https://itviec.com/it-jobs"
    SCRAPE_PAGES = int(os.getenv('SCRAPE_PAGES', 5))
    DELAY_MIN = 1
    DELAY_MAX = 3
    
    # Default employer_id for scraped jobs
    DEFAULT_EMPLOYER_ID = 11  # FPT Software (or create a "Scraped" company)

# ==========================================
# DATA MAPPING
# ==========================================
class DataMapper:
    """Map ITviec data to our database schema"""
    
    @staticmethod
    def map_job_type(itviec_type):
        """Map ITviec job type to our JobType enum"""
        mapping = {
            'full-time': 'FULL_TIME',
            'part-time': 'PART_TIME',
            'contract': 'CONTRACT',
            'internship': 'INTERNSHIP',
            'remote': 'REMOTE',
            'freelance': 'CONTRACT',
        }
        if itviec_type:
            return mapping.get(itviec_type.lower().strip(), 'FULL_TIME')
        return 'FULL_TIME'
    
    @staticmethod
    def map_experience_level(itviec_exp):
        """Map ITviec experience to our ExperienceLevel enum"""
        if not itviec_exp:
            return 'MIDDLE'
        
        exp_lower = itviec_exp.lower()
        if 'fresher' in exp_lower or 'intern' in exp_lower or '0' in exp_lower:
            return 'FRESHER'
        elif 'junior' in exp_lower or '1' in exp_lower or '2' in exp_lower:
            return 'JUNIOR'
        elif 'senior' in exp_lower or '5' in exp_lower or '6' in exp_lower or '7' in exp_lower:
            return 'SENIOR'
        elif 'lead' in exp_lower or 'manager' in exp_lower:
            return 'LEAD'
        else:
            return 'MIDDLE'
    
    @staticmethod
    def parse_salary(salary_text):
        """Parse salary text to min/max values"""
        if not salary_text or 'negotiate' in salary_text.lower() or 'you' in salary_text.lower():
            return None, None
        
        # Extract numbers
        numbers = re.findall(r'[\d,]+', salary_text.replace(',', ''))
        numbers = [int(n) for n in numbers if n]
        
        if not numbers:
            return None, None
        
        # Convert USD to VND if needed (rough estimate)
        multiplier = 1
        if 'usd' in salary_text.lower() or '$' in salary_text:
            multiplier = 24000000  # Rough USD to VND
        elif 'k' in salary_text.lower():
            multiplier = 1000
        
        if len(numbers) == 1:
            val = numbers[0] * multiplier
            return val, val * 1.3  # Estimate range
        else:
            return numbers[0] * multiplier, numbers[1] * multiplier
    
    @staticmethod
    def clean_text(text):
        """Clean and normalize text"""
        if not text:
            return ''
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove non-printable characters
        text = ''.join(c for c in text if c.isprintable() or c in '\n\t')
        return text[:5000]  # Limit length
    
    @staticmethod
    def extract_skills(tags):
        """Extract skills from job tags"""
        if not tags:
            return ''
        skills = [tag.strip() for tag in tags if tag.strip()]
        return ', '.join(skills[:20])  # Limit to 20 skills

# ==========================================
# SCRAPER CLASS
# ==========================================
class ITviecScraper:
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.jobs = []
        self.companies = {}
        
    def get_headers(self):
        """Generate random headers to avoid blocking"""
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def delay(self):
        """Random delay between requests"""
        time.sleep(random.uniform(Config.DELAY_MIN, Config.DELAY_MAX))
    
    def fetch_page(self, url):
        """Fetch a page with retry logic"""
        for attempt in range(3):
            try:
                response = self.session.get(url, headers=self.get_headers(), timeout=30)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'lxml')
            except Exception as e:
                print(f"  [!] Attempt {attempt+1} failed: {e}")
                self.delay()
        return None
    
    def scrape_job_list(self, page=1):
        """Scrape job list page"""
        url = f"{Config.JOBS_URL}?page={page}"
        print(f"\n[*] Scraping page {page}: {url}")
        
        soup = self.fetch_page(url)
        if not soup:
            return []
        
        job_cards = soup.select('.job_content, .job-card, [data-job-id], .ipy-job-card')
        if not job_cards:
            # Try alternative selectors
            job_cards = soup.select('div[class*="job"]')
        
        print(f"  Found {len(job_cards)} job cards")
        
        jobs_data = []
        for card in job_cards:
            try:
                job = self.parse_job_card(card)
                if job and job.get('position'):
                    jobs_data.append(job)
            except Exception as e:
                print(f"  [!] Error parsing job card: {e}")
        
        return jobs_data
    
    def parse_job_card(self, card):
        """Parse a job card element"""
        job = {}
        
        # Job title/position
        title_elem = card.select_one('h3 a, .job-title a, .job__title a, a[class*="title"]')
        if title_elem:
            job['position'] = DataMapper.clean_text(title_elem.get_text())
            job['detail_url'] = title_elem.get('href', '')
            if job['detail_url'] and not job['detail_url'].startswith('http'):
                job['detail_url'] = Config.BASE_URL + job['detail_url']
        
        # Company name
        company_elem = card.select_one('.company-name, .job-company, .company a, span[class*="company"]')
        if company_elem:
            job['company_name'] = DataMapper.clean_text(company_elem.get_text())
        
        # Location
        location_elem = card.select_one('.city, .location, .job-city, [class*="location"]')
        if location_elem:
            job['location'] = DataMapper.clean_text(location_elem.get_text())
        
        # Salary
        salary_elem = card.select_one('.salary, .job-salary, [class*="salary"]')
        if salary_elem:
            salary_text = salary_elem.get_text()
            job['min_salary'], job['max_salary'] = DataMapper.parse_salary(salary_text)
        
        # Skills/Tags
        skill_elems = card.select('.tag, .skill-tag, .job-tag, span[class*="tag"]')
        if skill_elems:
            skills = [DataMapper.clean_text(s.get_text()) for s in skill_elems]
            job['tech_required'] = DataMapper.extract_skills(skills)
        
        # Logo
        logo_elem = card.select_one('img[class*="logo"], .company-logo img')
        if logo_elem:
            job['company_logo'] = logo_elem.get('src', '')
        
        return job
    
    def scrape_job_detail(self, job):
        """Scrape additional details from job detail page"""
        if not job.get('detail_url'):
            return job
        
        print(f"    Fetching details: {job.get('position', 'Unknown')[:50]}...")
        self.delay()
        
        soup = self.fetch_page(job['detail_url'])
        if not soup:
            return job
        
        # Description
        desc_elem = soup.select_one('.job-description, .description, [class*="description"]')
        if desc_elem:
            job['description'] = DataMapper.clean_text(desc_elem.get_text())
        
        # Requirements
        req_elem = soup.select_one('.job-requirements, .requirements, [class*="requirement"]')
        if req_elem:
            job['requirements'] = DataMapper.clean_text(req_elem.get_text())
        
        # Job type
        type_elem = soup.select_one('.job-type, [class*="type"]')
        if type_elem:
            job['job_type'] = DataMapper.map_job_type(type_elem.get_text())
        else:
            job['job_type'] = 'FULL_TIME'
        
        # Experience level
        exp_elem = soup.select_one('.experience, [class*="experience"]')
        if exp_elem:
            job['experience_level'] = DataMapper.map_experience_level(exp_elem.get_text())
        else:
            job['experience_level'] = 'MIDDLE'
        
        # Company details
        company_section = soup.select_one('.company-info, .employer-info, [class*="company"]')
        if company_section:
            # Company size
            size_elem = company_section.select_one('[class*="size"], [class*="employee"]')
            if size_elem:
                job['company_size'] = DataMapper.clean_text(size_elem.get_text())
            
            # Industry
            industry_elem = company_section.select_one('[class*="industry"], [class*="sector"]')
            if industry_elem:
                job['company_industry'] = DataMapper.clean_text(industry_elem.get_text())
            
            # Website
            website_elem = company_section.select_one('a[href*="http"]')
            if website_elem and 'itviec' not in website_elem.get('href', ''):
                job['company_website'] = website_elem.get('href', '')
            
            # Address
            address_elem = company_section.select_one('[class*="address"], [class*="location"]')
            if address_elem:
                job['company_address'] = DataMapper.clean_text(address_elem.get_text())
            
            # Description
            comp_desc_elem = company_section.select_one('[class*="description"], p')
            if comp_desc_elem:
                job['company_description'] = DataMapper.clean_text(comp_desc_elem.get_text())
        
        return job
    
    def scrape_all(self, pages=None):
        """Scrape all jobs from multiple pages"""
        pages = pages or Config.SCRAPE_PAGES
        
        print("=" * 60)
        print("ITviec Scraper - Starting...")
        print("=" * 60)
        
        all_jobs = []
        
        for page in range(1, pages + 1):
            jobs = self.scrape_job_list(page)
            
            # Fetch details for each job
            for i, job in enumerate(jobs):
                try:
                    job = self.scrape_job_detail(job)
                    all_jobs.append(job)
                    
                    # Store company info
                    if job.get('company_name'):
                        self.companies[job['company_name']] = {
                            'name': job.get('company_name'),
                            'logo_url': job.get('company_logo'),
                            'website': job.get('company_website'),
                            'address': job.get('company_address'),
                            'description': job.get('company_description'),
                            'industry': job.get('company_industry'),
                            'company_size': job.get('company_size'),
                        }
                except Exception as e:
                    print(f"  [!] Error processing job: {e}")
            
            self.delay()
        
        self.jobs = all_jobs
        print(f"\n[+] Total jobs scraped: {len(self.jobs)}")
        print(f"[+] Total companies found: {len(self.companies)}")
        
        return self.jobs

# ==========================================
# DATABASE OPERATIONS
# ==========================================
class DatabaseManager:
    def __init__(self):
        self.conn = None
        
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                database=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                sslmode='require'
            )
            print("[+] Connected to database successfully")
            return True
        except Exception as e:
            print(f"[!] Database connection failed: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("[+] Database connection closed")
    
    def insert_jobs(self, jobs, employer_id=None):
        """Insert scraped jobs into database"""
        employer_id = employer_id or Config.DEFAULT_EMPLOYER_ID
        
        if not self.conn:
            print("[!] No database connection")
            return 0
        
        cursor = self.conn.cursor()
        inserted = 0
        
        for job in jobs:
            try:
                # Calculate due date (30 days from now)
                due_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
                
                cursor.execute("""
                    INSERT INTO jobs (
                        employer_id, position, description, requirements, 
                        location, tech_required, job_type, experience_level,
                        status, max_accept, current_accepted, min_salary, max_salary,
                        due_date, view_count, application_count, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s,
                        'ACTIVE', 5, 0, %s, %s, %s, 0, 0, NOW()
                    )
                    ON CONFLICT DO NOTHING
                """, (
                    employer_id,
                    job.get('position', 'Unknown Position')[:255],
                    job.get('description', '')[:5000],
                    job.get('requirements', '')[:1000],
                    job.get('location', 'Ho Chi Minh')[:255],
                    job.get('tech_required', '')[:1000],
                    job.get('job_type', 'FULL_TIME'),
                    job.get('experience_level', 'MIDDLE'),
                    job.get('min_salary'),
                    job.get('max_salary'),
                    due_date
                ))
                inserted += 1
                
            except Exception as e:
                print(f"  [!] Error inserting job: {e}")
                self.conn.rollback()
        
        self.conn.commit()
        print(f"[+] Inserted {inserted} jobs into database")
        return inserted

# ==========================================
# EXPORT TO SQL FILE
# ==========================================
class SQLExporter:
    @staticmethod
    def export_jobs(jobs, filename='scraped_jobs.sql', employer_id=11):
        """Export scraped jobs to SQL file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("-- =============================================\n")
            f.write("-- SCRAPED JOBS FROM ITVIEC\n")
            f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Total jobs: {len(jobs)}\n")
            f.write("-- =============================================\n\n")
            
            for job in jobs:
                # Escape single quotes
                def escape(s):
                    if s is None:
                        return 'NULL'
                    return "'" + str(s).replace("'", "''")[:5000] + "'"
                
                due_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
                
                sql = f"""INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
({employer_id}, {escape(job.get('position', 'Unknown')[:255])}, {escape(job.get('description', '')[:5000])}, {escape(job.get('requirements', '')[:1000])}, {escape(job.get('location', 'Ho Chi Minh')[:255])}, {escape(job.get('tech_required', '')[:1000])}, '{job.get('job_type', 'FULL_TIME')}', '{job.get('experience_level', 'MIDDLE')}', 'ACTIVE', 5, 0, {job.get('min_salary') or 'NULL'}, {job.get('max_salary') or 'NULL'}, '{due_date}', 0, 0, NOW());

"""
                f.write(sql)
        
        print(f"[+] Exported {len(jobs)} jobs to {filename}")

    @staticmethod
    def export_companies(companies, filename='scraped_companies.sql'):
        """Export scraped companies to SQL file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("-- =============================================\n")
            f.write("-- SCRAPED COMPANIES FROM ITVIEC\n")
            f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Total companies: {len(companies)}\n")
            f.write("-- =============================================\n\n")
            
            f.write("-- Note: Companies need account_id to be inserted.\n")
            f.write("-- Create accounts first, then use their IDs.\n\n")
            
            for name, company in companies.items():
                f.write(f"-- Company: {name}\n")
                f.write(f"-- Logo: {company.get('logo_url', 'N/A')}\n")
                f.write(f"-- Website: {company.get('website', 'N/A')}\n")
                f.write(f"-- Industry: {company.get('industry', 'N/A')}\n")
                f.write(f"-- Size: {company.get('company_size', 'N/A')}\n")
                f.write("\n")
        
        print(f"[+] Exported {len(companies)} companies to {filename}")

# ==========================================
# MAIN
# ==========================================
def main():
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║           ITviec Scraper for ITing Job Portal            ║
    ║                                                          ║
    ║  Lưu ý: Chỉ sử dụng cho mục đích học tập và nghiên cứu  ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    # Initialize scraper
    scraper = ITviecScraper()
    
    # Scrape jobs
    jobs = scraper.scrape_all(pages=Config.SCRAPE_PAGES)
    
    if not jobs:
        print("[!] No jobs scraped. ITviec may have changed their structure or blocked the request.")
        return
    
    # Export to SQL files (always do this)
    SQLExporter.export_jobs(jobs, 'scraper/scraped_jobs.sql')
    SQLExporter.export_companies(scraper.companies, 'scraper/scraped_companies.sql')
    
    # Try to insert into database
    db = DatabaseManager()
    if db.connect():
        db.insert_jobs(jobs)
        db.close()
    else:
        print("\n[!] Could not connect to database.")
        print("[*] Jobs have been exported to SQL files instead.")
        print("[*] You can manually run the SQL files to import data.")
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETED!")
    print("=" * 60)
    print(f"  - Jobs scraped: {len(jobs)}")
    print(f"  - Companies found: {len(scraper.companies)}")
    print(f"  - SQL files: scraper/scraped_jobs.sql, scraper/scraped_companies.sql")
    print("=" * 60)

if __name__ == "__main__":
    main()

