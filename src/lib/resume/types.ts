export type ResumeExperience = { id: string; role: string; organization: string; location: string; dates: string; points: string[] };
export type ResumeSkillGroup = { id: string; title: string; items: string[] };
export type ResumeEducation = { id: string; credential: string; institution: string; dates: string; details: string[]; note: string };
export type ResumeProject = { id: string; title: string; organization: string; dates: string; summary: string; highlights: string[]; url: string };
export type ResumeCertification = { id: string; title: string; issuer: string; date: string; credentialUrl: string };
export type ResumeCustomSection = { id: string; title: string; body: string; items: string[] };
export type ResumeSocialLink = { id: string; label: string; url: string };

export type ResumeDocument = {
  name: string;
  headline: string;
  contact: { email: string; phone: string; location: string };
  socialLinks: ResumeSocialLink[];
  summaryTitle: string;
  summary: string[];
  experience: ResumeExperience[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  customSections: ResumeCustomSection[];
};

export type ResumeState = { draft: ResumeDocument; published: ResumeDocument; publishedAt: string | null; updatedAt: string | null };

export const defaultResume: ResumeDocument = {
  name: "Erll Jhanwin P. Catapang",
  headline: "Junior Software Engineer · Full-Stack Developer",
  contact: { email: "erlljhanwincatapang61@gmail.com", phone: "09766464273", location: "Lipa, Batangas" },
  socialLinks: [{ id: "github", label: "GitHub", url: "https://github.com/Erll-Jhanwin" }],
  summaryTitle: "Professional summary",
  summary: [
    "Aspiring Software Engineer and BSIT graduating student specializing in Service Management, with hands-on experience developing full-stack web applications and mobile solutions. Proficient in JavaScript, Python, React.js, Node.js, Django, and database management, with experience building REST APIs, authentication systems, and business management applications. Brings additional customer support experience, strong problem-solving abilities, and effective communication skills. Seeking a Junior Software Engineer or Full-Stack Developer position to contribute to software development projects and deliver practical, user-focused solutions.",
  ],
  experience: [
    { id: "results-cx", role: "Customer Support Associate", organization: "Results-CX", location: "", dates: "September 2026 – Present", points: ["Handle customer inquiries and concerns through calls while providing timely and effective resolutions.", "Follow established quality standards and performance metrics to maintain customer satisfaction and service quality.", "Apply active listening, communication, and problem-solving skills to address customer needs and resolve concerns.", "Collaborate with team members to ensure efficient customer service operations."] },
    { id: "alitagtag-mdrmmo", role: "Work Immersion", organization: "Local Government Unit of Alitagtag — Municipal Disaster Risk Reduction and Management Office (MDRRMO)", location: "Alitagtag, Batangas", dates: "February 2023 – March 2023", points: ["Create rainfall advisory graphics to inform the public about weather conditions and possible flooding.", "Design clear and Informative visuals for public announcements and safety reminders.", "Developed the Department’s Citizen’s Charter outlining its services, requirements, procedures, and processing times.", "Organized service information to help citizens understand and access government services easily."] },
  ],
  skills: [
    { id: "programming-languages", title: "Programming languages", items: ["JavaScript", "Python", "PHP", "Java"] },
    { id: "frontend-development", title: "Frontend development", items: ["HTML5", "CSS3", "React.js", "Bootstrap", "Tailwind CSS"] },
    { id: "backend-development", title: "Backend development", items: ["Node.js", "Express.js", "Django"] },
    { id: "databases", title: "Databases", items: ["PostgreSQL", "MySQL", "SQLite", "Supabase"] },
    { id: "tools-technologies", title: "Tools & technologies", items: ["Git", "GitHub", "Visual Studio Code", "Android Studio", "Postman", "REST APIs"] },
  ],
  education: [
    { id: "bachelor-information-technology", credential: "Bachelor of Science in Information Technology", institution: "Batangas State University – The National Engineering University, Lipa Campus", dates: "Expected graduation: July 2027", details: ["Major in Service Management"], note: "Lipa City, Batangas" },
  ],
  projects: [
    { id: "cav-business-operations", title: "An Integrated Web-Based Business Operations Management System Utilizing Machine Learning for CAV Photo Studio and Café", organization: "Full-Stack Developer", dates: "March 2026 – October 2026", summary: "Developed a full-stack business management platform integrating studio bookings, point-of-sale (POS), sales tracking, inventory management, and business analytics into a centralized system.", highlights: ["Implemented role-based authentication and management workflows for administrators, staff, and customers, including booking, payment verification, and inventory operations.", "Developed REST API integrations and database-driven functionalities using React, Django, and Supabase.", "Integrated machine learning-based sales forecasting to support business planning and data-driven decision-making.", "Improved mobile Lighthouse performance on the admin dashboard by 29 points and reduced Total Blocking Time by 6.0 seconds through frontend performance optimization.", "Technologies: React.js, Tailwind CSS, Django, Supabase, SQLite, REST APIs", "GitHub: https://github.com/Erll-Jhanwin/CAV-Photostudio-and-Cafe"], url: "https://cavphotostudiocafe.com" },
    { id: "revoltix-educational-app", title: "REVOLTIX: An Educational Application for ECE Students", organization: "App Developer", dates: "January 2024 – May 2024", summary: "Contributed to the development of an educational Android application designed to provide Electronics Engineering students with an accessible and centralized learning platform.", highlights: ["Developed and integrated application functionalities using Java and Firebase, supporting data management and user authentication.", "Utilized Firebase Authentication, Realtime Database, and Cloud Storage to support user accounts, application data, and learning resources.", "Participated in application design, feature implementation, and testing to improve usability and functionality.", "Technologies: Java, Android Studio, Firebase Authentication, Firebase Realtime Database, Firebase Storage", "Project: https://tinyurl.com/38cy5rsw", "GitHub: https://github.com/Erll-Jhanwin/REVOLTIX"], url: "https://tinyurl.com/38cy5rsw" },
  ],
  certifications: [
    { id: "converge-it-conference-2026", title: "Converge IT Conference 2026", issuer: "Lipa Academy for Sports, Culture and Arts", date: "2026", credentialUrl: "" },
    { id: "batangas-it-conference-2024", title: "Batangas Information Technology Conference", issuer: "Lipa Academy for Sports, Culture and Arts", date: "2024", credentialUrl: "" },
    { id: "project-ict-workshop-2023", title: "Project ICT: Improving Competencies in Technology Workshop", issuer: "Alitagtag Senior High School", date: "2023", credentialUrl: "" },
  ],
  customSections: [],
};
