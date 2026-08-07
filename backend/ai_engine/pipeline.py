import sys
import os
import json
import re
import math
from typing import Dict, List, Any

# PyMuPDF
try:
    import fitz
except ImportError:
    fitz = None

# python-docx
try:
    import docx
except ImportError:
    docx = None

# spaCy
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
except ImportError:
    nlp = None

# sentence-transformers
try:
    from sentence_transformers import SentenceTransformer, util
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    model = None

# Gemini API
try:
    from google import genai
    gemini_client = genai.Client() if os.environ.get("GEMINI_API_KEY") else None
except Exception:
    gemini_client = None


COMMON_SKILLS = [
    "python", "javascript", "typescript", "react", "node.js", "express", "mongodb",
    "sql", "postgresql", "mysql", "java", "c++", "c#", "html", "css", "tailwind",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd",
    "rest api", "graphql", "machine learning", "deep learning", "nlp", "pandas",
    "numpy", "scikit-learn", "tensorflow", "pytorch", "agile", "scrum", "jira",
    "figma", "redux", "next.js", "vue", "angular", "flask", "fastapi", "django"
]

ACTION_VERBS = [
    "built", "developed", "engineered", "designed", "architected", "implemented",
    "scaled", "optimized", "increased", "decreased", "spearheaded", "led",
    "refactored", "automated", "launched", "created", "integrated", "improved"
]

def extract_text_from_pdf(file_path: str) -> str:
    if not fitz:
        return ""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        sys.stderr.write(f"PDF extraction error: {e}\n")
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    if not docx:
        return ""
    text = ""
    try:
        doc = docx.Document(file_path)
        for p in doc.paragraphs:
            text += p.text + "\n"
    except Exception as e:
        sys.stderr.write(f"DOCX extraction error: {e}\n")
    return text.strip()

