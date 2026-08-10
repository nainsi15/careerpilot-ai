import sys
import os
import json
import re
import math
from typing import Dict, List, Any

sys.stdout.reconfigure(encoding='utf-8')
sys.stdin.reconfigure(encoding='utf-8')

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
    
    # 1. Technical Skills Score (replaces Skill Match Score)
    # If no JD, calculate based on having enough skills.
    if raw_jd and req_skills:
        matched_skills = resume_skills.intersection(req_skills)
        missing_skills = req_skills - resume_skills
        technical_skills = (len(matched_skills) / len(req_skills)) * 100
    else:
        matched_skills = resume_skills
        missing_skills = set()
        technical_skills = min(100.0, (len(resume_skills) / 15) * 100) # Assume 15 skills is 100%
        
    # 2. Keyword Match (replaces Semantic Similarity)
    semantic_similarity = None
    if raw_jd:
        semantic_similarity = compute_semantic_similarity(raw_resume, raw_jd)
    
    # 3. Section Completeness
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
        if "Projects" not in detected:
            detected.append("Projects")
        
    section_completeness = (sections_present / total_sections) * 100

    # 4. Resume Structure (replaces Action Verbs & Metrics)
    words = raw_resume.lower().split()
    action_verb_count = sum(1 for w in words if w in ACTION_VERBS)
    has_metrics = len(re.findall(r'\b\d+%\b|\$\d+|\b\d+\s*users\b|\b\d+\s*x\b', raw_resume.lower()))
    resume_structure = min(100.0, (action_verb_count * 15) + (30 if has_metrics else 0))

    # 5. Experience Relevance
    experience_relevance = min(100.0, (action_verb_count * 8) + (sections_present * 10))

    # Weighted ATS Score (Resume Only)
    overall_ats = round(
        (technical_skills * 0.35) +
        (experience_relevance * 0.30) +
        (section_completeness * 0.20) +
        (resume_structure * 0.15),
        1
    )
    
    # Shortlist Readiness
    if raw_jd and semantic_similarity is not None:
        if semantic_similarity >= 80 and overall_ats >= 80:
            shortlist_readiness = "High — Strong Match"
        elif semantic_similarity >= 60 and overall_ats >= 60:
            shortlist_readiness = "Moderate — Some Improvements Needed"
        else:
            shortlist_readiness = "Low — Significant Skill Gaps"
    else:
        if overall_ats >= 80:
            shortlist_readiness = "High — Strong Match (Resume Only)"
        elif overall_ats >= 60:
            shortlist_readiness = "Moderate — Some Improvements Needed (Resume Only)"
        else:
            shortlist_readiness = "Low — Significant Skill Gaps (Resume Only)"

    # Categorize missing skills by importance (only if JD exists)
    missing_skills_list = []
    if raw_jd:
        for skill in sorted(list(missing_skills)):
            importance = "High" if skill in ["python", "javascript", "react", "node.js", "sql", "aws", "docker", "kubernetes", "c++", "java"] else "Medium"
            missing_skills_list.append({
                "skill": skill,
                "importance": importance,
                "learning_link": f"https://www.coursera.org/courses?query={skill.replace(' ', '+')}"
            })
            
    return {
        "overall_ats": overall_ats,
        "semantic_similarity": semantic_similarity,
        "technical_skills": round(technical_skills, 1),
        "resume_structure": round(resume_structure, 1),
        "experience_relevance": round(experience_relevance, 1),
        "section_completeness": round(section_completeness, 1),
        "shortlist_readiness": shortlist_readiness,
        "detected_sections": detected,
        "matched_skills": sorted(list(matched_skills)),
        "missing_skills": missing_skills_list
    }

def calculate_deterministic_quality(parsed_resume: Dict[str, Any], ats_breakdown: Dict[str, Any], raw_resume: str) -> Dict[str, int]:
    content_quality = min(100, int(ats_breakdown.get("resume_structure", 50) * 0.6 + ats_breakdown.get("section_completeness", 50) * 0.4))
    technical_skills = min(100, int(ats_breakdown.get("technical_skills", 50)))
    
    has_projects = 1 if len(parsed_resume.get("projects", [])) > 0 else 0
    projects = 80 if has_projects else 40

    has_exp = 1 if len(parsed_resume.get("experience", [])) > 0 else 0
    experience = 85 if has_exp else 45

    words = raw_resume.lower().split()
    action_verb_count = sum(1 for w in words if w in ACTION_VERBS)
    has_metrics = len(re.findall(r'\b\d+%\b|\$\d+|\b\d+\s*users\b|\b\d+\s*x\b', raw_resume.lower()))
    achievements = min(100, (action_verb_count * 10) + (40 if has_metrics else 0))

    formatting = min(100, int(ats_breakdown.get("section_completeness", 50)))
    clarity = min(100, int((content_quality + formatting) / 2))
    
    return {
        "content_quality": content_quality,
        "technical_skills": technical_skills,
        "projects": projects,
        "experience": experience,
        "achievements": achievements,
        "formatting": formatting,
        "clarity": clarity
    }

