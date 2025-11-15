document.addEventListener('DOMContentLoaded', function () {
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
          caret.classList.add('blink');
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
  }

});
