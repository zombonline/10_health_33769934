document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navUserToggle");
  const dropdown = document.getElementById("navUserDropdown");
  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
});