def parse_resume(text: str) -> Dict[str, Any]:
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Extract email and phone
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    phone_match = re.search(r'\(?\+?\d{1,3}\)?[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
    
    email = email_match.group(0) if email_match else ""
    phone = phone_match.group(0) if phone_match else ""
    
    # Simple section classification
    sections = {
        "header": {"email": email, "phone": phone, "name": lines[0] if lines else "Candidate"},
        "summary": "",
        "skills": [],
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": []
    }
    
    current_section = "summary"
    
    for line in lines:
        lower = line.lower()
        if any(kw in lower for kw in ["skill", "technologies", "tech stack", "expertise"]):
            current_section = "skills"
            continue
        elif any(kw in lower for kw in ["education", "academic", "university", "college", "degree"]):
            current_section = "education"
            continue
        elif any(kw in lower for kw in ["experience", "work history", "employment", "career history"]):
            current_section = "experience"
            continue
        elif any(kw in lower for kw in ["project", "personal projects", "portfolio"]):
            current_section = "projects"
            continue
        elif any(kw in lower for kw in ["certification", "certificates", "license"]):
            current_section = "certifications"
            continue
            
        if current_section == "summary":
            sections["summary"] += line + " "
        elif current_section in ["education", "experience", "projects", "certifications"]:
            sections[current_section].append(line)
            
    # Skill extraction via keyword matching and spaCy
    found_skills = set()
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.add(skill)
            
    sections["skills"] = sorted(list(found_skills))
    sections["summary"] = sections["summary"].strip()
    
    return sections

def normalize_jd(jd_text: str) -> Dict[str, Any]:
    """Uses Gemini API if available, else deterministic keyword extraction."""
    jd_lower = jd_text.lower()
    required_skills = [s for s in COMMON_SKILLS if re.search(r'\b' + re.escape(s) + r'\b', jd_lower)]
    
    is_vague = len(jd_text.split()) < 40 or len(required_skills) < 2

    if gemini_client:
        try:
            prompt = f"""
            Normalize the following Job Description into a structured JSON schema.
            If the description is vague, infer standard requirements for the role.

            Job Description:
            "{jd_text}"

            Return JSON ONLY with keys:
            - title: (string)
            - is_vague: (boolean)
            - normalized_description: (summary string)
            - required_skills: (array of strings)
            - preferred_skills: (array of strings)
            - responsibilities: (array of strings)
            """
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            sys.stderr.write(f"Gemini JD Normalization error: {e}\n")

    return {
        "title": "Target Role",
        "is_vague": is_vague,
        "normalized_description": jd_text[:200] + "..." if len(jd_text) > 200 else jd_text,
        "required_skills": required_skills if required_skills else ["javascript", "python", "git"],
        "preferred_skills": ["docker", "aws", "ci/cd"],
        "responsibilities": ["Develop scalable applications", "Collaborate with team members", "Maintain clean code base"]
    }

def compute_semantic_similarity(text1: str, text2: str) -> float:
    if not model or not text1.strip() or not text2.strip():
        # Fallback to Jaccard similarity if embedding model not loaded
        words1 = set(re.findall(r'\w+', text1.lower()))
        words2 = set(re.findall(r'\w+', text2.lower()))
        if not words1 or not words2:
            return 50.0
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return round((len(intersection) / len(union)) * 100, 1)

    try:
        emb1 = model.encode(text1, convert_to_tensor=True)
        emb2 = model.encode(text2, convert_to_tensor=True)
        sim = float(util.cos_sim(emb1, emb2)[0][0])
        return round(max(0.0, min(100.0, sim * 100)), 1)
    except Exception as e:
        sys.stderr.write(f"Embedding error: {e}\n")
        return 65.0

def compute_ats_score(parsed_resume: Dict[str, Any], normalized_jd: Dict[str, Any], raw_resume: str, raw_jd: str) -> Dict[str, Any]:
    resume_skills = set(parsed_resume.get("skills", []))
    req_skills = set(normalized_jd.get("required_skills", []))
    
    # 1. Skill Match Score (40%)
    if req_skills:
        matched_skills = resume_skills.intersection(req_skills)
        missing_skills = req_skills - resume_skills
        skill_score = (len(matched_skills) / len(req_skills)) * 100
    else:
        matched_skills = resume_skills
        missing_skills = set()
        skill_score = 70.0
        
    # 2. Semantic Similarity Score (30%)
    sem_similarity = compute_semantic_similarity(raw_resume, raw_jd)
    
    # 3. Section Completeness Score (15%)
    sections_present = 0
    total_sections = 5
    detected = []
    if parsed_resume.get("header", {}).get("email"):
        sections_present += 1
        detected.append("Header & Contact Info")
    if parsed_resume.get("summary"):
        sections_present += 1
        detected.append("Professional Summary")
    if parsed_resume.get("skills"):
        sections_present += 1
        detected.append("Technical Skills")
    if parsed_resume.get("experience"):
        sections_present += 1
        detected.append("Work Experience")
    if parsed_resume.get("education"):
        sections_present += 1
        detected.append("Education")
    if parsed_resume.get("projects"):
        detected.append("Projects")
        
    section_score = (sections_present / total_sections) * 100

    # 4. Action Verbs & Metrics Score (15%)
    words = raw_resume.lower().split()
    action_verb_count = sum(1 for w in words if w in ACTION_VERBS)
    has_metrics = len(re.findall(r'\b\d+%\b|\$\d+|\b\d+\s*users\b|\b\d+\s*x\b', raw_resume.lower()))
    impact_score = min(100.0, (action_verb_count * 15) + (30 if has_metrics else 0))
    
    # Weighted ATS Score
    overall_ats = round(
        (skill_score * 0.40) +
        (sem_similarity * 0.30) +
        (section_score * 0.15) +
        (impact_score * 0.15),
        1
    )
    
    # Shortlist Readiness
    if overall_ats >= 80:
        shortlist_readiness = "High (Interview Ready)"
    elif overall_ats >= 60:
        shortlist_readiness = "Moderate (Requires Optimization)"
    else:
        shortlist_readiness = "Low (Significant Skill Gaps)"

    # Categorize missing skills by importance
    missing_skills_list = []
    for skill in sorted(list(missing_skills)):
        importance = "High" if skill in ["python", "javascript", "react", "node.js", "sql", "aws"] else "Medium"
        missing_skills_list.append({
            "skill": skill,
            "importance": importance,
            "learning_link": f"https://www.coursera.org/courses?query={skill.replace(' ', '+')}"
        })
        
    return {
        "overall_ats": overall_ats,
        "skill_score": round(skill_score, 1),
        "semantic_similarity": sem_similarity,
        "section_score": round(section_score, 1),
        "impact_score": round(impact_score, 1),
        "shortlist_readiness": shortlist_readiness,
        "detected_sections": detected,
        "matched_skills": sorted(list(matched_skills)),
        "missing_skills": missing_skills_list
    }

def generate_ai_insights(parsed_resume: Dict[str, Any], normalized_jd: Dict[str, Any], ats_breakdown: Dict[str, Any]) -> Dict[str, Any]:
    """Generates rewritten resume bullets and recruiter feedback via Gemini or rule-based engine."""

    sample_bullets = parsed_resume.get("experience", []) + parsed_resume.get("projects", [])
    raw_bullets = sample_bullets[:3] if sample_bullets else ["Developed web applications using React and Node.js."]
    
    rewritten_bullets = []
    
    if gemini_client:
        try:
            prompt = f"""
            Analyze the candidate's resume content against the job description.
            1. Rewrite these resume bullet points using strong action verbs and quantified impact metrics:
            {json.dumps(raw_bullets)}
            
            2. Provide recruiter-style feedback and 3 actionable recommendations.

            Return JSON ONLY with keys:
            - rewritten_bullets: list of objects with keys "original", "improved", "impact_factor"
            - recruiter_feedback: string summary
            - recommendations: list of strings
            """
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            sys.stderr.write(f"Gemini Insights error: {e}\n")

    # Fallback deterministic rewrite engine
    for bullet in raw_bullets:
        rewritten_bullets.append({
            "original": bullet,
            "improved": f"Architected and optimized {bullet.lower().replace('developed', '').replace('built', '')}, enhancing system performance by 35% and streamlining workflow execution.",
            "impact_factor": "Added quantitative metrics (+35% performance) and active power verb ('Architected & Optimized')."
        })

    missing_names = [m["skill"] for m in ats_breakdown.get("missing_skills", [])]
    missing_str = ", ".join(missing_names) if missing_names else "none"

    return {
        "rewritten_bullets": rewritten_bullets,
        "recruiter_feedback": f"The candidate shows a solid background in core technologies, but missing key skills like {missing_str} reduces ATS ranking. Highlighting metrics in experience bullets will significantly boost match score.",
        "recommendations": [
            f"Add target keywords: {missing_str} into your skills section.",
            "Quantify achievements with percentage improvements, revenue impact, or user counts.",
            "Tailor project descriptions to align directly with the responsibilities in the job description."
        ]
    }

def classify_skill(skill_name: str) -> str:
    s = skill_name.lower().strip()
    interview_keywords = ["sql", "dsa", "algo", "data structure", "algorithm", "oop", "object oriented", "os", "operating system", "dbms", "database management", "cn", "computer network", "system design", "architecture"]
    tool_keywords = ["git", "github", "docker", "linux", "ci/cd", "github actions", "bash", "kubernetes", "jenkins", "webpack", "vite", "agile", "jira"]
    cloud_keywords = ["aws", "azure", "gcp", "cloud", "s3", "ec2", "lambda"]

    if any(k in s for k in interview_keywords):
        return "interview"
    if any(k in s for k in tool_keywords):
        return "tool"
    if any(k in s for k in cloud_keywords):
        return "cloud"
    return "framework"

def generate_senior_learning_roadmap(missing_skills: List[Dict[str, Any]], target_role: str = "Software Engineer", ats_score: float = 70.0, parsed_resume: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Generates senior engineering mentor level roadmap using Gemini or intelligent rule-based templates."""
    if not missing_skills:
        return [
            {
                "week": 1,
                "skill": "System Architecture & Mock Interviews",
                "category": "interview",
                "title": "Interview Readiness & System Architecture Polish",
                "why_it_matters": f"Your current ATS match is high. For {target_role} roles, final round success depends on clear technical communication and problem-solving clarity.",
                "recruiter_evaluation": "Recruiters and hiring managers evaluate your ability to explain complex technical trade-offs, edge cases, and time/space complexity under pressure.",
                "core_concepts": [
                    "High-Level System Architecture & Component Design",
                    "Time & Space Complexity Trade-off Explanations",
                    "Edge Case Handling & Input Validation Strategies",
                    "STAR Method for Behavioral & System Case Studies"
                ],
                "practical_exercises": [
                    "Conduct 2 peer mock interviews focusing on System Design & Live Coding.",
                    "Review recent interview experience reports for target companies.",
                    "Audit existing project READMEs to clearly outline architecture decisions."
                ],
                "interview_strategy": "Spend 45 minutes daily timing yourself solving medium-hard coding challenges while speaking your thought process aloud.",
                "estimated_effort": "3-5 days",
                "expected_impact": "Clears final-round technical bar and converts interviews into offers.",
                "tasks": [
                    "Conduct 2 peer mock interviews focusing on System Design & Live Coding.",
                    "Review time & space complexity trade-offs for core data structures.",
                    "Audit existing project READMEs to highlight architecture decisions."
                ]
            }
        ]

    # Try Gemini Client first for dynamic AI coaching
    if gemini_client:
        try:
            prompt = f"""
            You are a Senior Engineering Director and Technical Hiring Manager at a top tech company (Linear, Stripe, Vercel).
            Generate a personalized engineering learning roadmap for a candidate applying for the target role: "{target_role}".
            Current ATS Match Score: {ats_score}%.
            Missing Skills Detected: {json.dumps([m['skill'] for m in missing_skills])}

            STRICT MENTORSHIP RULES:
            1. Do NOT assume every missing skill requires building a new project.
            2. For INTERVIEW-FOCUSED skills (DSA, SQL, OOP, OS, DBMS, Computer Networks, System Design): Recommend interview preparation, practice patterns (LeetCode patterns, SQL indexing/joins, SOLID principles), and revision strategies. Do NOT recommend building projects.
            3. For DEVELOPMENT TOOLS (Git, Docker, Linux, CI/CD, GitHub Actions): Recommend practical exercises applied to their EXISTING projects (e.g., containerize existing API, write GitHub Actions CI workflow). Do NOT recommend creating a new project.
            4. For CLOUD TECHNOLOGIES (AWS, Azure, GCP): Recommend learning ONLY the services relevant to "{target_role}" (e.g. S3, Lambda, EC2 for backend; S3/CDN for frontend). Do NOT recommend building a cloud project unless the target role explicitly requires cloud engineering.
            5. For FRAMEWORKS (React, Node.js, Spring Boot, Express, Python): Recommend strengthening weak concepts, best practices, debugging, architecture, and refactoring their EXISTING project.

            For EACH missing skill, generate a structured roadmap object in a JSON array.
            JSON schema per item:
            - "week": (integer 1..N)
            - "skill": (string name)
            - "category": ("interview" | "tool" | "cloud" | "framework")
            - "title": (action-oriented title, e.g., "SQL Query Tuning & Schema Normalization")
            - "why_it_matters": (why this matters for the target role)
            - "recruiter_evaluation": (how recruiters screen & test this skill)
            - "core_concepts": (list of 3-4 specific technical concepts)
            - "practical_exercises": (list of 2-3 practical exercises or existing project refactoring tasks)
            - "interview_strategy": (targeted interview revision strategy & question pattern)
            - "estimated_effort": (e.g., "3-4 days", "1 week")
            - "expected_impact": (expected boost to ATS score & interview readiness)
            - "tasks": (list of strings summarizing key steps)

            Return JSON ONLY as an array of roadmap objects.
            """
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            result = json.loads(raw)
            if isinstance(result, list) and len(result) > 0:
                return result
        except Exception as e:
            sys.stderr.write(f"Gemini Senior Roadmap generation error: {e}\n")

    # Fallback Deterministic Mentor Engine
    roadmap = []
    week = 1

    for item in missing_skills:
        skill_name = item.get("skill", "Technology")
        cat = classify_skill(skill_name)

        if cat == "interview":
            title = f"{skill_name.upper()} Interview Patterns & Core Revision"
            why_it_matters = f"{skill_name.upper()} is a core screening requirement for {target_role} positions. Demonstrating mastery in technical interviews is mandatory for advancing to final rounds."
            recruiter_evaluation = f"Recruiters evaluate {skill_name.upper()} through automated online coding assessments (OA) and live whiteboard problem-solving rounds focusing on efficiency and correctness."
            concepts = [
                f"Core {skill_name.upper()} execution patterns and standard data structures",
                "Time and Space complexity optimization (Big-O analysis)",
                "Edge case handling, boundary condition testing, and null pointer guards",
                "Common interview problem variations and trade-off explanations"
            ]
            exercises = [
                f"Solve 12-15 curated medium-level interview problems on {skill_name.upper()}.",
                f"Practice writing clean, bug-free {skill_name.upper()} code without relying on IDE autocomplete.",
                f"Perform a timed 45-minute mock coding test focused on {skill_name.upper()} concepts."
            ]
            interview_strat = f"Focus on identifying pattern recognition (e.g., Two Pointers, Windowing, Indexing) for {skill_name.upper()} rather than memorizing individual solutions."
            effort = "4-6 days"
            impact = f"+15% ATS Match Score & clears technical OA bar for {target_role}."

        elif cat == "tool":
            title = f"Integrate {skill_name.title()} into Existing Project Workflow"
            why_it_matters = f"Proficiency in {skill_name.title()} signals production-readiness and modern DevOps hygiene to technical recruiters hiring for {target_role}."
            recruiter_evaluation = f"Recruiters inspect candidate GitHub repositories to check if tools like {skill_name.title()} are configured properly with clean commit history and automated pipeline badges."
            concepts = [
                f"{skill_name.title()} setup, configuration files, and environment variable management",
                f"Best practices for workflow automation and script execution with {skill_name.title()}",
                "Debugging build failures, log analysis, and local environment isolation",
                "Integration with version control and team deployment pipelines"
            ]
            exercises = [
                f"Add a production {skill_name.title()} configuration file directly to your existing primary project.",
                f"Test and verify that your application builds and runs cleanly using {skill_name.title()} locally.",
                f"Document your {skill_name.title()} workflow setup in your project's README."
            ]
            interview_strat = f"Be prepared to explain why you configured {skill_name.title()} in your existing project and how it improved your development speed and deployment reliability."
            effort = "2-3 days"
            impact = f"+10% ATS Match Score & demonstrates production developer maturity."

        elif cat == "cloud":
            title = f"{target_role.title()}-Focused {skill_name.upper()} Services & Architecture"
            why_it_matters = f"Understanding key {skill_name.upper()} services is critical for building scalable, cloud-native applications in modern {target_role} roles."
            recruiter_evaluation = f"Recruiters look for specific {skill_name.upper()} service keywords (e.g. S3, EC2, IAM) on your resume and test your understanding of cloud architecture trade-offs in system design interviews."
            concepts = [
                f"Essential {skill_name.upper()} services relevant to {target_role} (e.g., Object Storage, Compute, IAM)",
                "Security policies, API keys, and environment secret management in the cloud",
                "Basic cloud deployment concepts, domain mapping, and SSL termination",
                "Cost control, resource monitoring, and serverless vs provisioned compute"
            ]
            exercises = [
                f"Review official documentation and core architecture patterns for {skill_name.upper()}.",
                f"Configure access permissions and environment variables for cloud integration in your existing project.",
                f"Diagram a simple architecture showing how your app interacts with {skill_name.upper()} services."
            ]
            interview_strat = f"Focus on explaining when to use specific {skill_name.upper()} services vs self-hosted alternatives and how to secure cloud credentials."
            effort = "3-4 days"
            impact = f"+12% ATS Match Score & fulfills cloud infrastructure requirement for {target_role}."

        else: # framework
            title = f"Master {skill_name.title()} Architecture & Refactor Existing Application"
            why_it_matters = f"Deep expertise in {skill_name.title()} is a primary core requirement for {target_role} engineering positions."
            recruiter_evaluation = f"Recruiters evaluate {skill_name.title()} through technical code reviews, checking for clean code patterns, error handling, state management, and separation of concerns."
            concepts = [
                f"{skill_name.title()} advanced concepts, lifecycle, and component/module architecture",
                "State management, asynchronous data flow, and error boundary handling",
                "Performance optimization, memory leak prevention, and code splitting",
                "Unit testing, API integration patterns, and clean code refactoring"
            ]
            exercises = [
                f"Audit your existing project code written in {skill_name.title()} and refactor messy/duplicate functions.",
                f"Implement proper error handling, logging, and async state feedback in your {skill_name.title()} codebase.",
                f"Add automated unit or integration tests for core logic in {skill_name.title()}."
            ]
            interview_strat = f"Practice explaining how {skill_name.title()} works under the hood (e.g., virtual DOM, event loop, middleware chain) and how you optimized your existing application."
            effort = "4-5 days"
            impact = f"+15% ATS Match Score & proves production-level framework proficiency."

        tasks = [
            f"Master core {skill_name} concepts for {target_role}",
            exercises[0],
            interview_strat
        ]

        roadmap.append({
            "week": week,
            "skill": skill_name,
            "category": cat,
            "title": title,
            "why_it_matters": why_it_matters,
            "recruiter_evaluation": recruiter_evaluation,
            "core_concepts": concepts,
            "practical_exercises": exercises,
            "interview_strategy": interview_strat,
            "estimated_effort": effort,
            "expected_impact": impact,
            "tasks": tasks
        })
        week += 1

    return roadmap

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    if cmd == "--test":
        print(json.dumps({"status": "Python pipeline working", "spacy": nlp is not None, "transformers": model is not None, "fitz": fitz is not None}))
        sys.exit(0)
        
    if cmd == "parse_resume":
        file_path = sys.argv[2]
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            raw_text = extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            raw_text = extract_text_from_docx(file_path)
        else:
            raw_text = ""
            
        parsed = parse_resume(raw_text)
        print(json.dumps({"raw_text": raw_text, "parsed": parsed}))
        
    elif cmd == "normalize_jd":
        input_data = json.loads(sys.stdin.read())
        jd_text = input_data.get("jd_text", "")
        normalized = normalize_jd(jd_text)
        print(json.dumps(normalized))
        
    elif cmd == "run_analysis":
        input_data = json.loads(sys.stdin.read())
        parsed_resume = input_data.get("parsed_resume", {})
        normalized_jd = input_data.get("normalized_jd", {})
        raw_resume = input_data.get("raw_resume", "")
        raw_jd = input_data.get("raw_jd", "")
        
        ats_breakdown = compute_ats_score(parsed_resume, normalized_jd, raw_resume, raw_jd)
        insights = generate_ai_insights(parsed_resume, normalized_jd, ats_breakdown)
        roadmap = generate_senior_learning_roadmap(
            ats_breakdown["missing_skills"],
            target_role=normalized_jd.get("title", "Software Engineer"),
            ats_score=ats_breakdown["overall_ats"],
            parsed_resume=parsed_resume
        )
        result = {
            "ats_score": ats_breakdown["overall_ats"],
            "skill_score": ats_breakdown["skill_score"],
            "semantic_similarity": ats_breakdown["semantic_similarity"],
            "section_score": ats_breakdown["section_score"],
            "impact_score": ats_breakdown["impact_score"],
            "shortlist_readiness": ats_breakdown["shortlist_readiness"],
            "detected_sections": ats_breakdown["detected_sections"],
            "strong_skills": ats_breakdown["matched_skills"],
            "missing_skills": ats_breakdown["missing_skills"],
            "rewritten_bullets": insights["rewritten_bullets"],
            "recruiter_feedback": insights["recruiter_feedback"],
            "recommendations": insights["recommendations"],
            "roadmap": roadmap,
        }
        print(json.dumps(result))

if __name__ == "__main__":
    main()

