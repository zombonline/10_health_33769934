// Save scroll position before leaving the page
window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("scrollPos", window.scrollY);
});

// Restore scroll position on load IF we came from a reload/redirect
window.addEventListener("load", () => {
    const pos = sessionStorage.getItem("scrollPos");
    if (pos !== null) {
        window.scrollTo(0, parseInt(pos));
        sessionStorage.removeItem("scrollPos"); 
    }
});
