import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { benefits, information, navigation, projects } from "./content";
import { submitContact, validateContact } from "./contact";

const asset = (name) => `/assets/${name}.svg`;
function Art({ name, className = "", alt = "", ...props }) {
  return <img src={asset(name)} className={className} alt={alt} {...props} />;
}
function Talk({ light = false, className = "", onClick, href = "#contact" }) {
  return (
    <a
      className={`talk ${light ? "talk-light" : ""} ${className}`}
      href={href}
      onClick={onClick}
    >
      Let’s Talk
      <span aria-hidden="true" />
    </a>
  );
}
function Nav({ onNavigate, onInfo, className = "" }) {
  return (
    <nav
      className={className}
      aria-label={
        className === "desktop-nav" ? "Main navigation" : "Site navigation"
      }
    >
      {navigation.map((item, i) =>
        item.href ? (
          <a key={item.label} href={item.href} onClick={onNavigate}>
            {item.label}
            <sup>({String(i + 1).padStart(2, "0")})</sup>
          </a>
        ) : (
          <button
            key={item.label}
            onClick={() => {
              onNavigate?.();
              onInfo(item.dialog);
            }}
          >
            {item.label}
            <sup>({String(i + 1).padStart(2, "0")})</sup>
          </button>
        ),
      )}
    </nav>
  );
}
function SectionTitle({ children, number, centered = false }) {
  return (
    <h2 className={`section-title ${centered ? "centered" : ""}`}>
      <Art name="arrow" />
      <span>{children}</span>
      <sup>({number})</sup>
    </h2>
  );
}
function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const fields = useRef({});
  async function submit(event) {
    event.preventDefault();
    const next = validateContact(values);
    setErrors(next);
    if (Object.keys(next).length) fields.current[Object.keys(next)[0]]?.focus();
    if (Object.keys(next).length) return;
    setStatus({ state: "sending", message: "Sending your message…" });
    try {
      await submitContact(values);
      setValues({ name: "", email: "", message: "", company: "" });
      setStatus({
        state: "success",
        message: "Thanks — your message has been sent. We'll get back to you soon.",
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error.message || "We couldn't send your message. Please try again.",
      });
    }
  }
  return (
    <form className="contact-form" noValidate onSubmit={submit}>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-company">Company website</label>
        <input
          id="contact-company"
          name="company"
          tabIndex="-1"
          autoComplete="off"
          value={values.company}
          onChange={(event) => setValues({ ...values, company: event.target.value })}
        />
      </div>
      {["name", "email", "message"].map((field) => (
        <div className={`field ${errors[field] ? "invalid" : ""}`} key={field}>
          <label className="sr-only" htmlFor={`contact-${field}`}>
            {field === "name"
              ? "Name"
              : field === "email"
                ? "Email"
                : "Message"}
            {" (required)"}
          </label>
          {field === "message" ? (
            <textarea
              id="contact-message"
              ref={(el) => {
                fields.current.message = el;
              }}
              name="message"
              required
              maxLength="2000"
              rows="1"
              placeholder="Message *"
              value={values.message}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              onChange={(event) => {
                setValues({ ...values, message: event.target.value });
                setStatus({ state: "idle", message: "" });
                if (errors.message) setErrors({ ...errors, message: undefined });
              }}
            />
          ) : (
          <input
            id={`contact-${field}`}
            ref={(el) => {
              fields.current[field] = el;
            }}
            name={field}
            type={field === "email" ? "email" : "text"}
            autoComplete={
              field === "name" ? "name" : field === "email" ? "email" : "off"
            }
            required
            maxLength={field === "name" ? 120 : 254}
            placeholder={
              field === "name"
                ? "Name *"
                : field === "email"
                  ? "Email *"
                  : "Message *"
            }
            value={values[field]}
            aria-invalid={!!errors[field]}
            aria-describedby={errors[field] ? `${field}-error` : undefined}
            onChange={(event) => {
              setValues({ ...values, [field]: event.target.value });
              setStatus({ state: "idle", message: "" });
              if (errors[field]) setErrors({ ...errors, [field]: undefined });
            }}
          />
          )}
          {errors[field] && (
            <p className="field-error" id={`${field}-error`}>
              {errors[field]}
            </p>
          )}
        </div>
      ))}
      <button className="talk" type="submit" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : "Let’s Talk"}
        <span aria-hidden="true" />
      </button>
      <p className="form-privacy">
        By sending this form, you agree that we may use your details to reply to your inquiry.
      </p>
      <p className={`form-status ${status.state}`} role="status" aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const menuToggle = useRef(null);
  const dialog = useRef(null);
  const showCases =
    new URLSearchParams(window.location.search).get("cases") !== "0";
  useEffect(() => {
    if (info) dialog.current?.showModal();
    else dialog.current?.close();
  }, [info]);
  useEffect(() => {
    function escape(event) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuToggle.current?.focus();
      }
    }
    function resize() {
      if (window.innerWidth > 767) setMenuOpen(false);
    }
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [menuOpen]);
  function closeMenu() {
    setMenuOpen(false);
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header shell" id="home">
        <a href="#home" aria-label="NEXUS home" onClick={closeMenu}>
          <Art
            name="logo"
            className="logo"
            alt="NEXUS."
            width="138"
            height="34"
          />
        </a>
        <Nav className="desktop-nav" onInfo={setInfo} />
        <button
          ref={menuToggle}
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </header>
      <div id="mobile-menu" className="mobile-menu shell" hidden={!menuOpen}>
        <Nav onNavigate={closeMenu} onInfo={setInfo} />
        <Talk onClick={closeMenu} />
      </div>
      <main id="main">
        <section className="hero section-border" aria-labelledby="hero-title">
          <div className="hero-inner shell">
            <h1 id="hero-title">
              Empower Your Business&nbsp; with <span>Innovative</span> Solutions
            </h1>
            <Art
              name="hero-projects"
              className="hero-art"
              alt="Two featured web designs, including the FORMORA furniture project"
              width="264"
              height="221"
              fetchPriority="high"
            />
            <div className="hero-description">
              <p>
                We create stunning websites, platforms, and mobile apps tailored
                <br className="desktop-break" /> to your business needs.
              </p>
              <div className="hero-cta">
                <Talk />
                <Art
                  name="call-note"
                  className="call-note"
                  alt="15 minute call"
                  width="115"
                  height="50"
                />
              </div>
            </div>
            <div className="trust">
              <div>
                <p>Scaled 200+ Brands</p>
                <div className="rating" aria-label="Rated 4.9 out of 5">
                  <span aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Art name="star" key={i} />
                    ))}
                  </span>
                  <span>4.9</span>
                </div>
              </div>
              <Art
                name="avatars"
                width="74"
                height="32"
                alt="Client portraits"
              />
            </div>
          </div>
        </section>
        <section id="about" className="benefits-section dotted section-border">
          <div className="shell benefits-inner">
            <SectionTitle number="02">Why Choose Us</SectionTitle>
            <div className="benefit-grid">
              {benefits.map((item) => (
                <article className="benefit-card" key={item.title}>
                  <Art
                    name={item.icon}
                    className="benefit-icon"
                    width="32"
                    height="32"
                  />
                  <Art name="corner" className="corner" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        {showCases && (
          <section id="projects" className="projects shell">
            <SectionTitle number="03" centered>
              All Cases
            </SectionTitle>
            {projects.map((project, i) => (
              <article
                className={`project-row project-${i + 1}`}
                key={project.id}
              >
                <div className="project-copy">
                  <span className="category">
                    <Art name="corner" />
                    Branding
                  </span>
                  <div>
                    <h3>Experienced Team</h3>
                    <p>{benefits[0].description}</p>
                  </div>
                </div>
                <img
                  className="project-art"
                  src={asset(project.image)}
                  alt={project.alt}
                  width="907"
                  height="420"
                  loading="lazy"
                />
              </article>
            ))}
            <div className="projects-cta">
              <p>Say goodbye to "messy designs"</p>
              <Talk light />
            </div>
          </section>
        )}
        {!showCases && <div id="projects" />}
        <div
          className="vision-line section-border"
          aria-label="Let’s bring your vision to life"
        >
          <div aria-hidden="true">
            <span>Let’s bring your</span>
            <Art name="vision-card" />
            <span>vision to life</span>
          </div>
        </div>
        <section
          id="contact"
          className="contact-section dotted section-border"
          aria-labelledby="contact-title"
        >
          <div className="shell contact-inner">
            <div className="contact-grid">
              <aside className="contact-promo">
                <h2>Join the Businesses Leading Their Industry</h2>
                <Talk
                  className="talk-peach"
                  href="#contact-name"
                  onClick={() =>
                    document.getElementById("contact-name")?.focus()
                  }
                />
                <Art
                  name="slideshow"
                  className="slideshow"
                  alt="A collection of website design projects"
                  loading="lazy"
                />
              </aside>
              <div className="contact-content">
                <Art name="corner" className="corner" />
                <h2 id="contact-title">Ready to Start Your Project?</h2>
                <p className="contact-intro">
                  Fill in the form below and let's create something amazing
                  together.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer dotted">
        <div className="shell">
          <div className="footer-main">
            <div className="footer-company">
              <a href="#home" aria-label="NEXUS home">
                <Art name="logo" className="footer-logo" alt="NEXUS." />
              </a>
              <p className="address">Remote studio · Worldwide</p>
              <div className="contact-details">
                <a href="tel:+88888888">Phone: +88888888</a>
                <a className="email" href="mailto:taboopip@gmail.com">
                  Email: taboopip@gmail.com
                </a>
              </div>
            </div>
            <div className="footer-navigation">
              <Nav onInfo={setInfo} />
            </div>
          </div>
          <div className="footer-bar">
            <p>NEXUS® ©2026 All rights reserved</p>
            <nav aria-label="Legal information">
              {["Privacy Policy", "Terms of Service"].map((name) => (
                <button onClick={() => setInfo(name)} key={name}>
                  {name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setInfo(null)}
        onClose={() => setInfo(null)}
        onClick={(event) => {
          if (event.target === dialog.current) setInfo(null);
        }}
        aria-labelledby="dialog-title"
      >
        <div className="dialog-content">
          <button
            className="dialog-close"
            aria-label="Close dialog"
            onClick={() => setInfo(null)}
          >
            <FiX />
          </button>
          <h2 id="dialog-title">{info}</h2>
          <p>{information[info]}</p>
          {info === "Privacy Policy" && (
            <p className="dialog-link">
              <a href="https://formsubmit.co/privacy" target="_blank" rel="noreferrer">
                Read FormSubmit’s privacy terms
              </a>
            </p>
          )}
          <button className="talk" onClick={() => setInfo(null)}>
            Got it
            <span aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  );
}
