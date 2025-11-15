document.addEventListener('DOMContentLoaded', function () {
  // ===== PARTICLES ANIMATION =====
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = Math.random() > 0.5 ? 'rgba(0,255,255,' : 'rgba(255,0,255,';
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ===== SCROLL INDICATOR =====
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    });

    // click to scroll down
    scrollIndicator.addEventListener('click', function () {
      window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
    });
  }

  // ===== SCROLL TO TOP BUTTON =====
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // NAV TOGGLE (if present)
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    // Toggle menu open/close
    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('nav-links--open');
      // ensure aria-expanded is a string "true"/"false"
      toggle.setAttribute('aria-expanded', String(isOpen));
      // lock body scrolling when menu is open on mobile
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked (mobile)
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Accessibility: close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking/tapping outside the nav (mobile)
    document.addEventListener('click', function (e) {
      const isOpen = navLinks.classList.contains('nav-links--open');
      if (!isOpen) return;
      // if the click target is not inside the nav or the toggle, close the menu
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('nav-links--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ===== Terminal typewriter effect =====
  const termEl = document.getElementById('term-lines');
  const caret = document.getElementById('term-caret');
  const termInput = document.getElementById('term-input');

  if (termEl && caret) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lines = [
      { type: 'cmd', text: 'kimeddy@portfolio:~$ whoami' },
      { type: 'out', text: 'Kim Eddy — Futuristic Full-Stack Developer' },
      { type: 'cmd', text: 'kimeddy@portfolio:~$ skills --top' },
      { type: 'out', text: 'JavaScript • Node.js • React • Python • DevOps' },
      { type: 'cmd', text: 'kimeddy@portfolio:~$ open projects' },
      // mark this output with a link target so we can make it clickable
      { type: 'out', text: 'Showing latest projects... ', link: '#projects', linkText: 'Open projects' }
    ];

  // If reduced motion, render all lines statically
  // Disable input while intro renders, enable/focus after
  if (termInput) termInput.disabled = true;
  if (prefersReduced) {
      lines.forEach(line => {
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.type === 'cmd' ? 'cmd' : 'out');
        div.textContent = line.text;
        // if the line has a link, append it
        if (line.link) {
          const a = document.createElement('a');
          a.href = line.link;
          a.className = 'term-link';
          a.textContent = line.linkText || line.link;
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            const target = document.querySelector(line.link);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          });
          div.appendChild(document.createTextNode(' '));
          div.appendChild(a);
        }
        termEl.appendChild(div);
      });
      caret.classList.add('blink');
      // enable prompt for interaction
      if (termInput) {
        termInput.disabled = false;
        termInput.focus();
      }
      // hide the decorative typing caret since input provides native caret
      if (caret) caret.style.display = 'none';
    } else {
      // typing animation
      let lineIdx = 0;

      const typeSpeed = 28; // ms per char
      const pauseAfterLine = 700; // ms

      function typeLine(line, cb) {
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.type === 'cmd' ? 'cmd' : 'out');
        termEl.appendChild(div);
        let i = 0;
        function step() {
          if (i <= line.text.length - 1) {
            div.textContent += line.text.charAt(i);
            i += 1;
            setTimeout(step, typeSpeed);
            // ensure caret visible while typing
            caret.classList.add('blink');
          } else {
            // done
            // if this line includes a link, append a clickable element after typing
            if (line.link) {
              const a = document.createElement('a');
              a.href = line.link;
              a.className = 'term-link';
              a.textContent = line.linkText || line.link;
              a.addEventListener('click', function (ev) {
                ev.preventDefault();
                const target = document.querySelector(line.link);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              });
              div.appendChild(document.createTextNode(' '));
              div.appendChild(a);
            }
            if (typeof cb === 'function') cb();
          }
        }
        step();
      }

      function runSequence() {
        if (lineIdx >= lines.length) {
          // intro finished: enable prompt and focus
          if (termInput) {
            termInput.disabled = false;
            termInput.focus();
          }
          if (caret) {
            caret.classList.add('blink');
            // hide decorative caret since input has native caret
            caret.style.display = 'none';
          }
          return;
        }
        const current = lines[lineIdx];
        typeLine(current, function () {
          lineIdx += 1;
          setTimeout(runSequence, pauseAfterLine);
        });
      }

      // kick off
      runSequence();
    }

    // --- CLI: basic interactive behavior ---
    if (termInput) {
      // session-backed history
      const STORAGE_KEY = 'terminalHistory_v1';
      let history = [];
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        history = raw ? JSON.parse(raw) : [];
      } catch (err) {
        history = [];
      }
      let histIndex = history.length;

      // autocomplete commands
      const COMMANDS = ['help','projects','open','skills','about','contact','resume','clear'];

      // try to load projects from the #projects DOM; fall back to sample data
      const projectsData = (function loadProjectsFromDOM() {
        try {
          const container = document.querySelector('#projects');
          const found = [];
          if (container) {
            // look for common project item selectors
            const items = container.querySelectorAll('.project, .project-card, .project-item, article');
            items.forEach(node => {
              // title: h2/h3/h4 or data-title or first anchor text
              let titleEl = node.querySelector('h3, h2, h4');
              let title = titleEl ? titleEl.textContent.trim() : (node.getAttribute('data-title') || '').trim();
              if (!title) {
                const a = node.querySelector('a');
                if (a) title = a.textContent.trim();
              }
              // description: p or data-desc
              let descEl = node.querySelector('p');
              let desc = descEl ? descEl.textContent.trim() : (node.getAttribute('data-desc') || '').trim();
              // tech: .tech list items or data-tech
              const tech = [];
              const techNodes = node.querySelectorAll('.tech li, .tech span');
              if (techNodes && techNodes.length) {
                techNodes.forEach(tn => tech.push(tn.textContent.trim()));
              } else if (node.getAttribute('data-tech')) {
                node.getAttribute('data-tech').split(',').forEach(t => tech.push(t.trim()));
              }
              // href: first anchor href or data-href or default to #projects
              let href = '#projects';
              const linkEl = node.querySelector('a');
              if (linkEl && linkEl.getAttribute('href')) href = linkEl.getAttribute('href');
              if (title) {
                found.push({ title: title, desc: desc || '', tech: tech.length ? tech : ['Website'], href: href });
              }
            });
          }
          if (found.length) return found;
        } catch (err) {
          // ignore and fall back
        }
        // fallback sample data
        return [
          {
            title: 'Neon Tasks',
            desc: 'A realtime task manager with WebSocket sync and offline-first support.',
            tech: ['React','Node.js','WebSocket'],
            href: '#projects'
          },
          {
            title: 'Orbital UI',
            desc: 'Design system and component library for futuristic interfaces.',
            tech: ['TypeScript','Styled Components'],
            href: '#projects'
          },
          {
            title: 'Photon API',
            desc: 'High-performance GraphQL API with caching and observability.',
            tech: ['GraphQL','Kubernetes'],
            href: '#projects'
          }
        ];
      })();

      function appendLine(text, kind = 'out') {
        const d = document.createElement('div');
        d.className = 'term-line ' + (kind === 'cmd' ? 'cmd' : 'out');
        d.textContent = text;
        termEl.appendChild(d);
        // keep view scrolled to bottom
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function appendProjectCard(p) {
        const d = document.createElement('div');
        d.className = 'term-line out project-card';

        const title = document.createElement('div');
        title.className = 'project-title';
        title.textContent = p.title;

        const desc = document.createElement('div');
        desc.className = 'project-desc';
        desc.textContent = p.desc;

        const meta = document.createElement('div');
        meta.className = 'project-meta';
        p.tech.forEach(t => {
          const b = document.createElement('span');
          b.className = 'project-tech';
          b.textContent = t;
          meta.appendChild(b);
        });

        const link = document.createElement('a');
        link.className = 'project-link';
        link.href = p.href || '#projects';
        link.textContent = 'View →';
        link.addEventListener('click', function(ev){
          ev.preventDefault();
          if (p.href && p.href.startsWith('#')) {
            const target = document.querySelector(p.href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          } else if (p.href) {
            // external link: open in new tab
            window.open(p.href, '_blank', 'noopener');
          }
        });

        d.appendChild(title);
        d.appendChild(desc);
        d.appendChild(meta);
        d.appendChild(link);
        termEl.appendChild(d);
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function appendLinkLine(text, href, linkText) {
        const d = document.createElement('div');
        d.className = 'term-line out';
        d.textContent = text + ' ';
        const a = document.createElement('a');
        a.href = href;
        a.className = 'term-link';
        a.textContent = linkText || href;
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
        d.appendChild(a);
        termEl.appendChild(d);
        d.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      function handleCommand(raw) {
        const cmd = (raw || '').trim();
        if (!cmd) return;
        // echo command
        appendLine('kimeddy@portfolio:~$ ' + cmd, 'cmd');

        const parts = cmd.split(/\s+/);
        const base = parts[0].toLowerCase();

        switch (base) {
          case 'help':
            appendLine('Available commands: help, projects, open <section>, skills, about, contact, resume, clear');
            break;
          case 'projects':
            appendLine('Showing projects:');
            // render project cards in-terminal
            projectsData.forEach(p => appendProjectCard(p));
            break;
          case 'open':
            if (parts[1]) {
              const target = document.querySelector('#' + parts[1]);
              if (target) {
                appendLine('Opening ' + parts[1] + '...');
                target.scrollIntoView({ behavior: 'smooth' });
              } else {
                appendLine('Section not found: ' + parts[1]);
              }
            } else {
              appendLine('Usage: open <section>');
            }
            break;
          case 'skills':
            appendLine('JavaScript • Node.js • React • Python • DevOps');
            break;
          case 'about':
            appendLine('I build futuristic web apps — scroll to About for more.');
            const about = document.querySelector('#about');
            if (about) about.scrollIntoView({ behavior: 'smooth' });
            break;
          case 'contact':
            appendLine('Email: ');
            // mailto link
            const mailDiv = document.createElement('div');
            mailDiv.className = 'term-line out';
            const mailA = document.createElement('a');
            mailA.href = 'mailto:kim@example.com';
            mailA.textContent = 'kim@example.com';
            mailA.className = 'term-link';
            mailDiv.appendChild(mailA);
            termEl.appendChild(mailDiv);
            mailDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
            break;
          case 'resume':
            appendLinkLine('Resume:', '/assets/resume.pdf', 'Download resume');
            break;
          case 'clear':
            termEl.innerHTML = '';
            break;
          default:
            appendLine("Command not found: '" + cmd + "'. Try 'help'.");
        }
      }

      // key handling (Enter, ArrowUp/Down for history, Tab for autocomplete)
      termInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const v = termInput.value;
          // push to history (and store in sessionStorage)
          if (v.trim()) {
            history.push(v);
            histIndex = history.length;
            try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (err) { /* ignore */ }
          }
          handleCommand(v);
          termInput.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length === 0) return;
          histIndex = Math.max(0, (histIndex <= 0 ? history.length - 1 : histIndex - 1));
          termInput.value = history[histIndex] || '';
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (history.length === 0) return;
          histIndex = Math.min(history.length - 1, histIndex + 1);
          termInput.value = history[histIndex] || '';
        } else if (e.key === 'Tab') {
          // autocomplete
          e.preventDefault();
          const cur = termInput.value.trim();
          if (!cur) return;
          const matches = COMMANDS.filter(c => c.startsWith(cur.toLowerCase()));
          if (matches.length === 1) {
            termInput.value = matches[0] + (matches[0] === 'open' ? ' ' : ' ');
          } else if (matches.length > 1) {
            // show suggestion line
            appendLine('Suggestions: ' + matches.join(', '));
          }
        }
      });
    }
  }

});
