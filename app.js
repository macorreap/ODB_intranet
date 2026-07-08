const embedPanel = document.querySelector("#embed-panel");
const embedFrame = document.querySelector("#embed-frame");
const embedTitle = document.querySelector("#embed-title");
const embedOpenLink = document.querySelector("#embed-open-link");
const embedClose = document.querySelector("#embed-close");
const embeddedLinks = document.querySelectorAll("[data-embed-url]");

function openEmbed(event) {
  event.preventDefault();

  const link = event.currentTarget;
  const url = link.dataset.embedUrl || link.href;
  const title = link.dataset.embedTitle || link.textContent.trim();

  embedTitle.textContent = title;
  embedOpenLink.href = url;
  embedFrame.src = url;
  embedPanel.classList.add("is-open");
  embedPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  embedClose.focus();
}

function closeEmbed() {
  embedPanel.classList.remove("is-open");
  embedPanel.setAttribute("aria-hidden", "true");
  embedFrame.src = "about:blank";
  document.body.style.overflow = "";
}

embeddedLinks.forEach((link) => {
  link.addEventListener("click", openEmbed);
});

embedClose.addEventListener("click", closeEmbed);

embedPanel.addEventListener("click", (event) => {
  if (event.target === embedPanel) closeEmbed();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && embedPanel.classList.contains("is-open")) {
    closeEmbed();
  }
});
