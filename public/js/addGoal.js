document.getElementById("goalType").addEventListener("change", function () {
    const type = this.value;

    const distanceWrapper = document.getElementById("distanceWrapper");
    const distanceLabel = document.getElementById("distanceLabel");

    const paceWrapper = document.getElementById("paceWrapper");

    paceWrapper.style.display = "none";
    distanceWrapper.style.display = "block";

    if (type === "single") {
        distanceLabel.textContent = "Target Distance (km) — Single Run";
        document.getElementById("targetDistanceKm").placeholder = "e.g. 10";
    }

    if (type === "total") {
        distanceLabel.textContent = "Total Distance to Accumulate (km)";
        document.getElementById("targetDistanceKm").placeholder = "e.g. 100";
    }

    if (type === "pace") {
        distanceLabel.textContent = "Distance for Pace Goal (km)";
        document.getElementById("targetDistanceKm").placeholder = "e.g. 5";
        paceWrapper.style.display = "block";
    }
});
