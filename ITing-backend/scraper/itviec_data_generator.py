"""
ITviec-Style Data Generator for ITing Job Portal
=================================================
Tạo dữ liệu việc làm giống phong cách ITviec để test hệ thống

Sử dụng: python itviec_data_generator.py
"""

import random
from datetime import datetime, timedelta

# ==========================================
# DATA TEMPLATES (Giống ITviec)
# ==========================================

COMPANIES = [
    {"name": "FPT Software", "industry": "Outsourcing", "size": "5000+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOHcwRWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--5d04a56045047b6a22b3e85a39259f3b1ca18435/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJc0FXa0NMQUU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--79eae2eb0dbf6205f2ad3670e242091f2c4838fc/Logo%20FPT%20Software.png"},
    {"name": "VNG Corporation", "industry": "Product", "size": "3000+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/vng-logo.png"},
    {"name": "Shopee Vietnam", "industry": "E-commerce", "size": "5000+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/shopee-logo.png"},
    {"name": "Tiki Corporation", "industry": "E-commerce", "size": "2000+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/tiki-logo.png"},
    {"name": "MoMo", "industry": "Fintech", "size": "1500+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/momo-logo.png"},
    {"name": "Grab Vietnam", "industry": "Technology", "size": "2000+", "logo": "https://itviec.com/rails/active_storage/representations/proxy/grab-logo.png"},
    {"name": "NashTech", "industry": "Outsourcing", "size": "2000+", "logo": "https://example.com/nashtech-logo.png"},
    {"name": "KMS Technology", "industry": "Outsourcing", "size": "1500+", "logo": "https://example.com/kms-logo.png"},
    {"name": "Axon Active Vietnam", "industry": "Outsourcing", "size": "500+", "logo": "https://example.com/axon-logo.png"},
    {"name": "TMA Solutions", "industry": "Outsourcing", "size": "3000+", "logo": "https://example.com/tma-logo.png"},
    {"name": "CMC Global", "industry": "Outsourcing", "size": "2000+", "logo": "https://example.com/cmc-logo.png"},
    {"name": "Ến Việt Tech", "industry": "Product", "size": "100+", "logo": "https://example.com/evtech-logo.png"},
    {"name": "ZaloPay", "industry": "Fintech", "size": "500+", "logo": "https://example.com/zalopay-logo.png"},
    {"name": "VinAI", "industry": "AI/ML", "size": "500+", "logo": "https://example.com/vinai-logo.png"},
    {"name": "BE Group", "industry": "Technology", "size": "1000+", "logo": "https://example.com/be-logo.png"},
]

