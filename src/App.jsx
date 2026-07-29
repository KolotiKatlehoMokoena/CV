import './App.css'
import { useEffect, useState } from 'react'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-content">{children}</div>
    </section>
  )
}

function Nav({ active, onNavigate }) {
  const items = [
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
   // { id: 'education', label: 'Education' },
   // { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ]
  const [isMenuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }


  
  return (
    <nav className="nav">
      <div className="nav-left">
        <button
          className={`hamburger ${isMenuOpen ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>       
      </div>
      <ul className="nav-list desktop">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={active === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className={`mobile-menu ${isMenuOpen ? 'show' : ''}`}>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={active === item.id ? 'active' : ''}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function TimelineItem({ title, subtitle, period, description }) {
  return (
    <div className="timeline-item">
      <div className="timeline-dot" />
      <div className="timeline-content">
        <div className="timeline-header">
          <span className="timeline-title">{title}</span>
          <span className="timeline-period">{period}</span>
        </div>
        {subtitle && <div className="timeline-subtitle">{subtitle}</div>}
        <p>{description}</p>
      </div>
    </div>
  )
}

function SkillTag({ label, level }) {
  return (
    <div className="skill">
      <span>{label}</span>
      {level && <div className="bar"><div className="fill" style={{ width: `${level}%` }} /></div>}
    </div>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [justSent, setJustSent] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (!import.meta.env.VITE_FIREBASE_PROJECT_ID || !db) {
        throw new Error('Firebase is not configured. Please set environment variables to enable contact form.')
      }
      console.log('[Contact] Submitting to Firestore…', {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        hasApiKey: Boolean(import.meta.env.VITE_FIREBASE_API_KEY),
      })
      await addDoc(collection(db, 'contacts'), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: serverTimestamp(),
      })
      console.log('[Contact] Firestore addDoc success')
      setStatus('Submitted')
      setForm({ name: '', email: '', message: '' })
      setJustSent(true)
      setTimeout(() => {
        setJustSent(false)
        setStatus(null)
      }, 2000)
    } catch (err) {
      console.error(err)
      setStatus(err?.message ? `Failed: ${err.message}` : 'Failed to submit')
    }
    finally { setLoading(false) }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="grid">
        <input name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Your email" value={form.email} onChange={onChange} required />
      </div>
      <textarea name="message" placeholder="Your message" value={form.message} onChange={onChange} required />
      <button type="submit" disabled={loading || justSent}>{loading ? 'Sending…' : (status === 'Submitted' ? 'Sent' : 'Send')}</button>
      {status && <div className="status">{status}</div>}
    </form>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

function App() {
  const [active, setActive] = useState('about')
  const [selectedProject, setSelectedProject] = useState(null)
  const [portfolioTab, setPortfolioTab] = useState('design')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[id]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length) {
          const closest = visible.reduce((closestEntry, current) => {
            return Math.abs(current.boundingClientRect.top) < Math.abs(closestEntry.boundingClientRect.top) ? current : closestEntry
          }, visible[0])
          setActive(closest.target.id)
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal')
          }
        })
      },
      { threshold: 0.35 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    setActive(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  return (
    <div className="container">
      <Nav active={active} onNavigate={scrollTo} />

      <header className="hero">
        <img className="avatar" src="/profile.jpg" alt="Profile" />
        <div className="hero-text">
          <h1>Katleho K Mokoena</h1>
          <p>Interactive Portfolio </p>
          <div className="hero-actions">
            <a className="btn" href="#projects" onClick={(e) => { e.preventDefault(); scrollTo('projects') }}>View Projects</a>
            {/* <a className="btn outline" href="/kkmokoena_cv.pdf" target="_blank" rel="noreferrer">Preview CV</a>  */}
          </div>
        </div>
      </header>

      <main>
        <Section id="about" title="About">
          <p>
            I’m a passionate developer and IT professional dedicated to building delightful user 
            experiences, performant frontends and resilient backends. With a strong foundation in Information Technology, 
            I’ve excelled as a Project Coordinator, IT Administrator, Network Engineer, Web Administrator, Database Administrator,  
            and Social Media Manager roles that strengthened my abilities in software maintenance, website management, network infrastructure, 
            project execution and digital engagement. 
            I enjoy solving real problems through clean code, accessible design and thoughtful collaboration, while leveraging digital platforms to boost brand visibility
           and audience connection. Driven by continuous learning, I stay ahead of emerging technologies 
           and consistently bring a proactive, solutions-focused mindset to every project.
          </p>
        </Section>

        <Section id="portfolio" title="Portfolio">
         <p style={{ color: 'var(--muted)', marginTop: 0 }}>
           A consolidated portfolio across graphic design, photography, and social media management, highlighting engagements with companies managed throughout the years.
          </p>
      
          <div className="tabs">
            <button className={portfolioTab === 'design' ? 'tab active' : 'tab'} onClick={() => setPortfolioTab('design')}>Graphic Design</button>
            <button className={portfolioTab === 'photo' ? 'tab active' : 'tab'} onClick={() => setPortfolioTab('photo')}>Photography</button>
            <button className={portfolioTab === 'social' ? 'tab active' : 'tab'} onClick={() => setPortfolioTab('social')}>Social Media Management</button>
          </div>

          {portfolioTab === 'design' && (
            <div className="cards">
              <div className="card">
                <h3>Graphic Design Portfolio</h3>
                <p>Includes logos, posters and overall designs.</p>
                <a className="btn outline" href="https://drive.google.com/file/d/1g_GKzXDWwLEI8RfoVMJk0kht2B9zVGFF/view?usp=drive_link" target="_blank" rel="noreferrer">View Portfolio</a>
              </div>
              
            </div>
          )}

          {portfolioTab === 'photo' && (
            <div className="cards">
              <div className="card">
                <h3>Photography Portfolio</h3>
                <p>Includes portraits, event photography, and artistic compositions.</p>
                <a className="btn outline" href="https://drive.google.com/file/d/1Rn0IpQv3RIpBBlvbaQq5KgBwA0TnnNLP/view?usp=drive_link" target="_blank" rel="noreferrer">View Portfolio</a>
              </div>
            </div>
          )}



          {portfolioTab === 'social' && (
            <div className="cards">
              <div className="card">
                <h3>Art Bank of South Africa</h3>
                <p>Social Media Manager — Managed all social media platforms from Aug 2023 to Dec 2025.</p>
                <a className="btn outline" href="https://web.facebook.com/artbankSA" target="_blank" rel="noreferrer">View Page</a>
              </div>
              <div className="card">
                <h3>Boho Bistro</h3>
                <p>Social Media Manager — Managed all social media platforms from Sep 2020 to Dec 2021.</p>
                <a className="btn outline" href="https://web.facebook.com/bohobistro2016" target="_blank" rel="noreferrer">View Page</a>
              </div>
              <div className="card">
                <h3>The Ivy Lounge</h3>
                <p>Social Media Manager — Managed all social media platforms from Jun 2019 to Jul 2020.</p>
                <a className="btn outline" href="https://web.facebook.com/TheIvyLounge" target="_blank" rel="noreferrer">View Page</a>
              </div>
            </div>
          )}
        </Section>

        <Section id="projects" title="Projects">
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>
            Projects that showcase my skills in web development, design and project coordination. Each project highlights my ability to create functional, user-friendly and visually appealing digital experiences.
          </p>

             <div className="card">
              <h3>Business Journalist Portfolio Website</h3>
              <p>An interactive portfolio website for a business journalist, built with React, Vite, and CSS variables. It includes sticky navigation, smooth scrolling, modal dialogs, accessible components, and Firebase Firestore integration for forms and data.</p>
              <div className="card-actions">
                <a className="btn" href="https://businessjournalist.vercel.app/" target="_blank" rel="noreferrer">Visit Site</a>
                <button className="btn outline" onClick={() => setSelectedProject({
                  title: 'Business Journalist Portfolio Website',
                  details: 'An interactive business journalist portfolio website built with React, Vite, and CSS variables. Implements sticky navigation, smooth scrolling, modal dialogs, accessible components, and integrates Firebase Firestore for forms/data.'
                })}>Details</button>
              </div>
            </div>

            <div className="card">
              <h3>E-Commerce Website</h3>
              <p>An e-commerce website is a high-availability distributed web application engineered for digital transactions. It operates as a complex, 
                data-driven engine that synchronizes frontend UI, backend APIs, and third-party integrations</p>
              <div className="card-actions">
                <a className="btn" href="https://website-27f0d.web.app/" target="_blank" rel="noreferrer">Visit Site</a>
                <button className="btn outline" onClick={() => setSelectedProject({
                  title: 'E-Commerce Website',
                  details: 'A digital store that lets customers browse, select, and securely buy products. Core Functions are displaying organized digital product catalogs. Selection use a virtual shopping cart to hold items. Payments are processed on secure online transactions. The website integrates with payment gateways, inventory management, and customer support systems to provide a seamless shopping experience.'
                })}>Details</button>
              </div>
            </div>

                 <div className="card">
              <h3> Art Bank of South Africa - Lead Project Coordinator</h3>
              <p>Project lead for the execution and design of the James Brick Monument, overseeing the monuments conceptual design, project planning, stakeholder coordination, resource management and on-site execution. I ensured the successful delivery of the project while meeting design objectives, quality standards, budget requirements and project timeline.</p>
              <div className="card-actions">
                <a className="btn" href="https://www.facebook.com/NationalMuseumBloemfontein/posts/pfbid0pjrEXPymXuUQUxDi6bEujGKGrm2WkNGEM5bk19JLjN1Ce5wmtcRiu6E7WP5gMr95l" target="_blank" rel="noreferrer">Visit Site</a>
                <button className="btn outline" onClick={() => setSelectedProject({
                  title: 'James Brick Monument Project',
                  details: 'Served as the Project Lead for the design and execution of the James Brick Monument, overseeing the project from concept development through to completion. Responsibilities included designing the monument, planning and coordinating project activities, managing stakeholders, contractors, and suppliers, procuring materials, supervising on-site construction, ensuring compliance with quality and safety standards, monitoring project timelines and budgets, resolving technical challenges, and ensuring the successful delivery of the monument in accordance with the clients vision and project specifications.'
                })}>Details</button>
              </div>
            </div>

            <div className="card">
              <h3> Art Bank of South Africa - National Catalogue</h3>
              <p>Showcasing the artworks we have acquired by the best South African artists from across the nation, we hope you enjoy reading our 2020 Art Collection Third Edition.</p>
              <div className="card-actions">
                <a className="btn" href="https://artbanksa.org/2020-art-collection-of-the-art-bank-of-south-africa/" target="_blank" rel="noreferrer">Visit Site</a>
                <button className="btn outline" onClick={() => setSelectedProject({
                  title: 'National Catalog',
                  details: 'Contributed to the development of a comprehensive digital and physical catalog showcasing the national art collection. Features include detailed artwork descriptions, artist information, and interactive browsing capabilities.'
                })}>Details</button>
              </div>
            </div>

            <div className="card">
              <h3>Interactive CV Website</h3>
              <p> Incorporating clickable links, multimedia elements, responsive designs and serverless API.</p>
              <div className="card-actions">
                <a className="btn" href="https://kkmokoenainteractivecv-kk-mokoenas-projects.vercel.app/" target="_blank" rel="noreferrer">Visit Site</a>
                <button className="btn outline" onClick={() => setSelectedProject({
                  title: 'Interactive CV Website',
                  details: 'Built with React, Vite, and CSS variables. Implements sticky navigation, smooth scrolling, modal dialogs, accessible components, and integrates Firebase Firestore for forms/data.'
                })}>Details</button>
              </div>
            </div>

        </Section>
        <Section id="skills" title="Skills">
          <div className="skills">
           <SkillTag label="C#" level={90} />
            <SkillTag label="Dart" level={90} />
            <SkillTag label="React" level={90} />
             <SkillTag label="Wordpress" level={85} />
            <SkillTag label="JavaScript" level={85} />
            <SkillTag label="Graphic Design" level={85} />
            <SkillTag label="Photography" level={75} />
            <SkillTag label="Videography" level={75} />
             <SkillTag label="Video Editor" level={75} />
          </div>
        </Section>

        <Section id="education" title="Education">
          <ul className="list">
            <li>National Senior Certificate</li>
            <li>National Diploma: Information Technology</li>
            <li>Molex Connected Enterprise Solutions
              <ul className="list">
                <li>BP130 – Advanced Structured Cabling Design and Installation</li>
              </ul>
            </li>
            <li>
              Huawei Global Training Centre
              <ul className="list">
                <li>OceanStor Dorado Administrator Training</li>
                <li>Datacenter Virtualization Solutions Training</li>
                <li>OceanProtect Backup Appliance Administrator Training</li>
              </ul>
            </li>
            <li>
              Cisco Networking Academy
              <ul className="list">
                <li>Introduction to Modern AI</li>
                <li>Introduction to Cybersecurity</li>
                <li>Cyber Threat Management</li>
                <li>Endpoint Security</li>
                <li>JavaScript Essentials I</li>
              </ul>
            </li>
            
          </ul>
        </Section>

        {/* <Section id="experience" title="Experience">
          <div className="timeline">

              <TimelineItem
              title="Network Engineer"
              subtitle="Unqeto IT Solutions"
              period="April 2026 — present"
              description=" Designing, implementing, and managing organizations network infrastructure."
            />

            <TimelineItem
              title="IT Administrator"
              subtitle="The Grind Investments"
              period="February 2026 — March 2026"
              description=" Acted as the primary point of contact for resolving IT-related queries, 
              ranging from software, hardware and network connectivity issues."
            />

            <TimelineItem
              title="Social & Web Administration"
              subtitle="Art Bank of South Africa"
              period="September 2024 — December 2025"
              description="Managing the website performance, security, content updates, ensuring optimal site functionality, 
              troubleshoot technical issues, oversee user access, and implement necessary updates and backups for data protection."
            />
            <TimelineItem
              title="Project Coordinator"
              subtitle="Art Bank of South Africa"
              period="August 2023 — April 2024"
              description="Coordinated project timelines, stakeholder communication, and deliverables, supported program logistics and reporting."
            />
            <TimelineItem
              title="Database Administrator"
              subtitle="Kwavulamehlo Arts & Ideas"
              period="February 2022 — June 2023"
              description="Maintained and organized datasets, performed data entry and backups, and assisted with data integrity processes."
            />
            <TimelineItem
              title="Social Media Manager"
              subtitle="Boho Bistro"
              period="September 2020 — December 2021"
              description="Creating, curating, and scheduling engaging content tailored to the target 
              audience, including text posts, images, videos, and stories."
            />
            <TimelineItem
              title="Social Media Manager"
              subtitle="The Ivy Lounge"
              period="June 2019 — July 2020"
              description="Analysing performance metrics to assess the effectiveness of campaigns, making data-driven 
              adjustments to improve reach and engagement."
            />
          </div>
        </Section> */}

        <Section id="contact" title="Contact">
          <ContactForm />
        </Section>
      </main>

      <footer className="footer">
        <div className="socials">
          <a href="https://www.linkedin.com/in/katlehokmokoena007gp/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:katlehokmokoena@outlook.com">Email</a>
        </div>
        <span>© Designed by KK Mokoena</span>
      </footer>

      <Modal
        open={!!selectedProject}
        title={selectedProject?.title}
        onClose={() => setSelectedProject(null)}
      >
        <p>{selectedProject?.details}</p>
      </Modal>

    </div>
  )
}
export default App