def calculate_deterministic_tech_profile(resume_skills: List[str]) -> Dict[str, List[str]]:
    categories = {
        "frontend": ["javascript", "typescript", "react", "html", "css", "tailwind", "next.js", "vue", "angular"],
        "backend": ["python", "node.js", "express", "java", "c++", "c#", "flask", "fastapi", "django"],
        "database": ["sql", "postgresql", "mysql", "mongodb"],
        "cloud": ["docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd"],
        "ai_ml": ["machine learning", "deep learning", "nlp", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch"]
    }
    profile = {}
    resume_skills_lower = [s.lower() for s in resume_skills]
    
    for cat, kws in categories.items():
        # Find exactly which skills the user has in this category
        matched = [kw for kw in kws if kw in resume_skills_lower]
        if matched:
            # Capitalize properly for display
            profile[cat] = [m.title() if m not in ["html", "css", "sql", "aws", "gcp", "api", "nlp"] else m.upper() for m in matched]
        
    return profile

def _deterministic_insights_fallback(
    parsed_resume: Dict[str, Any],
    normalized_jd: Dict[str, Any],
    ats_breakdown: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evidence-grounded strengths/weaknesses/improvements built directly from
    already-computed ats_breakdown data — used whenever Gemini is
    unavailable or fails, so the page is never blank. Every sentence here
    references a real, already-computed number or list; nothing is invented.
    """
    matched = ats_breakdown.get("matched_skills", [])
    missing = ats_breakdown.get("missing_skills", [])
    missing_names = [m["skill"] for m in missing if isinstance(m, dict)]
    detected_sections = ats_breakdown.get("detected_sections", [])
    resume_structure = ats_breakdown.get("resume_structure", 0)
    technical_skills = ats_breakdown.get("technical_skills", 0)
    has_projects = len(parsed_resume.get("projects", [])) > 0
    has_experience = len(parsed_resume.get("experience", [])) > 0

    strengths = []
    if matched:
        strengths.append(f"Your resume already includes {len(matched)} relevant skill(s): {', '.join(matched[:5])}.")
    if len(detected_sections) >= 5:
        strengths.append("All standard resume sections are present (contact info, summary, skills, experience, education).")
    if has_projects:
        strengths.append("Includes hands-on project work, which gives recruiters concrete evidence of applied skills.")
    if resume_structure >= 60:
        strengths.append("Experience/project bullets use action verbs and include quantified results.")
    if not strengths:
        strengths.append("Resume was successfully parsed — add more skills, projects, or experience detail to strengthen this section.")

    weaknesses = []
    if missing_names:
        weaknesses.append(f"Missing skills the job description asks for: {', '.join(missing_names[:5])}.")
    if len(detected_sections) < 5:
        weaknesses.append(f"Only {len(detected_sections)} of 5 standard resume sections were detected — consider adding what's missing.")
    if resume_structure < 60:
        weaknesses.append("Experience/project bullets could use more action verbs and quantified metrics (numbers, %, scale).")
    if not has_experience:
        weaknesses.append("No work experience section detected — internships or freelance work count too.")
    if not weaknesses:
        weaknesses.append("No significant gaps detected against the current data.")

    recommended_improvements = []
    # Three distinct phrasing templates, rotated per missing skill, so
    # consecutive recommendations don't read as the same sentence with the
    # skill name swapped in (which is exactly what was happening before —
    # "Add evidence of aws" / "Add evidence of docker" / "Add evidence of
    # git", all identically structured).
    skill_rec_templates = [
        lambda s: {
            "title": f"Add evidence of {s}",
            "why_it_matters": f"{s} is explicitly required by this job description but wasn't found anywhere in your resume.",
            "what_to_change": f"If you've used {s} in coursework, a personal project, or prior work, add a specific bullet naming it directly."
        },
        lambda s: {
            "title": f"Close the {s} gap",
            "why_it_matters": f"Recruiters scanning for {s} will move past a resume that doesn't mention it, even if you have adjacent experience.",
            "what_to_change": f"Even a small amount of hands-on {s} exposure is worth calling out — mention it in your skills list or a relevant project bullet."
        },
        lambda s: {
            "title": f"Surface your {s} experience (if any)",
            "why_it_matters": f"This role's screening criteria weight {s} highly, and it's currently invisible on your resume.",
            "what_to_change": f"Review your projects and coursework for any {s} usage, however minor, and make it explicit rather than implied."
        }
    ]
    for idx, skill in enumerate(missing_names[:3]):
        recommended_improvements.append(skill_rec_templates[idx % len(skill_rec_templates)](skill))
    if resume_structure < 60:
        recommended_improvements.append({
            "title": "Quantify your impact",
            "why_it_matters": "Recruiters scan for measurable results, not just task descriptions.",
            "what_to_change": "Add specific numbers (%, scale, time saved, users affected) to 2-3 of your strongest bullets."
        })
    if not recommended_improvements:
        recommended_improvements.append({
            "title": "Skill coverage looks strong",
            "why_it_matters": "No major gaps were found against the target role.",
            "what_to_change": "Focus on tightening bullet wording and adding measurable outcomes where possible."
        })

    return {
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "recommended_improvements": recommended_improvements[:3]
    }

def generate_ai_insights(
    parsed_resume: Dict[str, Any],
    normalized_jd: Dict[str, Any],
    ats_breakdown: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate evidence-based qualitative resume insights.

    All strengths, weaknesses, and recommendations must be grounded
    strictly in the uploaded resume and, when available, the JD.
    """

    # Build the actual resume evidence that Gemini is allowed to use.
    resume_evidence = {
        "summary": parsed_resume.get("summary", ""),
        "skills": parsed_resume.get("skills", []),
        "experience": parsed_resume.get("experience", []),
        "projects": parsed_resume.get("projects", []),
        "education": parsed_resume.get("education", []),
        "certifications": parsed_resume.get("certifications", [])
    }

    # Build the actual JD evidence.
    jd_evidence = {
        "title": normalized_jd.get("title", ""),
        "required_skills": normalized_jd.get("required_skills", []),
        "preferred_skills": normalized_jd.get("preferred_skills", []),
        "responsibilities": normalized_jd.get("responsibilities", []),
        "normalized_description": normalized_jd.get(
            "normalized_description", ""
        )
    }

    if not gemini_client:
        # No Gemini configured — use the evidence-grounded deterministic
        # fallback instead of returning nothing. This is what was causing
        # "No strengths data available" / "No improvement areas found" /
        # "No specific improvements recommended" to show on every single
        # analysis, since there was previously no fallback at all here.
        return _deterministic_insights_fallback(parsed_resume, normalized_jd, ats_breakdown)

    try:
        prompt = f"""
You are an expert technical recruiter and resume analyzer.

Analyze ONLY the evidence provided below.

Do NOT assume, invent, infer, or fabricate:
- skills
- projects
- technologies
- achievements
- metrics
- work experience
- responsibilities

RESUME EVIDENCE:
{json.dumps(resume_evidence, indent=2)}

JOB DESCRIPTION EVIDENCE:
{json.dumps(jd_evidence, indent=2)}

Your task is to produce three sections.

1. STRENGTHS

Generate 2-4 specific strengths.

Every strength MUST:
- Be directly supported by the resume.
- Mention the specific technology, project, experience, skill, or section that proves it.
- If a JD exists, prioritize strengths relevant to that JD.
- Be written as a short, meaningful explanation rather than a generic label.

GOOD:
"Strong full-stack development experience using React and FastAPI, demonstrated through the MedGuide project."

BAD:
"Strong technical foundation."

BAD:
"Good programming skills."

2. AREAS TO IMPROVE

Generate 2-4 specific areas to improve.

Every area MUST:
- Be supported by actual resume evidence.
- If a JD exists, identify a real gap between the JD and resume.
- Mention the exact missing skill, project, section, or resume evidence whenever possible.
- Explain briefly what is lacking.

GOOD:
"AWS and Docker are requested in the JD but are not clearly demonstrated in the uploaded resume."

GOOD:
"The project descriptions explain the technologies used but provide limited evidence of the outcome or impact of those projects."

BAD:
"Improve your experience."

BAD:
"Improve your technical foundation."

3. RECOMMENDED IMPROVEMENTS

Generate a maximum of 3 recommendations.

Each recommendation must:
- Be based on specific resume or JD evidence.
- Reference a specific project, skill, section, bullet, or JD requirement when applicable.
- Explain what should actually be changed.
- Never invent metrics or achievements.
- Never tell the candidate to add information that is not supported by their real experience.

Generic advice is forbidden unless the actual resume evidence specifically supports it.

FORBIDDEN GENERIC RECOMMENDATIONS:
- "Improve your technical foundation"
- "Quantify impact"
- "Use stronger action verbs"
- "Optimize your resume"
- "Improve your experience"

If there is not enough evidence for a recommendation, DO NOT generate one.

Return JSON ONLY in exactly this structure:

{{
    "strengths": [
        "specific evidence-based strength"
    ],
    "weaknesses": [
        "specific evidence-based area to improve"
    ],
    "recommended_improvements": [
        {{
            "title": "Specific improvement",
            "why_it_matters": "Brief explanation based on the resume or JD",
            "what_to_change": "Specific change supported by the evidence"
        }}
    ]
}}

Rules:
- strengths: 2-4 items when sufficient evidence exists.
- weaknesses: 2-4 items when sufficient evidence exists.
- recommended_improvements: maximum 3 items.
- Never invent information.
- Never use generic filler.
- If evidence is insufficient, return fewer items rather than inventing content.
"""

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = response.text.strip()

        if "```json" in raw:
            raw = raw.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in raw:
            raw = raw.split("```", 1)[1].split("```", 1)[0].strip()

        result = json.loads(raw)

        # Validate the structure before returning it.
        strengths = result.get("strengths", [])
        weaknesses = result.get("weaknesses", [])
        recommendations = result.get("recommended_improvements", [])

        if not isinstance(strengths, list):
            strengths = []

        if not isinstance(weaknesses, list):
            weaknesses = []

        if not isinstance(recommendations, list):
            recommendations = []

        # Keep only strings for strengths/weaknesses.
        strengths = [
            str(item).strip()
            for item in strengths
            if isinstance(item, str) and item.strip()
        ]

        weaknesses = [
            str(item).strip()
            for item in weaknesses
            if isinstance(item, str) and item.strip()
        ]

        # Keep only valid recommendation objects.
        valid_recommendations = []

        for item in recommendations[:3]:
            if not isinstance(item, dict):
                continue

            title = str(item.get("title", "")).strip()
            why = str(item.get("why_it_matters", "")).strip()
            change = str(item.get("what_to_change", "")).strip()

            if title and why and change:
                valid_recommendations.append({
                    "title": title,
                    "why_it_matters": why,
                    "what_to_change": change
                })

        return {
            "strengths": strengths[:4],
            "weaknesses": weaknesses[:4],
            "recommended_improvements": valid_recommendations
        }

    except Exception as e:
        sys.stderr.write(f"Gemini Insights error: {e}\n")

        # Same fallback as the no-client case — a Gemini failure (quota,
        # network, malformed JSON, etc.) should degrade to real computed
        # data, not an empty page.
        return _deterministic_insights_fallback(parsed_resume, normalized_jd, ats_breakdown)

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
            "semantic_similarity": ats_breakdown["semantic_similarity"],
            "technical_skills": ats_breakdown["technical_skills"],
            "resume_structure": ats_breakdown["resume_structure"],
            "experience_relevance": ats_breakdown["experience_relevance"],
            "section_completeness": ats_breakdown["section_completeness"],
            "shortlist_readiness": ats_breakdown["shortlist_readiness"],
            "detected_sections": ats_breakdown["detected_sections"],
            "strong_skills": ats_breakdown["matched_skills"],
            "missing_skills": ats_breakdown["missing_skills"],
            "strengths": insights.get("strengths", []),
            "weaknesses": insights.get("weaknesses", []),
            "recommended_improvements": insights.get("recommended_improvements", []),
            "resume_quality": calculate_deterministic_quality(parsed_resume, ats_breakdown, raw_resume),
            "tech_skill_profile": calculate_deterministic_tech_profile(parsed_resume.get("skills", [])),
            "roadmap": roadmap,
        }
        print(json.dumps(result))

if __name__ == "__main__":
    main()