JOB_TEMPLATES = [
    # Backend
    {"position": "Senior Java Developer", "tech": "Java, Spring Boot, Microservices, MySQL, Redis, Kafka", "type": "FULL_TIME", "level": "SENIOR", "salary": (30000000, 55000000)},
    {"position": "Java Developer", "tech": "Java, Spring Boot, REST API, MySQL, Git", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    {"position": "Junior Java Developer", "tech": "Java, Spring Boot, SQL", "type": "FULL_TIME", "level": "JUNIOR", "salary": (12000000, 20000000)},
    {"position": "Senior .NET Developer", "tech": ".NET Core, C#, SQL Server, Azure, Microservices", "type": "FULL_TIME", "level": "SENIOR", "salary": (28000000, 50000000)},
    {"position": ".NET Developer", "tech": ".NET, C#, SQL Server, Entity Framework", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 32000000)},
    {"position": "Senior Python Developer", "tech": "Python, Django, FastAPI, PostgreSQL, Redis", "type": "FULL_TIME", "level": "SENIOR", "salary": (30000000, 55000000)},
    {"position": "Python Developer", "tech": "Python, Django, Flask, MySQL", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    {"position": "Golang Developer", "tech": "Golang, gRPC, PostgreSQL, Redis, Docker", "type": "FULL_TIME", "level": "MIDDLE", "salary": (22000000, 45000000)},
    {"position": "Senior Golang Developer", "tech": "Golang, Microservices, Kubernetes, Kafka, gRPC", "type": "FULL_TIME", "level": "SENIOR", "salary": (35000000, 65000000)},
    {"position": "Node.js Developer", "tech": "Node.js, Express, TypeScript, MongoDB, Redis", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 38000000)},
    {"position": "Senior Node.js Developer", "tech": "Node.js, NestJS, TypeScript, PostgreSQL, AWS", "type": "FULL_TIME", "level": "SENIOR", "salary": (30000000, 55000000)},
    {"position": "PHP Developer", "tech": "PHP, Laravel, MySQL, Redis, Docker", "type": "FULL_TIME", "level": "MIDDLE", "salary": (15000000, 30000000)},
    {"position": "Senior PHP Developer", "tech": "PHP, Laravel, Symfony, MySQL, AWS", "type": "FULL_TIME", "level": "SENIOR", "salary": (25000000, 45000000)},
    
    # Frontend
    {"position": "Senior React Developer", "tech": "React, TypeScript, Redux, NextJS, GraphQL", "type": "FULL_TIME", "level": "SENIOR", "salary": (28000000, 50000000)},
    {"position": "React Developer", "tech": "React, JavaScript, Redux, REST API, CSS", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    {"position": "Junior React Developer", "tech": "React, JavaScript, HTML, CSS", "type": "FULL_TIME", "level": "JUNIOR", "salary": (12000000, 20000000)},
    {"position": "Vue.js Developer", "tech": "Vue.js, Vuex, TypeScript, Nuxt.js", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    {"position": "Senior Vue.js Developer", "tech": "Vue.js, Nuxt.js, TypeScript, GraphQL, AWS", "type": "FULL_TIME", "level": "SENIOR", "salary": (28000000, 48000000)},
    {"position": "Angular Developer", "tech": "Angular, TypeScript, RxJS, NgRx", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    {"position": "Frontend Developer", "tech": "JavaScript, React/Vue, HTML5, CSS3, REST API", "type": "FULL_TIME", "level": "MIDDLE", "salary": (16000000, 32000000)},
    
    # Full Stack
    {"position": "Full Stack Developer", "tech": "Node.js, React, MongoDB, AWS", "type": "FULL_TIME", "level": "MIDDLE", "salary": (20000000, 40000000)},
    {"position": "Senior Full Stack Developer", "tech": "Java/Node.js, React, PostgreSQL, AWS, Docker", "type": "FULL_TIME", "level": "SENIOR", "salary": (32000000, 60000000)},
    
    # Mobile
    {"position": "iOS Developer", "tech": "Swift, SwiftUI, Objective-C, Core Data", "type": "FULL_TIME", "level": "MIDDLE", "salary": (20000000, 40000000)},
    {"position": "Senior iOS Developer", "tech": "Swift, SwiftUI, RxSwift, CI/CD", "type": "FULL_TIME", "level": "SENIOR", "salary": (30000000, 55000000)},
    {"position": "Android Developer", "tech": "Kotlin, Java, Android SDK, MVVM", "type": "FULL_TIME", "level": "MIDDLE", "salary": (20000000, 40000000)},
    {"position": "Senior Android Developer", "tech": "Kotlin, Jetpack Compose, Clean Architecture", "type": "FULL_TIME", "level": "SENIOR", "salary": (30000000, 55000000)},
    {"position": "React Native Developer", "tech": "React Native, TypeScript, Redux, Firebase", "type": "FULL_TIME", "level": "MIDDLE", "salary": (20000000, 42000000)},
    {"position": "Flutter Developer", "tech": "Flutter, Dart, Firebase, REST API", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 38000000)},
    
    # DevOps/Cloud
    {"position": "DevOps Engineer", "tech": "AWS, Docker, Kubernetes, Jenkins, Terraform", "type": "FULL_TIME", "level": "MIDDLE", "salary": (22000000, 45000000)},
    {"position": "Senior DevOps Engineer", "tech": "AWS/GCP, Kubernetes, Terraform, ArgoCD, Prometheus", "type": "FULL_TIME", "level": "SENIOR", "salary": (35000000, 70000000)},
    {"position": "Cloud Engineer", "tech": "AWS, Azure, GCP, Terraform, Docker", "type": "FULL_TIME", "level": "MIDDLE", "salary": (25000000, 50000000)},
    {"position": "Site Reliability Engineer", "tech": "Kubernetes, Prometheus, Grafana, AWS, Python", "type": "FULL_TIME", "level": "SENIOR", "salary": (40000000, 75000000)},
    
    # Data
    {"position": "Data Engineer", "tech": "Python, Spark, Airflow, SQL, AWS", "type": "FULL_TIME", "level": "MIDDLE", "salary": (22000000, 45000000)},
    {"position": "Senior Data Engineer", "tech": "Python, Spark, Kafka, Airflow, Data Warehouse", "type": "FULL_TIME", "level": "SENIOR", "salary": (35000000, 65000000)},
    {"position": "Data Scientist", "tech": "Python, Machine Learning, SQL, TensorFlow", "type": "FULL_TIME", "level": "MIDDLE", "salary": (25000000, 50000000)},
    {"position": "Senior Data Scientist", "tech": "Python, Deep Learning, NLP, Computer Vision", "type": "FULL_TIME", "level": "SENIOR", "salary": (40000000, 80000000)},
    {"position": "Data Analyst", "tech": "SQL, Python, Power BI, Tableau", "type": "FULL_TIME", "level": "MIDDLE", "salary": (15000000, 30000000)},
    {"position": "Business Intelligence Analyst", "tech": "SQL, Power BI, Tableau, Data Modeling", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    
    # AI/ML
    {"position": "Machine Learning Engineer", "tech": "Python, TensorFlow, PyTorch, MLOps", "type": "FULL_TIME", "level": "MIDDLE", "salary": (28000000, 55000000)},
    {"position": "Senior ML Engineer", "tech": "Python, Deep Learning, MLOps, Kubernetes", "type": "FULL_TIME", "level": "SENIOR", "salary": (45000000, 90000000)},
    {"position": "AI Engineer", "tech": "Python, NLP, Computer Vision, LLM", "type": "FULL_TIME", "level": "MIDDLE", "salary": (30000000, 60000000)},
    
    # QA
    {"position": "QA Engineer", "tech": "Selenium, Postman, SQL, Agile", "type": "FULL_TIME", "level": "MIDDLE", "salary": (15000000, 28000000)},
    {"position": "Senior QA Engineer", "tech": "Selenium, Appium, CI/CD, Performance Testing", "type": "FULL_TIME", "level": "SENIOR", "salary": (25000000, 45000000)},
    {"position": "QA Automation Engineer", "tech": "Selenium, Cypress, Java/Python, Jenkins", "type": "FULL_TIME", "level": "MIDDLE", "salary": (18000000, 35000000)},
    
    # Security
    {"position": "Security Engineer", "tech": "Penetration Testing, OWASP, Network Security", "type": "FULL_TIME", "level": "MIDDLE", "salary": (25000000, 50000000)},
    {"position": "Senior Security Engineer", "tech": "AppSec, DevSecOps, Cloud Security, SIEM", "type": "FULL_TIME", "level": "SENIOR", "salary": (40000000, 75000000)},
    
    # Other
    {"position": "Technical Lead", "tech": "Java/Node.js, System Design, Agile, AWS", "type": "FULL_TIME", "level": "LEAD", "salary": (45000000, 80000000)},
    {"position": "Solution Architect", "tech": "System Design, Cloud Architecture, Microservices", "type": "FULL_TIME", "level": "LEAD", "salary": (50000000, 100000000)},
    {"position": "Product Manager", "tech": "Agile, Jira, Data Analysis, UX", "type": "FULL_TIME", "level": "MIDDLE", "salary": (25000000, 50000000)},
    {"position": "Scrum Master", "tech": "Agile, Scrum, Jira, Confluence", "type": "FULL_TIME", "level": "MIDDLE", "salary": (20000000, 40000000)},
    
    # Internship
    {"position": "Java Intern", "tech": "Java, Spring Boot, SQL", "type": "INTERNSHIP", "level": "FRESHER", "salary": (5000000, 10000000)},
    {"position": "Frontend Intern", "tech": "React/Vue, JavaScript, HTML, CSS", "type": "INTERNSHIP", "level": "FRESHER", "salary": (4000000, 8000000)},
    {"position": "QA Intern", "tech": "Manual Testing, SQL, Agile", "type": "INTERNSHIP", "level": "FRESHER", "salary": (4000000, 7000000)},
    {"position": "Data Analyst Intern", "tech": "SQL, Python, Excel", "type": "INTERNSHIP", "level": "FRESHER", "salary": (5000000, 9000000)},
    
    # Remote/Part-time
    {"position": "Remote React Developer", "tech": "React, TypeScript, NextJS", "type": "REMOTE", "level": "MIDDLE", "salary": (20000000, 45000000)},
    {"position": "Remote Node.js Developer", "tech": "Node.js, TypeScript, AWS", "type": "REMOTE", "level": "MIDDLE", "salary": (22000000, 48000000)},
    {"position": "Part-time Python Developer", "tech": "Python, Django, PostgreSQL", "type": "PART_TIME", "level": "MIDDLE", "salary": (10000000, 18000000)},
]

LOCATIONS = [
    "Ho Chi Minh", "Ha Noi", "Da Nang", "Ho Chi Minh, Ha Noi", 
    "Ho Chi Minh, Remote", "Ha Noi, Remote", "Remote"
]

DESCRIPTIONS = [
    """We are looking for a talented {position} to join our team.

Responsibilities:
• Design and develop high-quality software solutions
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Mentor junior developers
• Contribute to architecture decisions

Why you'll love working here:
• Competitive salary and benefits
• Flexible working hours
• Professional development opportunities
• Modern tech stack
• Great team culture""",

    """Join our growing engineering team as a {position}!

What you'll do:
• Build and maintain scalable applications
• Write clean, maintainable code
• Work in an Agile environment
• Collaborate with product and design teams
• Continuously improve our development processes

Benefits:
• 13th month salary
• Premium healthcare
• Annual company trip
• Learning budget
• Work from home options""",

    """We're hiring a {position} to help us build amazing products.

Your responsibilities:
• Develop new features and improve existing ones
• Ensure code quality through testing
• Participate in sprint planning and retrospectives
• Document technical solutions
• Stay up-to-date with industry trends

What we offer:
• Attractive compensation package
• Stock options
• Unlimited PTO
• Latest equipment
• International exposure""",
]

def generate_description(position):
    template = random.choice(DESCRIPTIONS)
    return template.format(position=position)

def generate_requirements(job):
    level = job["level"]
    tech = job["tech"]
    
    if level == "FRESHER":
        years = "0-1"
        extra = "• Fresh graduates are welcome\n• Willing to learn and grow"
    elif level == "JUNIOR":
        years = "1-2"
        extra = "• Basic understanding of software development lifecycle"
    elif level == "MIDDLE":
        years = "2-4"
        extra = "• Strong problem-solving skills\n• Experience working in Agile teams"
    elif level == "SENIOR":
        years = "5+"
        extra = "• Leadership experience\n• System design skills\n• Mentoring ability"
    else:  # LEAD
        years = "7+"
        extra = "• Proven leadership\n• Architecture expertise\n• Strategic thinking"
    
    return f"""Requirements:
• {years} years of experience
• Proficient in: {tech}
• Good communication skills in English
• Team player with positive attitude
{extra}

Nice to have:
• Experience with cloud services
• Knowledge of CI/CD pipelines
• Contributions to open source projects"""

def generate_jobs(count=100, employer_id=11):
    """Generate job data"""
    jobs = []
    
    for i in range(count):
        template = random.choice(JOB_TEMPLATES)
        company = random.choice(COMPANIES)
        location = random.choice(LOCATIONS)
        due_date = (datetime.now() + timedelta(days=random.randint(15, 60))).strftime('%Y-%m-%d')
        
        job = {
            "employer_id": employer_id,
            "position": template["position"],
            "description": generate_description(template["position"]),
            "requirements": generate_requirements(template),
            "location": location,
            "tech_required": template["tech"],
            "job_type": template["type"],
            "experience_level": template["level"],
            "min_salary": template["salary"][0],
            "max_salary": template["salary"][1],
            "due_date": due_date,
            "company_name": company["name"],
            "company_industry": company["industry"],
            "company_size": company["size"],
        }
        jobs.append(job)
    
    return jobs

def export_to_sql(jobs, filename='generated_jobs.sql'):
    """Export jobs to SQL file"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("-- =============================================\n")
        f.write("-- GENERATED JOBS DATA (ITviec Style)\n")
        f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Total jobs: {len(jobs)}\n")
        f.write("-- =============================================\n\n")
        
        for job in jobs:
            def escape(s):
                if s is None:
                    return 'NULL'
                return "'" + str(s).replace("'", "''") + "'"
            
            sql = f"""INSERT INTO jobs (employer_id, position, description, requirements, location, tech_required, job_type, experience_level, status, max_accept, current_accepted, min_salary, max_salary, due_date, view_count, application_count, created_at) VALUES
({job['employer_id']}, {escape(job['position'])}, {escape(job['description'])}, {escape(job['requirements'])}, {escape(job['location'])}, {escape(job['tech_required'])}, '{job['job_type']}', '{job['experience_level']}', 'ACTIVE', 5, 0, {job['min_salary']}, {job['max_salary']}, '{job['due_date']}', {random.randint(50, 500)}, {random.randint(5, 50)}, NOW());

"""
            f.write(sql)
    
    print(f"[+] Exported {len(jobs)} jobs to {filename}")

def main():
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║       ITviec-Style Data Generator for ITing Portal       ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    # Generate 100 jobs
    print("[*] Generating 100 realistic IT jobs...")
    jobs = generate_jobs(count=100, employer_id=11)
    
    # Export to SQL
    export_to_sql(jobs, 'generated_jobs.sql')
    
    # Statistics
    print("\n" + "=" * 50)
    print("GENERATION COMPLETED!")
    print("=" * 50)
    
    # Count by type
    types = {}
    levels = {}
    for job in jobs:
        types[job['job_type']] = types.get(job['job_type'], 0) + 1
        levels[job['experience_level']] = levels.get(job['experience_level'], 0) + 1
    
    print("\nBy Job Type:")
    for t, c in sorted(types.items()):
        print(f"  {t}: {c}")
    
    print("\nBy Experience Level:")
    for l, c in sorted(levels.items()):
        print(f"  {l}: {c}")
    
    print(f"\n[*] Output file: generated_jobs.sql")
    print("[*] Copy the SQL content to your data.sql or run it directly")

if __name__ == "__main__":
    main()

