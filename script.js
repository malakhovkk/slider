(() => {
  const steps = [...document.querySelectorAll(".step")];
  const slides = [...document.querySelectorAll(".slide")];
  const orbit = document.getElementById("orbit");
  const orbitNav = document.querySelector(".orbit-nav");
  const buttons = [...document.querySelectorAll(".orbit-button")];
  const mobileCurrent = document.getElementById("mobileCurrent");
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  let active = 0;
  let ticking = false;

  function isMobile() {
    return mobileQuery.matches;
  }

  function goTo(index) {
    const target = isMobile() ? slides[index] : steps[index];
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setActive(index) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    orbitNav.classList.toggle("is-slide-1", index === 0);
    orbitNav.classList.toggle("is-slide-2", index === 1);
    orbitNav.classList.toggle("is-slide-3", index === 2);
    if (index === active && slides[index].classList.contains("is-active")) return;

    const previous = active;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.classList.toggle("was-before", i < index);
      slide.setAttribute("aria-hidden", !isMobile() && i !== index ? "true" : "false");
    });
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.classList.toggle("is-active", selected);
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    document.querySelectorAll(".orbit-label").forEach((label) => {
      const selected = Number(label.dataset.target) === index;
      label.classList.toggle("is-active", selected);
      if (selected) label.setAttribute("aria-current", "true");
      else label.removeAttribute("aria-current");
    });

    // Rotate the wheel so the selected icon moves into the center/rightmost position.
    orbit.style.transform = `rotate(${-index * 120}deg)`;
    // Keep each icon upright while the wheel itself rotates.
    buttons.forEach((button) => {
      const angle = Number(button.dataset.target) * 120;
      button.querySelector(".orbit-icon").style.transform = `rotate(${index * 120}deg)`;
    });
    mobileCurrent.textContent = String(index + 1).padStart(2, "0");
    active = index;
  }

  function updateFromScroll() {
    const viewportCenter = window.innerHeight * 0.5;
    let closest = 0;
    let smallest = Infinity;
    const markers = isMobile() ? slides : steps;
    markers.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < smallest) { smallest = distance; closest = index; }
    });
    setActive(closest);
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", updateFromScroll);

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.target);
      goTo(index);
    });
  });
  document.querySelectorAll(".orbit-label, .orbit-side, .orbit-center").forEach((control) => {
    control.addEventListener("click", () => {
      const index = Number(control.dataset.target);
      goTo(index);
    });
  });

  // Keyboard access: left/right arrows move between slides when focus is in the nav.
  document.querySelector(".orbit-nav").addEventListener("keydown", event => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goTo(Math.min(active + 1, steps.length - 1));
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goTo(Math.max(active - 1, 0));
    }
  });

  updateFromScroll();
})();